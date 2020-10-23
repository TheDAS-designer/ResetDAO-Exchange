
import React, { Component } from 'react'
import { connect } from 'react-redux'
import {Tabs, Tab } from 'react-bootstrap'
import { makeBuyOrder, makeSellOrder }  from '../store/interactions'
import { makeOrderBuyAmount, makeOrderBuyPrice, makeOrderSellAmount, makeOrderSellPrice, showOrderMaking } from '../store/actions'
import { 
    makeOrderSelector
  } from '../store/accountSelector'
import Spinner from './Spinner.js'
import { ETHER_ADDRESS } from '../helper'


class MakeOrder extends Component{

 
/*
<Tabs defaultActiveKey="trades" id="uncontrolled-tab-example">
<Tab eventKey="trades" title="Deposits">
 </Tab>
 <Tab eventKey="opening" title="Withdraw">
 <table className="table table-dark talbe-sm small">
				          <thead>
				            <tr>
				              <th scope="col">Token</th>
				              <th scope="col">Wallet</th>
				              <th scope="col">Exchange</th>
				            </tr>
				          </thead>
				          {this.props.showBalances? showWithdraw(this.props,'ETH'): <Spinner type="table" />}
				          </table>

				          <table className="table table-dark talbe-sm small">
				          <thead>
				            <tr>
				              <th scope="col">Token</th>
				              <th scope="col">Wallet</th>
				              <th scope="col">Exchange</th>
				            </tr>
				          </thead>
				          {this.props.showBalances? showWithdraw(this.props,'DAPP'): <Spinner type="table" />}
				          </table>
</Tab>
			      </Tabs>
*/

buyFormFun = (event) => {
	const {makeOrder, dispatch } = this.props
	event.preventDefault()
	
	makeBuyOrder(dispatch, makeOrder.buyPrice, makeOrder.buyAmount)

}

sellFormFun = (event) => {
	const {makeOrder, dispatch} = this.props
	event.preventDefault()

	makeSellOrder(dispatch, makeOrder.sellPrice, makeOrder.sellAmount)
}


showSellForm = () => {
	const {dispatch, makeOrder} = this.props
	let sellPrice,sellAmount
	
	sellPrice = makeOrder.sellPrice || 0
	sellAmount = makeOrder.sellAmount || 0


	return (
		<form className="" onSubmit={ 

	      		this.sellFormFun.bind(this)
	      }>
	      	<div className="col pr-sm-2 row mt-3">
	      		<span><strong>Amount:</strong></span>
	      		<input 
	      		type="text"
	      		placeholder="Sell Order Amount"
	      		className="form-control form-control-sm bg-dark text-white mt-1"
	      		required
	      		onChange={(e) => {

	      			dispatch(makeOrderSellAmount(e.target.value))
	      			
	      		}}
	      		/>
	      	</div>
	      	<div className="col pr-sm-2 row mt-3">
	      	<span><strong>Price:</strong></span>
	      		<input 
	      		type="text"
	      		placeholder="Sell Order Price"
	      		className="form-control form-control-sm bg-dark text-white mt-1"
	      		required
	      		onChange={(e) => {

	      			dispatch(makeOrderSellPrice(e.target.value))
	      		}}

	      		/>
	      	</div>
	      	<div className="mt-2"> <span>Total : {(sellPrice * sellAmount)}</span> </div>
	      	
	      	<div className="mt-4 float-right">
	      		<button type="submit" className="btn btn-primary btn-sm">Make Order</button>
	      	</div>
	      </form>
		)
}


showBuyForm = () => {
	const {dispatch, makeOrder} = this.props
	let buyPrice,buyAmount
	
	buyPrice = makeOrder.buyPrice || 0
	buyAmount = makeOrder.buyAmount || 0
	


	return (
		<form className="" onSubmit={ 

	      		this.buyFormFun.bind(this)
	      }>
	      	<div className="col pr-sm-2 row mt-3">
	      		<span className=""><strong>Amount:</strong></span>
	      		<input 
	      		type="text"
	      		placeholder="Buy Order Amount"
	      		className="form-control form-control-sm bg-dark text-white mt-1"
	      		required
	      		onChange={(e) => {

	      			dispatch(makeOrderBuyAmount(e.target.value))
	      			
	      		}}
	      		/>
	      	</div>
	      	<div className="col pr-sm-2 row mt-3">
	      	<span><strong>Price:</strong></span>
	      		<input 
	      		type="text"
	      		placeholder="Buy Order Price"
	      		className="form-control form-control-sm bg-dark text-white mt-1"
	      		required
	      		onChange={(e) => {

	      			dispatch(makeOrderBuyPrice(e.target.value))
	      		}}

	      		/>
	      	</div>
	      	<div className="mt-3" > <span >Total : {(buyPrice * buyAmount)}</span></div>
	      	<div className=" mt-2 float-right">
	      		<button type="submit" className="btn btn-primary btn-sm" disabled={makeOrder.showOrderMaking} 
	      		onClick= {(e) =>{
	      			
	      			
	      		}} >Make Order</button>
	      	</div>
	      </form>
		)
}

componentDidUpdate(prevProps, prevState, snapshot){
	if(prevProps.makeOrder != this.props.makeOrder){

	}
}

  render() {
    return (
        <div className="card bg-dark text-white">
              <div className="card-header">
                MakeOrder
              </div>
              <div className="card-body">
             	<Tabs defaultActiveKey="Buy" id="uncontrolled-tab-example">
						<Tab eventKey="Buy" title="Buy">
						 {!this.props.makeOrder.orderMaking? this.showBuyForm(): <Spinner type="null" />}
						 </Tab>
						 <Tab eventKey="Sell" title="Sell">
						   {!this.props.makeOrder.orderMaking? this.showSellForm(): <Spinner type="null" />}      
						</Tab>
			      </Tabs>
              </div>
            </div>


      );

  }

}

function mapStateToProps(state){
 
  return {
       makeOrder: makeOrderSelector(state)
     }
}

export default connect(mapStateToProps)(MakeOrder);


