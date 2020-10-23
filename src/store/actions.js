export function web3Loaded(connection){
	return {
		type:'WEB3_LOADED',
		connection
	}
}

export function web3AccountLoaded(account){
	return {
		type:'WEB3_ACCOUNT_LOADED',
		account
	}
}

export function tokenLoaded(token){
	return {
		type:'TOKEN_LOADED',
		token
	}
}

export function exchangeLoaded(exchange){
	return {
		type:'EXCHANGE_LOADED',
		exchange
	}
}

export function cancelledOrdersLoaded(cancelledOrders){
	return {
		type:'CANCELLED_ORDERS_LOADED',
		cancelledOrders
	}
}

export function filledOrdersLoaded(filledOrders){
	return {
		type:'FILLED_ORDERS_LOADED',
		filledOrders
	}
}


export function allOrdersLoaded(allOrders){
	return {
		type:'ALL_ORDERS_LOADED',
		allOrders
	}
}



export function cancellingOrder(orderId){
	return {
		type:'CANCELLING_ORDER',
		orderId
	}
}



export function orderCancelled(orderCancelled){
	return {
		type:'ORDER_CANCELLED',
		orderCancelled
	}
}

//fillingOrder

export function fillingOrder(orderId){
	return {
		type:'FILLING_ORDER',
		orderId
	}
}

//filledOrder
export function filledOrder(order){
	return {
		type:'FILLED_ORDER',
		order
	}
}


//exchangeEther
export function loadExchangeEther(exchangeEther){
	return {
		type:'EXCHANGE_ETHER_BALANCE_LOADED',
		exchangeEther
	}
}

//exchangeToken
export function loadExchangeToken(exchangeToken){
	return {
		type:'EXCHANGE_TOKEN_BALANCE_LOADED',
		exchangeToken
	}
}

//tokenBalance
export function loadTokenBalance(tokenBalance){
	return {
		type:'TOKEN_BALANCE_LOADED',
		tokenBalance
	}
}

//etherBalance
export function web3LoadEtherBalance(etherBalance){
	return {
		type:'WEB3_ETHER_BALANCE_LOADED',
		etherBalance
	}
}
//web3EtherDeposited
export function web3EtherDeposited(result){
	console.log('actions.js  web3EtherDeposited amount :', result)
	if (!result) return
	return {
		type:'WEB3_ETHER_BALANCE_DEPOSITED',
		amount:result.value
	}
}

export function balancesLoading(){
	return {
		type:'BALANCES_LOADING',
	}
}


//balancesLoaded
export function balancesLoaded(){
	return {
		type:'BALANCES_LOADED'
	}
}
//balancesDeposited
export function balancesDeposited(result){
	console.log('interactions.js  subscribeToEvent event.returnValues :', result)
	if(!result) return null
	return {
		type:'BALANCES_DEPOSITED',
		balance:result.balance
	}
}

//etherDepositAmountChanged
export function etherDepositAmountChanged(etherChanged){
	return {
		type:'ETHER_DEPOSIT_AMOUNT_CHANGED',
		etherChanged
	}
}
//tokenDepositAmountChanged
export function tokenDepositAmountChanged(tokenChanged){
	return {
		type:'TOKEN_DEPOSIT_AMOUNT_CHANGED',
		tokenChanged
	}
}


export function tokenType(tokenType){
	return {
		type:'TOKEN_TYPE',
		tokenType
	}
}

export function withdrawLoading(){
	return {
		type:'WITHDRAW_LOADING'
	}
}

export function withdrawLoaded(){
	return {
		type:'WITHDRAW_LOADED'
	}
}

//makeOrderBuyAmount, makeOrderBuyPrice, makeOrderSellAmount, makeOrderSellPrice
export function makeOrderBuyAmount(buyAmount){
	return {
		type:'MAKE_ORDER_BUY_AMOUNT',
		buyAmount
	}
}

export function makeOrderBuyPrice(buyPrice){
	return {
		type:'MAKE_ORDER_BUY_PRICE',
		buyPrice
	}
}

export function makeOrderSellAmount(sellAmount){
	return {
		type:'MAKE_ORDER_SELL_AMOUNT',
		sellAmount
	}
}

export function makeOrderSellPrice(sellPrice){
	return {
		type:'MAKE_ORDER_SELL_PRICE',
		sellPrice
	}
}


export function showOrderMaking(){
	return {
		type:'SHOW_ORDER_MAKING'
	}
}

export function orderMaking(){
	return {
		type:'ORDER_MAKING'
	}
}

//
export function orderMaded(){
	return {
		type:'ORDER_MADED'
	}
}