import React from 'react';
import { connect } from 'react-redux';
import { loadMarkets, loadTradeHistory } from './actions/markets';
import { initWatchers } from './lib/web3';
import Header from './components/Header';
import WebsocketConnector from './components/WebsocketConnector';
import OrderBook from './components/Orderbook';
import Trade from './components/Trade';
// import Balance from './components/Balance';
import Orders from './components/Orders';
// import Trades from './components/Trades';
import Chart from './components/Chart';

const mapStateToProps = state => {
  return {
    currentMarket: state.market.getIn(['markets', 'currentMarket'])
  };
};

class App extends React.PureComponent {
  componentDidMount() {
    const { dispatch, currentMarket } = this.props;
    dispatch(loadMarkets());
    dispatch(initWatchers());
    if (currentMarket) {
      dispatch(loadTradeHistory(currentMarket.id));
    }
  }

  componentDidUpdate(prevProps) {
    const { currentMarket, dispatch } = this.props;
    if (currentMarket !== prevProps.currentMarket) {
      dispatch(loadTradeHistory(currentMarket.id));
    }
  }

  render() {
    const { currentMarket } = this.props;
    if (!currentMarket) {
      return null;
    }
    return (
      <div className="app">
        <WebsocketConnector />
        <Header />
        <div className="flex flex-1">
          <div className="flex">
            <div className="grid border-right">
              <Trade />
            </div>
            <div className="grid border-right">
              <OrderBook />
            </div>
          </div>
          <div className="flex-column flex-1">
            <div className="grid flex-1">
              <Chart />
            </div>
            <div className="grid flex-1 border-top">
              <Orders />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(App);
