import { combineReducers } from 'redux'

function web3(state = {}, action){
	switch (action.type){
		case 'WEB3_LOADED':
			return {...state, connection:action.connection}
		case 'WEB3_ACCOUNT_LOADED':
			return {...state, account:action.account}
		case 'WEB3_ETHER_BALANCE_LOADED':
			return {...state, 
				balance: action.etherBalance, 
				balanceLoading: false,
				balancesLoaded: true
				}
		case 'WEB3_ETHER_BALANCE_DEPOSITED':
			return {...state, balance: state.balance - action.amount }
		default:
			return state
	}
}

function token(state = {}, action){
	switch (action.type){
		case 'TOKEN_LOADED':
			return {...state, loaded:true, contract: action.token}
		case 'TOKEN_BALANCE_LOADED':
			return {...state, balance: action.tokenBalance}
		default:
			return state
	}
}

function exchange(state = {}, action){
	let index, data

	switch (action.type){
		case 'EXCHANGE_LOADED':
			return {...state, loaded:true, contract: action.exchange}
		case 'CANCELLED_ORDERS_LOADED':
			return {...state, cancelledOrders:{ loaded:true, data:action.cancelledOrders}}
		case 'FILLED_ORDERS_LOADED':
			return {...state, filledOrders:{ loaded:true, data:action.filledOrders}}
		case 'ALL_ORDERS_LOADED':
			return {...state, allOrders:{loaded:true, data:action.allOrders}}
		case 'CANCELLING_ORDER':
			return {...state, cancellingOrder: true, cancellingOrderId: action.orderId}
		case 'FILLING_ORDER':
			return{...state, fillingOrder: true, fillingOrderId: action.orderId}
		case 'ORDER_CANCELLED':
			return {...state,
				cancellingOrder: false,
				allOrders:{...state.allOrders, loaded: false},
				cancelledOrders:{
					...state.cancelledOrders,
					data:[
						...state.cancelledOrders.data,
						action.orderCancelled
					]
				}
			}
		case 'FILLED_ORDER':
			index = state.filledOrders.data.findIndex((order) => order.id === action.order.id)
			
			if(index === -1){
				data = [...state.filledOrders.data, action.order]
			}else{
				data = state.filledOrders.data
			}

			return {
				...state,
				fillingOrder: false,
				allOrders:{...state.allOrders, loaded: false},
				filledOrders:{
					...state.filledOrders,
					data
				}
			}
		case 'BALANCES_DEPOSITED':
		 	console.log('BALANCES_DEPOSITED state:',state)
			return {...state, etherBalanceExchange: action.balance}
		case 'BALANCES_LOADING':
			return {...state, balancesLoading: true}
		case 'BALANCES_LOADED':
			return {...state, balancesLoaded: true, balancesLoading: false}
		case 'EXCHANGE_ETHER_BALANCE_LOADED':
			return {...state, etherBalanceExchange: action.exchangeEther}
		case 'EXCHANGE_TOKEN_BALANCE_LOADED':
			return {...state, tokenBalanceExchange: action.exchangeToken}
		case 'ETHER_DEPOSIT_AMOUNT_CHANGED':
			return {...state, etherChanged: action.etherChanged}
		//TOKEN_DEPOSIT_AMOUNT_CHANGED
		case 'TOKEN_DEPOSIT_AMOUNT_CHANGED':
			return {...state, tokenChanged: action.tokenChanged}
		case 'TOKEN_TYPE':
			return {...state, tokenType: action.tokenType}
		case 'WITHDRAW_LOADING':
			return {...state, withdraw: {withdrawLoading: true, withdrawLoaded: false} }
		case 'WITHDRAW_LOADED': 
			return {...state, withdraw: {withdrawLoading: false, withdrawLoaded: true}}
		case 'MAKE_ORDER_BUY_AMOUNT':
				return {...state, makeOrder: {...state.makeOrder, buyAmount: action.buyAmount} }
		case 'MAKE_ORDER_BUY_PRICE':
				return {...state, makeOrder: {...state.makeOrder, buyPrice: action.buyPrice} }
		case 'MAKE_ORDER_SELL_AMOUNT':
				return {...state, makeOrder: {...state.makeOrder, sellAmount: action.sellAmount} }
		case 'MAKE_ORDER_SELL_PRICE':
				return {...state, makeOrder: {...state.makeOrder, sellPrice: action.sellPrice} }
		case 'ORDER_MAKING':
			return {...state, makeOrder: {...state.makeOrder, orderMaking: true}, allOrders: {...state.allOrders, loaded: false}}
		case 'ORDER_MADED' :
			return {...state, makeOrder: {...state.makeOrder, orderMaking: false, showOrderMaking: false} }
		case 'SHOW_ORDER_MAKING':
			return {...state, makeOrder: {...state.makeOrder, showOrderMaking: true}}
		default:
			return state
	}
}		

const rootReducer = combineReducers({
	web3, token, exchange
})

export default rootReducer
			    