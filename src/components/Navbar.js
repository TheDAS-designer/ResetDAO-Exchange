import React, { Component } from 'react';
import './App.css';
import { connect } from 'react-redux'
import { accountSelector } from '../store/accountSelector'

class App extends Component {

// <ul className="navbar-nav">
//               <li className="nav-item">
//                 <a className="nav-link" href="/#">Link 1</a>
//               </li>
//               <li className="nav-item">
//                 <a className="nav-link" href="/#">Link 2</a>
//               </li>
//               <li className="nav-item">
//                 <a className="nav-link" href="/#">Link 3</a>
//               </li>
//             </ul>
render() {
    return (
      <div style={{backgroundColor:'red'}}>
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary bg-danger " >
         
          <a className="navbar-brand font-weight-bold" href="/#">ResetDAO Exchange</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            
          </div>
          <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <a 
                  className="nav-link small" 
                  href={`https://etherscan.io/address/${this.props.account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {this.props.account}
                </a>
              </li>
              
            </ul>
        </nav>
        </div>
    );
  }
}

function mapStateToProps(state){
  return {
    account:accountSelector(state)    
  }
}

export default connect(mapStateToProps)(App);