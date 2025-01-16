import yfinance as yf
from typing import Dict, Any

class MarketService:
    def get_market_data(self, symbol: str) -> Dict[str, Any]:
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period='1d')
            
            if data.empty:
                return {'price': 0, 'change': 0, 'error': 'No data available'}
            
            current_price = data['Close'].iloc[-1]
            previous_price = data['Open'].iloc[0]
            change_percent = ((current_price - previous_price) / previous_price) * 100
            
            return {
                'price': round(current_price, 2),
                'change': round(change_percent, 2)
            }
        except Exception as e:
            return {'price': 0, 'change': 0, 'error': str(e)}
    
    def get_historical_data(self, symbol: str, range_days: str) -> Dict[str, Any]:
        try:
            period = 'max' if range_days == 'max' else f"{range_days}d"
            df = yf.download(symbol, period=period)
            
            return {
                'prices': df['Close'].tolist(),
                'dates': df.index.strftime('%Y-%m-%d').tolist()
            }
        except Exception as e:
            return {'error': str(e)}