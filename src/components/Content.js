import React, { Component } from 'react'
import Trades from './Trades'
import OrderBook from './OrderBook'
import MyOrder from './MyOrder'
import Deposits from './Deposits'
import PriceChart from './PriceChart'
import MakeOrder from './MakeOrder'
import { connect } from 'react-redux'
import {  exchangeContractSelector, 
  accountSelector, 
  tokenTypeSelector,
  tokenContractSelector,
  web3Selector,
  orderBookLoadedSelector,
  cancellingOrderSelector,
  fillingOrderSelector,
  balancesLoadingSelector,
  withdrawSelector,
  fillingOrderIdSelector,
  cancellingOrderIdSelector,
  makeOrderSelector } from '../store/accountSelector'

import { loadOrders, subscribeToCancelOrderEvent, subscribeToDepositEvent, 
  subscribeToTradeEvent, subscribeToWithdrawEvent, subscribeToMakeOrderEvent }  from '../store/interactions'

class Content extends Component {



componentDidMount(){
   const { exchange, dispatch } = this.props
  //fecth orders
  loadOrders(exchange, dispatch)
}


componentDidUpdate(prevProps, prevState, snapshot) {

    console.log('componentDidUpdate')

    this.loadBlockchainData(this.props, prevProps)

}


async loadBlockchainData(props, prevProps){
  const { exchange, dispatch, account, tokenType, token, 
    web3, ordersBookLoaded, cancellingOrder, fillingOrder,
     balancesLoading, withdraw, fillingOrderId ,
     cancellingOrderId, makeOrder} = props
  
  console.log('ordersBookLoaded:', ordersBookLoaded)
  if(!ordersBookLoaded){
    console.log('ordersBookLoaded:', ordersBookLoaded)
    await loadOrders(exchange, dispatch)
  }

  console.log('cancellingOrder:',cancellingOrder)
  if(cancellingOrder){
    //cancellingOrderId
    const args = {account, orderId: cancellingOrderId}
    await subscribeToCancelOrderEvent(exchange, dispatch, args)
  }
  console.log('fillingOrder:',fillingOrder)
  if(fillingOrder){
    const args = {account, orderId: fillingOrderId}
    await subscribeToTradeEvent(exchange, dispatch, args)
  }
  console.log('balancesLoading: ', balancesLoading)
  if(balancesLoading){
    await subscribeToDepositEvent(account, token, web3, exchange, dispatch, tokenType)
  }

  console.log('withdraw: ', withdraw)
  if(withdraw){
    console.log('withdraw.withdrawLoading: ', withdraw.withdrawLoading)
    if( withdraw.withdrawLoading){
      await subscribeToWithdrawEvent(account, token, web3, exchange, dispatch, tokenType)
   }
  }

  if(makeOrder){
    if(prevProps){
      if(prevProps.makeOrder.orderMaking !== makeOrder.orderMaking){
          if(makeOrder.orderMaking){
          subscribeToMakeOrderEvent(dispatch)
        }
      } 
    }else{
      if(makeOrder.orderMaking){
          subscribeToMakeOrderEvent(dispatch)
        }
    }
    
  }
  
}

render() {
    return (
      
        <div className="content">
          <div className="vertical-split">
            <Deposits />
            <MakeOrder />
            
          </div>
          <div className="vertical">
            <OrderBook />
          </div>
          <div className="vertical-split">
            
            <PriceChart />
            <MyOrder />
            
           </div>
          <div className="vertical">
            <div className="card bg-dark text-white">
              <div className="card-header">
               Trades
              </div>
              <Trades />
            </div>
          </div>
        </div>
    );
  }
}

function mapStateToProps(state){
  return {
    exchange:exchangeContractSelector(state),
    tokenType: tokenTypeSelector(state),
    account: accountSelector(state),
    web3: web3Selector(state),
    token: tokenContractSelector(state),
    ordersBookLoaded:orderBookLoadedSelector(state),
    cancellingOrder:cancellingOrderSelector(state),
    fillingOrder:fillingOrderSelector(state),
    balancesLoading:balancesLoadingSelector(state),
    withdraw:withdrawSelector(state),
    fillingOrderId: fillingOrderIdSelector(state),
    cancellingOrderId: cancellingOrderIdSelector(state),
    makeOrder: makeOrderSelector(state)
  }
}

export default connect(mapStateToProps)(Content);