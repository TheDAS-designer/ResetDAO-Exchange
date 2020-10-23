import Web3 from 'web3'
import { 
	web3Loaded, 
	web3AccountLoaded, 
	tokenLoaded, 
	exchangeLoaded,
	cancelledOrdersLoaded,
	filledOrdersLoaded,
	allOrdersLoaded,
	cancellingOrder,
	orderCancelled,
	fillingOrder,
	filledOrder,
	loadExchangeEther,
	loadExchangeToken,
	loadTokenBalance,
	web3LoadEtherBalance,
	balancesLoaded,
	withdrawLoaded,
	balancesLoading,
	withdrawLoading,
	balancesDeposited,
	web3EtherDeposited,
	tokenType,
	orderMaking,
	orderMaded,
	showOrderMaking
} from './actions'
import Token from '../abis/token'
import Exchange from '../abis/Exchange'
import { ETHER_ADDRESS } from '../helper'

const wait = (seconds) => {
	const milliseconds = seconds * 1000
	return new Promise(resolve => setTimeout(resolve, milliseconds))
}

let web3Local, accountLocal, tokenLocal, exchangeLocal, makeOrderType, topOrderId

export  const loadWeb3 = (dispatch) => {
	const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:7545')
	web3Local = web3
	dispatch(web3Loaded(web3))
	return web3
}


export const loadAccount = async (web3, dispatch) => {
	const accounts = await web3.eth.getAccounts()
	const account = accounts[0]
	accountLocal = account
	dispatch(web3AccountLoaded(account))
	return account
}

export const loadToken = async (web3, networkId, dispatch) => {
	try{
		const token = await new web3.eth.Contract(Token.abi, Token.networks[networkId].address)
		tokenLocal = token
		dispatch(tokenLoaded(token))
		return token
	}catch(error){
		console.log('Contract not deployed to the current network. Please select anthor network with MetaMask',error)
	}
	
	return null
}

export const loadExchange = async (web3, networkId, dispatch) => {
	
	try{
		const exchange = await new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address)
		exchangeLocal = exchange
		dispatch(exchangeLoaded(exchange))
		return exchange
	}catch(error){
		console.log('Contract not deployed to the current network. Please select anthor network with MetaMask')
	}
	
	return null

}


export const loadOrders = async (exchange, dispatch) => {
	
	const cancelStream = await exchange.getPastEvents('CancelOrder', { fromBlock:0 ,toBlock:'latest'})
	const cancelledOrders = cancelStream.map((event) => event.returnValues)
	dispatch(cancelledOrdersLoaded(cancelledOrders))

	const fillStream = await exchange.getPastEvents('Trade', { fromBlock:0 ,toBlock:'latest'})
	const filledOrders = fillStream.map((event) => event.returnValues)
	dispatch(filledOrdersLoaded(filledOrders))

	const allStream = await exchange.getPastEvents('Order', { fromBlock:0 ,toBlock:'latest'})
	const allOrders = allStream.map((event) => event.returnValues)
	dispatch(allOrdersLoaded(allOrders))
}

export const orderCancelling = async (exchange, order, account, dispatch ) => {
	exchange.methods.cancelOrder(order.id).send({from: account})
		.on('transactionHash',(hash) => {
			dispatch(cancellingOrder(order.id))
		})
		.on('error',(error) => {
			console.log(error)
			window.alert('There is an Error...')
		})
}

//event listener to CancelOrder
export const subscribeToCancelOrderEvent = async (exchange, dispatch, args = {}) => {

	const { account, orderId } = args
	if(!account || !orderId) return null

	await wait(1.5)

	const height = await web3Local.eth.getBlockNumber()


	await exchange.events.CancelOrder({filter: {user: account, id: orderId}, fromBlock: height}, (error, event) => {
		console.log('subscribeToCancelOrder')
		dispatch(orderCancelled(event.returnValues))
	})
}
//event listener to Trade
export const subscribeToTradeEvent = async (exchange, dispatch, args = {}) => {
	const { account, orderId } = args
	if(!account || !orderId) return null

	await wait(1.5)

	const height = await web3Local.eth.getBlockNumber()
	await exchange.events.Trade({filter: {userFill: account, id: orderId }, fromBlock:height}, (error, event) => {
		//console.log('subscribeToTradeEvent')
			dispatch(filledOrder(event.returnValues))
		})
}


//event listener to ETH Deposit
export const subscribeToDepositEvent = async (user, token, web3, exchange, dispatch, tokenType) => {
		 if(!user) return false
		 
		 await wait(1.5)

		 const height = await web3.eth.getBlockNumber()
		 //console.log('subscribeToDepositEvent :', user, token, web3, exchange, dispatch, tokenType, height)
		 await exchange.events.Deposit( {filter:{user, token: tokenType}, fromBlock:height }, (error, event) => {
		 		loadedBalances(exchange, web3, token, user, dispatch)
		 })
	}



//event listener to ETH Withdraw
export const subscribeToWithdrawEvent = async (user, token, web3, exchange, dispatch, tokenType) => {
		 if(!user) return false
		 await wait(1.5)
		 const height = await web3.eth.getBlockNumber()
		 await exchange.events.Withdraw( {filter:{user, token: tokenType}, fromBlock:height }, (error, event) => {
		 		loadedBalances(exchange, web3, token, user, dispatch)
		 })
	}

//下单监听
export const subscribeToMakeOrderEvent = async (dispatch) => {
		 await wait(1.5)

		 const height = await web3Local.eth.getBlockNumber()
		 console.log('subscribeToMakeOrderEvent :', topOrderId)
		 await exchangeLocal.events.Order( {filter:{user: accountLocal, tokenGive: makeOrderType}, fromBlock:height }, (error, event) => {
		 		const order = event.returnValues
		 		console.log('exchangeLocal.events.Order :', order)
		 		if(order.id > topOrderId){
		 			dispatch(orderMaded(order))
		 		}else{
		 			subscribeToMakeOrderEvent(dispatch)
		 		}

		 		
		 })
	}
// Handler for subscribe to  make Order 
function makeOrderEventHandler(dispatch){
	
}


export const orderFilling = async (exchange, order, account, dispatch ) => {
	exchange.methods.fillOrder(order.id).send({from: account})
	/*从回调调用fillingOrder方法而不是filled从而开始想到为什么需要event监听，难道这个
		回调函数并不是event吗？不是已经上链才回调的吗？如果不是那又代表什么？如果是event
		那后面的步骤岂不是没有意义，编辑这个教程的人应该不会做这种违背常理而又没意义的事情吧

		TODO:在想到这个之前我正在给监听trade的方法准备orderId参数 为了能及时刷新
	*/
		.on('transactionHash',(hash) => {
			dispatch(fillingOrder(order.id)) 
		})
		.on('error',(error) => {
			console.log(error)
			window.alert('There is an orderFilling Error...')
		})
}

export const loadedBalances = async (exchange, web3, token, account, dispatch) => {
	const etherBalance = await web3.eth.getBalance(account)
	dispatch(web3LoadEtherBalance(etherBalance))

	const echangeEtherBalance = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call()
	console.log('echangeEtherBalance :',echangeEtherBalance)
	dispatch(loadExchangeEther(echangeEtherBalance))

	const echangeTokenBalance = await exchange.methods.balanceOf(token.options.address, account).call()
	dispatch(loadExchangeToken(echangeTokenBalance))

	const tokenBalance = await token.methods.balanceOf(account).call()
	dispatch(loadTokenBalance(tokenBalance))

	dispatch(balancesLoaded())
	dispatch(withdrawLoaded())

}

export const etherDeposit = async (exchange, web3, account, dispatch, etherChanged, isBalancesLoaded) => {
	if(!isBalancesLoaded) return null
	
	 await exchange.methods.depositEther().send({from:account, value: web3.utils.toWei(etherChanged, 'ether')})
	.on('transactionHash',(hash) => {
			//console.log('balancesLoadingbalancesLoadingbalancesLoading')
			dispatch(balancesLoading())
		})
	.on('error',(error) => {
			console.log(error)
			window.alert('There is an etherDeposit Error...')
		})
}

export const tokenDeposit = async (exchange, web3, account, dispatch, tokenChanged, isBalancesLoaded, token) => {
	if(!isBalancesLoaded) return null
	
	const amount = web3.utils.toWei(tokenChanged, 'ether')
	//console.log('interactions.js tokenDeposit token.options.address :', token.options.address)
	await token.methods.approve(exchange.options.address, amount).send({from:account})
	await exchange.methods.depositToken(token.options.address, amount).send({from:account})
	.on('transactionHash',(hash) => {
			dispatch(balancesLoading())
		})
	.on('error',(error) => {
			console.log(error)
			window.alert('There is an etherDeposit Error...')
		})
}


const  checkToken = async (exchange, account, amount, tokenType) => {
	const echangeEtherBalance = await exchange.methods.balanceOf(tokenType, account).call()
	

	console.log('echangeEtherBalance amount :',echangeEtherBalance, amount)
	if (web3Local.utils.toBN(echangeEtherBalance).sub(web3Local.utils.toBN(amount)) < 0 ){
		console.log('echangeEtherBalance < amount')
		throw new Error('TOKEN NOT ENOUGH!!')
	}
}


export const etherWithdraw = async (exchange, web3, account, dispatch, etherChanged, isBalancesLoaded) =>{
	if(!isBalancesLoaded) return null
	 
	//check if the acount has enough ether to withdraw
	const amount = web3.utils.toWei(etherChanged, 'ether')
	try{
		checkToken(exchange, account, amount, ETHER_ADDRESS)
	}catch(error){
		console.log(error)
		window.alert(error)
		return null
	}
	 await exchange.methods.withdrawEther().send({from:account, value: amount})
	
	.on('transactionHash',(hash) => {
			//console.log('balancesLoadingbalancesLoadingbalancesLoading')
			dispatch(withdrawLoading())
		})
	.on('error',(error) => {
			console.log(error)
			window.alert('There is an etherDeposit Error...')
		})
}

export const tokenWithdraw = async(exchange, web3, account, dispatch, tokenChanged, isBalancesLoaded, token) => {
	if(!isBalancesLoaded) return null
	if(!token) return null
	//check if the acount has enough token to withdraw
	const amount = web3.utils.toWei(tokenChanged, 'ether')
	try{
		checkToken(exchange, account, amount, token.options.address.toString())
	}catch(error){
		console.log(error)
		window.alert(error)
		return null
	}

	//console.log('tokenWithdraw :', isBalancesLoaded )
	
	await exchange.methods.withdrawToken(token.options.address, amount).send({from:account})
	.on('transactionHash',(hash) => {
		//console.log('withdrawToken :', amount )
			dispatch(withdrawLoading())
		})
	.on('error',(error) => {
			console.log(error)
			window.alert('There is an etherDeposit Error...')
		})
}


export const makeBuyOrder = async (dispatch, buyPrice, buyAmount)=> {
	dispatch(showOrderMaking())

	if(buyPrice <=0 || buyAmount <= 0) return false
	
	//check if the acount has enough Ether to make order
	
	const amountGive = web3Local.utils.toWei((buyPrice * buyAmount).toString(),'ether')

	try{
		checkToken(exchangeLocal, accountLocal, amountGive, ETHER_ADDRESS)
	}catch(e){
		console.log(e.name+': '+e.message)
		window.alert(e.name+': '+e.message)
		dispatch(orderMaded())
	}

	const tokenGive = ETHER_ADDRESS
	
	const tokenGet =  tokenLocal.options.address.toString()
	const amountGet = web3Local.utils.toWei(buyAmount, 'ether')
	makeOrderType = tokenGive


	const height = await web3Local.eth.getBlockNumber()
	const allStream = await exchangeLocal.getPastEvents('Order', { fromBlock:height ,toBlock:'latest'})
	const topOrders = allStream.map((event) => event.returnValues)
	topOrderId = topOrders[0].id

	await exchangeLocal.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({from: accountLocal})
	.on('transactionHash',(hash) => {
		//console.log('withdrawToken :', amount )
			dispatch(orderMaking())
		})
	.on('error',(error) => {
			dispatch(orderMaded())
			console.log(error)
			window.alert('There is an etherDeposit Error...')
		})
}

export const makeSellOrder = async (dispatch, sellPrice, sellAmount)=> {
	dispatch(showOrderMaking())

	if(sellPrice <=0 || sellAmount <= 0) return false

	//check if the acount has enough Token to make order
	
	const amountGive = web3Local.utils.toWei(sellAmount, 'ether') 

	try{
		checkToken(exchangeLocal, accountLocal, amountGive, tokenLocal.options.address.toString())
	}catch(error){
		console.log(error)
		window.alert(error)
		return null
	}

	
	const amountGet = web3Local.utils.toWei((sellPrice * sellAmount).toString(),'ether')
	const tokenGet  =  ETHER_ADDRESS
	const tokenGive = tokenLocal.options.address.toString()
	
	makeOrderType = tokenGive


	const height = await web3Local.eth.getBlockNumber()
	const allStream = await exchangeLocal.getPastEvents('Order', { fromBlock:height ,toBlock:'latest'})
	const topOrders = allStream.map((event) => event.returnValues)
	topOrderId = topOrders[0].id

	await exchangeLocal.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({from: accountLocal})
	.on('transactionHash',(hash) => {
		//console.log('withdrawToken :', amount )
			dispatch(orderMaking())
		})
	.on('error',(error) => {
			dispatch(orderMaded())
			console.log(error)
			window.alert('There is an etherDeposit Error...')
		})
}