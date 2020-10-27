import { get , groupBy, reject, maxBy, minBy} from 'lodash'
import { createSelector } from 'reselect'
import { ETHER_ADDRESS, ether, tokens, GREEN, RED, formatBalance} from '../helper.js'
import moment from 'moment'

//web3Selector

const web3 = state => get(state, 'web3.connection')
export const web3Selector = createSelector(web3, w => w)

//etherBalanceSelector
const etherBalance = state => get(state, 'web3.balance',0)
export const etherBalanceSelector = createSelector(etherBalance, 
	(ether) => {
	return formatBalance(ether)
})


const account = state => get(state, 'web3.account')
export const accountSelector = createSelector(account, a => { 
console.log('account a:',a) 
return a})


const tokenLoaded = state => get(state, 'token.loaded')
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl)


//tokenContractSelector
const tokenContract = state => get(state, 'token.contract')
export const tokenContractSelector = createSelector(tokenContract, tc => tc)

//tokenBalanceSelector
const tokenBalance = state => get(state, 'token.balance',0)
export const tokenBalanceSelector = createSelector(tokenBalance, 
	(token1) => {
	return formatBalance(token1)
})


const exchangeLoaded = state => get(state, 'exchange.loaded')
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el)

const exchangeContract = state => get(state, 'exchange.contract')
export const exchangeContractSelector = createSelector(exchangeContract, ec => ec)

export const contractLoadedSelector = createSelector(
		tokenLoadedSelector,
		exchangeLoadedSelector,
		(tl, el) => (tl && el)
	)


//exchangeEtherBalanceSelector
const exchangeEther = state => get(state, 'exchange.etherBalanceExchange', 0)
export const exchangeEtherBalanceSelector = createSelector(exchangeEther, 
	(ether) => {
	console.log('state => get(state, exchange.etherBalance, 0) ether: ',ether)
	return formatBalance(ether)
})

//exchangeTokenBalanceSelector
const exchangeToken = state => get(state, 'exchange.tokenBalanceExchange', 0)
export const exchangeTokenBalanceSelector = createSelector(exchangeToken, 
	(token) => {
	return formatBalance(token)
})


const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false)

export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

const filledOrders = state => get(state, 'exchange.filledOrders.data', [])
export const filledOrdersSelector = createSelector(
		filledOrders, 
		(orders) => {
			orders = orders.sort((a,b) => a.timestamp - b.timestamp ) 
			orders = decoratFilledOrders(orders)
			
			return orders 
	})

const decoratFilledOrders = (order) =>{
	let previousOrder = order[0]
	return (
				order.map((order) => {

					 order = decoratOrder(order)
					 order = decoratFilledOrder(order, previousOrder)
					 previousOrder = order
					 return order
				})

		)
	
}
const decoratOrder = (order) => {
	let etherAmount
	let tokenAmount

	if(order.tokenGive === ETHER_ADDRESS){
		etherAmount = order.amountGive
		tokenAmount = order.amountGet
	}else{
		etherAmount = order.amountGet
		tokenAmount = order.amountGive
	}

	const precision = 10000
	let tokenPrice
	tokenPrice = etherAmount/tokenAmount
	tokenPrice = Math.round( tokenPrice * precision) /precision

	const formattedTimestamp = moment.unix(order.timestamp).format('h:mm:ss a M/D');

	return ({
		...order,
		etherAmount:ether(etherAmount),
		tokenAmount:tokens(tokenAmount),
		tokenPrice,
		formattedTimestamp
	})
}


const decoratFilledOrder = (order, previousOrder) => {
	return ({
			...order,
			tokenPriceClass:tokenPriceClass(order.tokenPrice,previousOrder)
		})

}

const tokenPriceClass = (tokenPrice, previousOrder) => {
	if(previousOrder.tokenPrice <= tokenPrice){
		return GREEN
	}else{
		return RED
	}
}


//Cancelled Orders
const cancelledOrdersLoaded = (state) => get(state,'exchange.cancelledOrders.loaded')
export const cancelledOrdersLoadedSelector = createSelector(cancelledOrdersLoaded, cl => cl)

const cancelledOrders = (state) => get(state,'exchange.cancelledOrders.data')
export const cancelledOrdersSelector = createSelector(cancelledOrders, co => co)

//All orders 
const allOrdersLoaded = (state) => get(state,'exchange.allOrders.loaded')
export const allOrdersLoadedSelector = createSelector(allOrdersLoaded, al => al)

const allOrders = (state) => get(state,'exchange.allOrders.data')
export const allOrdersSelector = createSelector(allOrders, ao => ao)


//Order book
const orderBookLoaded = (state) => ((cancelledOrdersLoaded(state) && filledOrdersLoaded(state) && allOrdersLoaded(state) )|| false)
export const orderBookLoadedSelector = createSelector(orderBookLoaded, ol => ol)


const decoratOrderBook = order => {
	const orderType = order.tokenGive === ETHER_ADDRESS ?'buy':'sell'
	return ({
		...order,
		orderType,
		orderTypeClass: (orderType ==='buy'? GREEN: RED),
		orderFillAction: (orderType === 'buy'? 'sell': 'buy')
	})
}

const decoratOrderBookOrders = (orders) => {
	return(orders.map((order) => {
		order = decoratOrder(order)
		order = decoratOrderBook(order)
		return order
	}))
}



const openOrders = state => {
		const _allOrders =  allOrders(state)
		const _cancelledOrders = cancelledOrders(state)
		const _fillOrders = filledOrders(state)

		const _openOrders = reject(_allOrders, (order) => {
			const cancelled = _cancelledOrders.some((o) => order.id === o.id) 
			const filled = _fillOrders.some( (o) => order.id === o.id)
			return (cancelled || filled)
	})

	return _openOrders
}

export const orderBookSelector = createSelector(
	openOrders,
	(orders) => {

		orders = decoratOrderBookOrders(orders)
		orders = groupBy(orders, 'orderType')
		orders = {
			...orders,
			buy: get(orders,'buy', []).sort((a,b) => b.tokenPrice - a.tokenPrice ),
			sell: get(orders,'sell', []).sort((a,b) => b.tokenPrice - a.tokenPrice )
		}
		return orders
	}
)



const getMyOrderType = (order,account) => {
	const isMyOrder = order.user === account
	let orderType
	if(isMyOrder){
		orderType =  order.tokenGive === ETHER_ADDRESS? 'sell' : 'buy'
	}else{
		orderType =  order.tokenGive === ETHER_ADDRESS? 'buy' : 'sell'
	}

	return orderType
}

const decoratMyfilledOrder = (order,account) => {
	const orderType = getMyOrderType(order,account)
	return ({
		...order,
		orderType,
		orderTypeClass: (orderType ==='buy'? GREEN: RED),
		orderSign: (orderType === 'buy'? '+': '-')
	})
}


const decoratMyfilledOrders = (orders,account) => {
	
	return(
			orders.map((order) => {
				order = decoratMyfilledOrder(order,account)
				order = decoratOrder(order)
				return order
			})
		)
}



export const myFilledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => {
	return loaded
})

export const myFilledOrdersSelector = createSelector(account, filledOrders,(account, orders) => {
	orders = orders.filter((o) => (o.user === account || o.userFill === account))
	orders = orders.sort((a,b) => b.timestamp - a.timestamp)
	//装饰器方法
	orders = decoratMyfilledOrders(orders,account)

	return orders
})



export const myOpeningOrdersLoadedSelector = createSelector(filledOrdersLoaded,a => {
	return a
})




export const myOpeningOrdersSelector = createSelector(
	account,
	openOrders,
	(account, orders) => {
		orders = orders.filter((o) => o.user === account)
		
		orders = decoratMyOrderBookOrders(orders)
		
		orders = orders.sort((a,b) => b.timestamp - a.timestamp)
	
		return orders
	
})

const decoratMyOrderBookOrders = (orders) => {
	return(orders.map((order) => {
		order = decoratOrder(order)
		order = decoratMyOpenOrder(order)
		return order
	}))
}

const decoratMyOpenOrder = (order) => {
	const orderType = order.tokenGive === ETHER_ADDRESS ? 'sell': 'buy'
	return({
		...order,
		orderType,
		orderTypeClass: orderType === 'buy' ? GREEN : RED
	})
}

export const priceChartDataLoadedSelector = createSelector(filledOrdersLoaded,a => a)

export const priceChartDataSelector = createSelector(filledOrders,(orders) => {
	 if(!orders || orders.length === 0) return
		orders = orders.map((order) => {
			order = decoratOrder(order)
			return order
		})
		orders = orders.sort((a,b) => b.timestamp - a.timestamp)
		
		let lastPrice, secondLastPrice, priceDiff
		[lastPrice,secondLastPrice] = orders.slice(orders.length-2, orders.length)
		
		lastPrice = lastPrice.tokenPrice
		secondLastPrice = secondLastPrice.tokenPrice
		priceDiff = lastPrice.tokenPrice - secondLastPrice.tokenPrice >= 0 ? '+' : '-'

		const groups = groupBy(orders, o => moment.unix(o.timestamp).startOf('hour').format())
		const hours = Object.keys(groups)

		console.log('hours :', hours)
		console.log('groups :', groups)

		const data = decoratPriceChartData(hours,groups)
			
		console.log('data :', data)

		return {
			lastPrice,
			secondLastPrice,
			priceDiff,
			series:[{data}]
		}

})

const decoratPriceChartData = (hours,groups) => {
	return(
		hours.map((hour) => {
			const group = groups[hour]
			const firstPirce = group[0].tokenPrice
			const lastPrice = group[group.length - 1].tokenPrice
			const heightPrice = maxBy(group,'tokenPrice').tokenPrice
			const lowPrice = minBy(group,'tokenPrice').tokenPrice
			//const time =  hour.
			console.log('group.timestamp : ', hour)

			return ({x:new Date(hour),
					y:[
						firstPirce,
						heightPrice,
						lowPrice,
						lastPrice
					]
			})
		})
	)
}

const cancellingOrder = state => get(state, 'exchange.cancellingOrder', false)

export const cancellingOrderSelector = createSelector(cancellingOrder,a => a)

//cancellingOrderId
const cancellingOrderId = state => get(state, 'exchange.cancellingOrderId', false)

export const cancellingOrderIdSelector = createSelector(cancellingOrderId,a => a)

const fillingOrder = state => get(state, 'exchange.fillingOrder', false)

export const fillingOrderSelector = createSelector(fillingOrder,a => a)

const fillingOrderId = state => get(state, 'exchange.fillingOrderId')

export const fillingOrderIdSelector = createSelector(fillingOrderId,a => a)





const balanceLoading = state => get(state, 'exchange.balancesLoading', false) //|| get(state, 'web3.balanceLoading', false)
export const balancesLoadingSelector = createSelector(balanceLoading,a => {
	console.log('exchange.balancesLoading :', a)
	return a
})
	
const balancesLoaded = state => get(state, 'exchange.balancesLoaded', false) 
export const balancesLoadedSelector = createSelector(balancesLoaded,a => a)

const etherChanged = state => get(state, 'exchange.etherChanged') 
export const etherChangedSelector = createSelector(etherChanged,a => a)

const tokenChanged = state => get(state, 'exchange.tokenChanged') 
export const tokenChangedSelector = createSelector(tokenChanged,a => a)


const tokenType = state => get(state, 'exchange.tokenType',ETHER_ADDRESS) 
export const tokenTypeSelector = createSelector(tokenType,a => a)



const withdraw = state => get(state, 'exchange.withdraw', false)

export const withdrawSelector = createSelector(withdraw,a => a)


const makeOrder = state => get(state, 'exchange.makeOrder', 0) 
export const makeOrderSelector = createSelector(makeOrder,a => a)