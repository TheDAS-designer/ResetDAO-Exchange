import React, { Component } from 'react'
import { connect } from 'react-redux'
import { priceChartDataLoadedSelector, priceChartDataSelector } from '../store/accountSelector'
import Spinner from './Spinner.js'
import { chartOptions } from './PriceChart.config'
import Chart from 'react-apexcharts'



class PriceChart extends Component {

priceSymbol = (lastPriceChange) => {
  if(lastPriceChange === '+'){
    return (<span class="text-success">&#9650;</span>)
  }else{
    return (<span className="text-danger">&#9660;</span>)
  }
}

showPriceChart = () => {
  console.log('this.props.priceData', this.props.priceData)
  const data = this.props.priceData
  return(
    <div className="price-chart">
      <div className="price">
        {!!data 
        ? (<h4>DAPP/ETH &nbsp;{this.priceSymbol(data.priceDiff)} &nbsp; {data.lastPrice}</h4>)
        :(<span> No Data </span>)
        }
      </div>
      <Chart options={chartOptions} series={!!data?data.series:[]} type='candlestick' width='100%' height='100%'/>
    </div>
  ) 
}

render() {
    return (  
             
              <div className="card bg-dark text-white">
              <div className="card-header">
                Price Chart
              </div>
              <div className="card-body">
                {this.props.priceDataLoaded? this.showPriceChart() : <Spinner />}
              </div>
            </div>
            
    );
  }
}

function mapStateToProps(state){
  return {
      priceDataLoaded: priceChartDataLoadedSelector(state),
      priceData: priceChartDataSelector(state)
  }
}

export default connect(mapStateToProps)(PriceChart)