import React, { Component } from 'react'
import './App.css';
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { connect } from 'react-redux'
import { orderBookLoadedSelector, orderBookSelector,
        exchangeContractSelector,
        accountSelector,
        fillingOrderSelector
  } from '../store/accountSelector'
import { orderFilling }  from '../store/interactions'
import Spinner from './Spinner.js'


const showBuyOrSellOrders = (props,orderType) =>{

  const { orderBook, dispatch, exchange, account } = props
  let orders = orderBook

  if(orderType === 'sell'){
      orders = orders.sell
  }else{
      orders = orders.buy
  }

  return(
            orders.map((order) => {

               return(
                    <OverlayTrigger
                      key={order.id}
                      placement="auto"
                      overlay={
                        <Tooltip id={`tooltip-${order.id}`}>
                          Click here to <strong>{order.orderFillAction}</strong>
                        </Tooltip>
                      }
                    >
                    <tr className="order-book-order" key={order.id}
                      onClick={ (e) => {
                        orderFilling(exchange, order, account, dispatch)
                      }}
                    >
                      <td>{order.tokenAmount}</td>
                      <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
                      <td>{order.etherAmount}</td>
                    </tr>
                    </OverlayTrigger>
                    )
            }) 
            
)
  
  
}

const showOrderBook = (props) => {
  
      return(  
              <tbody>
              {showBuyOrSellOrders(props,'sell')    }
              
                    <tr>
                      <th scope="col">DAPP</th>
                      <th scope="col">DAPP/ETH</th>
                      <th scope="col">ETH</th>
                    </tr>
                

              {showBuyOrSellOrders(props,'buy')   }
                </tbody>
            )
}




class Trades extends Component {

render() {
    return (  
             
              <div className="card bg-dark text-white">
              <div className="card-header">
                Order Book
              </div>
              <div className="card-body">
                <table className="table table-dark talbe-sm small">
                  <thead>
                    <tr>
                      <th scope="col">DAPP</th>
                      <th scope="col">DAPP/ETH</th>
                      <th scope="col">ETH</th>
                    </tr>
                  </thead>
                  {this.props.orderBookLoaded? showOrderBook(this.props): <Spinner type="table" />}
                </table>
              </div>
            </div>
            
    );
  }
}

function mapStateToProps(state){
  const showOrderBook = orderBookLoadedSelector(state)
  const fillingOrder = fillingOrderSelector(state)
  console.log('showOrderBook & fillingOrder: ', showOrderBook, fillingOrder)
  return {
    orderBook:orderBookSelector(state),
    orderBookLoaded: showOrderBook && !fillingOrder,
    account: accountSelector(state),
    exchange: exchangeContractSelector(state)
  }
}

export default connect(mapStateToProps)(Trades);