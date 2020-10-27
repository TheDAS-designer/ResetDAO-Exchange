
import React, { Component } from 'react'
import { connect } from 'react-redux'
import {Tabs, Tab } from 'react-bootstrap'
import { loadedBalances , etherDeposit, tokenDeposit, etherWithdraw, tokenWithdraw}  from '../store/interactions'
import { etherDepositAmountChanged, tokenDepositAmountChanged, tokenType } from '../store/actions'
import { 
    exchangeContractSelector,
    accountSelector,
    balancesLoadingSelector,
	balancesLoadedSelector,
	tokenContractSelector,
	web3Selector,
	etherBalanceSelector,
	exchangeEtherBalanceSelector,
	tokenBalanceSelector,
	exchangeTokenBalanceSelector,
	etherChangedSelector,
	tokenTypeSelector,
	tokenChangedSelector,
	withdrawSelector

  } from '../store/accountSelector'
import Spinner from './Spinner.js'
import { ETHER_ADDRESS } from '../helper'


class Deposits extends Component{

 formEtherCommitDepositFun = (event) => {
		const { exchange, web3, token, account, dispatch, etherChanged, showBalances } = this.props
		event.preventDefault()
      	console.log('form submitting...etherChanged',etherChanged)
      	dispatch(tokenType(ETHER_ADDRESS))
      	etherDeposit(exchange, web3, account, dispatch, etherChanged, showBalances)
} 

 formTokenCommitDepositFun = (event) => {
		const { exchange, web3, token, account, dispatch, tokenChanged, showBalances } = this.props
		event.preventDefault()
      	console.log('form submitting...tokenChanged',tokenChanged)
      	dispatch(tokenType(token.options.address))
      	tokenDeposit(exchange, web3, account, dispatch, tokenChanged, showBalances, token)
} 

 formEtherCommitWithdrawFun = (event) => {
 		const { exchange, web3, token, account, dispatch, etherChanged, showBalances } = this.props
		event.preventDefault()
      	console.log('form submitting...etherChanged',etherChanged)
      	dispatch(tokenType(ETHER_ADDRESS))
      	etherWithdraw(exchange, web3, account, dispatch, etherChanged, showBalances)
} 


 formTokenCommitWithdrawFun = (event) => {
 		const { exchange, web3, token, account, dispatch, tokenChanged, showBalances } = this.props
		event.preventDefault()
      	console.log('form submitting...tokenChanged',tokenChanged)
      	dispatch(tokenType(token.options.address))
      	tokenWithdraw(exchange, web3, account, dispatch, tokenChanged, showBalances, token)
}



etherDepositButton = () => {
	const { exchange, web3, token, account, dispatch, etherChanged, showBalances } = this.props

	return (
		<form className="row" onSubmit={ 

      		this.formEtherCommitDepositFun.bind(this)
      }>
      	<div className="col pr-sm-2">
      		<input 
      		type="text"
      		placeholder="ETH Amount"
      		className="form-control form-control-sm bg-dark text-white"
      		required
      		onChange={(e) => {

      			dispatch(etherDepositAmountChanged(e.target.value))
      		}}
      		/>
      	</div>

      	<div className="form-inline col-auto">
      		<button type="submit" className="btn btn-primary btn-sm mr-1">Deposit</button>
      		<button onClick={this.formEtherCommitWithdrawFun.bind(this)} className="btn btn-secondary btn-sm"><small>Withdraw</small></button>
      	</div>
      </form>

		)
}

tokenDepositButton =  () => {
	const { exchange, web3, token, account, dispatch, tokenChanged, showBalances } = this.props

	return (
		<form className="row" onSubmit={ 
			this.formTokenCommitDepositFun.bind(this)
      }>
      	<div className="col pr-sm-2">
      		<input 
      		type="text"
      		placeholder="TOKEN Amount"
      		className="form-control form-control-sm bg-dark text-white"
      		required
      		onChange={(e) => {

      			dispatch(tokenDepositAmountChanged(e.target.value))
      		}}
      		/>
      	</div>
      	<div className="form-inline col-auto">
      		<button type="submit" className="btn btn-primary btn-sm mr-1">Deposit</button>
      		<button onClick={this.formTokenCommitWithdrawFun.bind(this)} className="btn btn-secondary btn-sm"><small>Withdraw</small></button>
      	</div>
      </form>

		)
}

 showDeposits = (props, type) => {
	let balance,exchangeBalance

	if(type==='ETH'){
		balance = props.etherBalance
		exchangeBalance = props.exchangeEtherBalance
	}else{
		balance = props.tokenBalance
		exchangeBalance = props.exchangeTokenBalance
	}


	return (
		<tbody>
		<tr>
			<td>{type}</td>
			<td>{balance}</td>
			<td>{exchangeBalance}</td>
		</tr>
		</tbody>

	)
}
  
	 componentDidMount(){

	  this.loadBalance(this.props)

	}

	async loadBalance(props){
	  const { exchange, web3, token, account, dispatch } = props
	 
	  await loadedBalances(exchange, web3, token, account, dispatch)
	}
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
  render() {
    return (
        <div className="card bg-dark text-white">
              <div className="card-header">
                Balance
              </div>
              <div className="card-body">
                	
				          <table className="table table-dark talbe-sm small">
				          <thead>
				            <tr>
				              <th scope="col">Token</th>
				              <th scope="col">Wallet</th>
				              <th scope="col">Exchange</th>
				            </tr>
				          </thead>
				          {this.props.showBalances? this.showDeposits(this.props,'ETH'): <Spinner type="table" />}
				           </table>
					       {this.etherDepositButton()}
				          <table className="table table-dark talbe-sm small">
				          <thead>
				            <tr>
				              <th scope="col">Token</th>
				              <th scope="col">Wallet</th>
				              <th scope="col">Exchange</th>
				            </tr>
				          </thead>
				          {this.props.showBalances? this.showDeposits(this.props,'$NASH'): <Spinner type="table" />}
				           </table>
				           {this.tokenDepositButton()}
				          
				       
				        
				        

				       
				          
				        
              </div>
            </div>
      );

  }

}

function mapStateToProps(state){
  
  const withdraw = withdrawSelector(state)
  let withdrawLoading, withdrawLoaded
  if(withdraw){
  	withdrawLoading = withdraw.withdrawLoading
  	withdrawLoaded = withdraw.withdrawLoaded
  }else{
  	withdrawLoading = false
  	withdrawLoaded = true
  }
  
  const balanceLoading = balancesLoadingSelector(state)
  const balanceLoaded = balancesLoadedSelector(state)
  return {
        account: accountSelector(state),
        exchange: exchangeContractSelector(state),
        showBalances: !balanceLoading && balanceLoaded && !withdrawLoading && withdrawLoaded,
        token: tokenContractSelector(state),
        web3: web3Selector(state),
        etherBalance: etherBalanceSelector(state),
		exchangeEtherBalance: exchangeEtherBalanceSelector(state),
		tokenBalance: tokenBalanceSelector(state),
		exchangeTokenBalance: exchangeTokenBalanceSelector(state),
		etherChanged: etherChangedSelector(state),
		tokenType: tokenTypeSelector(state),
		tokenChanged: tokenChangedSelector(state)

     }
}

export default connect(mapStateToProps)(Deposits);


