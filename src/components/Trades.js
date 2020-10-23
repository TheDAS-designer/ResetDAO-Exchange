import React, { Component } from 'react';
import { connect } from 'react-redux'
import {  filledOrdersLoadedSelector, filledOrdersSelector } from '../store/accountSelector'
import Spinner from './Spinner.js'


const loadFilledOrders = (filledOrders) =>{
  return(
           <tbody> 
                {filledOrders.map((order) => {

                   return(

                        <tr className={`order-${order.id}`} key={order.id}>
                          <th>{order.id}</th>
                          <td className="text-muted" >{order.formattedTimestamp}</td>
                          <td>{order.tokenAmount}</td>
                          <td className={`text-${order.tokenPriceClass}`}>{order.tokenPrice}</td>
                        </tr>)
                }) } 
            </tbody>
                  
    )
}


class Trades extends Component {

render() {
    return (  
             
              <div className="card-body">
                <table className="table table-dark talbe-sm small">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Time</th>
                      <th scope="col">DAPP</th>
                      <th scope="col">DAPP/ETH</th>
                    </tr>
                  </thead>
                  {this.props.filledOrdersLoaded? loadFilledOrders(this.props.filledOrders): <Spinner type="table" />}
                </table>
            </div>
            
    );
  }
}

function mapStateToProps(state){
  return {
    filledOrders:filledOrdersSelector(state),
    filledOrdersLoaded:filledOrdersLoadedSelector(state)
  }
}

export default connect(mapStateToProps)(Trades);