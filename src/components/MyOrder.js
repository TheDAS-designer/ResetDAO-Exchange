import React, { Component } from 'react'
import { connect } from 'react-redux'
import {Tabs, Tab } from 'react-bootstrap'
import { orderCancelling }  from '../store/interactions'
import { 
filledOrdersLoadedSelector, 
  myFilledOrdersLoadedSelector, 
  myFilledOrdersSelector,
   myOpeningOrdersLoadedSelector,
    myOpeningOrdersSelector,
    cancellingOrderSelector,
    exchangeContractSelector,
    accountSelector
  } from '../store/accountSelector'
import Spinner from './Spinner.js'

const _openingOrders = (props) => {
  const { myOpeningOrders, dispatch, exchange, account } = props
  return(
          <tbody> 
                {myOpeningOrders.map((order) => {
                    return(
                        <tr className={`order-${order.id}`} key={order.id}>
                          <td>{order.id}</td>
                          <td className="text-muted" >{order.formattedTimestamp}</td>
                          <td className={`text-${order.orderTypeClass}`}>{order.tokenAmount}</td>
                          <td>{order.tokenPrice}</td>
                          <td 
                            className="text-muted"
                            onClick={(e) => {
                              if(account)orderCancelling(exchange, order, account, dispatch)
                              
                            }}
                          >X</td>
                         </tr>)
                }) } 
            </tbody>
    )
  
   
}



const _filledOrders = (props) => {
  const { myFilledOrders } = props
  return(
    <tbody> 
                {myFilledOrders.map((order) => {
                   return(

                         <tr className={`order-${order.id}`} key={order.id}>
                          <td>{order.id}</td>
                          <td className="text-muted" >{order.formattedTimestamp}</td>
                          <td className={`text-${order.orderTypeClass}`}>{order.orderSign}{order.tokenAmount}</td>
                          <td>{order.tokenPrice}</td>
                         </tr>)
                }) } 
            </tbody>

  )
    
}



const ControlledTabs = (props) => {
  const filledLoaded = props.myFilledOrdersLoaded
  
  const openingLoaded = props.myOpeningOrdersLoaded

  return (
    

      <Tabs defaultActiveKey="trades" id="uncontrolled-tab-example">
        <Tab eventKey="trades" title="Trades">
          <table className="table table-dark talbe-sm small">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Time</th>
              <th scope="col">DAPP</th>
              <th scope="col">DAPP/ETH</th>
            </tr>
          </thead>
          {filledLoaded? _filledOrders(props): <Spinner type="table" />}
           </table>
          
        </Tab>
        <Tab eventKey="opening" title="Opening">
          <table className="table table-dark talbe-sm small">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Time</th>
              <th scope="col">DAPP</th>
              <th scope="col">DAPP/ETH</th>
              <th scope="col">Cancel</th>
            </tr>
          </thead>

          {openingLoaded? _openingOrders(props): <Spinner type="table" />}
          </table>
        </Tab>
      </Tabs>
  );
}
class MyOrder extends Component{
  
  render() {
    return (
        <div className="card bg-dark text-white">
              <div className="card-header">
                My Orders
              </div> 
              <div className="card-body">
                {ControlledTabs(this.props)}
              </div>
             </div> 
      );

  }

}

function mapStateToProps(state){
  const showMyOpeningOrders = myOpeningOrdersLoadedSelector(state)
  const cancellingOrder = cancellingOrderSelector(state)
  return {
        floaded: filledOrdersLoadedSelector(state),
        myFilledOrdersLoaded: myFilledOrdersLoadedSelector(state),
        myFilledOrders: myFilledOrdersSelector(state),
        myOpeningOrdersLoaded: showMyOpeningOrders && !cancellingOrder,
        myOpeningOrders: myOpeningOrdersSelector(state),
        account: accountSelector(state),
        exchange: exchangeContractSelector(state)
     }
}

export default connect(mapStateToProps)(MyOrder);