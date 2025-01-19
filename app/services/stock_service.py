import yfinance as yf
import requests
from typing import List, Dict, Any
import pandas as pd
from .prediction_service import PredictionService

class StockService:
    def __init__(self):
        self.prediction_service = PredictionService()
    
    def search_stocks(self, query: str) -> List[Dict[str, str]]:
        try:
            url = "https://query2.finance.yahoo.com/v1/finance/search"
            params = {
                "q": query,
                "quotesCount": 10,
                "newsCount": 0,
                "enableFuzzyQuery": True,
                "quotesQueryId": "tss_match_phrase_query"
            }
            
            headers = {"User-Agent": "Mozilla/5.0"}
            response = requests.get(url, params=params, headers=headers)
            data = response.json()
            
            results = []
            for quote in data.get("quotes", []):
                if quote.get("quoteType") == "EQUITY":
                    symbol = quote.get("symbol", "")
                    name = quote.get("longname", "") or quote.get("shortname", "")
                    exchange = quote.get("exchange", "")
                    
                    results.append({
                        "symbol": symbol,
                        "name": name,
                        "exchange": exchange
                    })
            
            return results
        except Exception as e:
            print(f"Error in search_stocks: {str(e)}")
            return []
    
    def fetch_stock_data(self, symbol: str) -> Dict[str, Any]:
        try:
            # Get maximum historical data
            df = yf.download(symbol, period="max")
            if df.empty:
                raise ValueError(f"No data found for symbol {symbol}")
            
            df.reset_index(inplace=True)
            last_30_days = df.tail(30)
            
            stock = yf.Ticker(symbol)
            stock_info = stock.info
            
            data = {
                "stock_name": stock_info.get('longName', symbol),
                "stock_exchange": "Bovespa (B3)" if ".SA" in symbol else "NASDAQ",
                # Use .iloc[0] when converting Series to float
                "current_price": round(float(df["Close"].iloc[-1].iloc[0] if isinstance(df["Close"].iloc[-1], pd.Series) else df["Close"].iloc[-1]), 2),
                "max_value": round(float(last_30_days["High"].max().iloc[0] if isinstance(last_30_days["High"].max(), pd.Series) else last_30_days["High"].max()), 2),
                "min_value": round(float(last_30_days["Low"].min().iloc[0] if isinstance(last_30_days["Low"].min(), pd.Series) else last_30_days["Low"].min()), 2),
                "historical_values": [float(x) for x in df["Close"].values],
                "dates": df["Date"].dt.strftime('%Y-%m-%d').tolist(),
                "predictions": self.prediction_service.predict_stock(df)
            }
            
            return data
        except Exception as e:
            raise Exception(f"Error fetching data for {symbol}: {str(e)}")