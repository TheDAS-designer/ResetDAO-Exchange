import React, { Component } from 'react';
import './App.css';
import Navbar from './Navbar.js'
import Content from './Content.js'
import { loadWeb3, loadAccount, loadToken, loadExchange }  from '../store/interactions'
import { connect } from 'react-redux'
import {  contractLoadedSelector } from '../store/accountSelector'


class App extends Component {

componentWillMount(){

  this.loadBlockchainData(this.props.dispatch)

}

async loadBlockchainData(dispath){
  const web3 = loadWeb3(dispath)
  //const network = await web3.eth.net.getNetworkType()
  const netId = await web3.eth.net.getId()
  await loadAccount(web3, dispath)

  const token = await loadToken(web3, netId, dispath)
  if(!token){
    window.alert('Contract not deployed to the current network. Please select anthor network with MetaMask')
    return
  }
  const exchange = await loadExchange(web3, netId, dispath)
  if(!exchange){
    window.alert('Contract not deployed to the current network. Please select anthor network with MetaMask')
    return
  }
}


render() {
    return (
      <div>
        <Navbar />
        {this.props.contractLoaded? <Content /> : <div className="content"></div>}
          
        }
      </div>
    );
  }
}

function mapStateToProps(state){
  return {
    contractLoaded:contractLoadedSelector(state)
  }
}

export default connect(mapStateToProps)(App);