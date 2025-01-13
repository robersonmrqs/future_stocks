import yfinance as yf
import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np
import requests
from typing import List

def search_stocks(query: str) -> List[dict]:
    """
    Search for stocks based on a query string.
    Returns a list of dictionaries containing symbol and company name.
    """
    try:
        url = "https://query2.finance.yahoo.com/v1/finance/search"
        params = {
            "q": query,
            "quotesCount": 10,
            "newsCount": 0,
            "enableFuzzyQuery": True,
            "quotesQueryId": "tss_match_phrase_query"
        }
        
        headers = {
            "User-Agent": "Mozilla/5.0"
        }
        
        response = requests.get(url, params=params, headers=headers)
        data = response.json()
        
        results = []
        for quote in data.get("quotes", []):
            if quote.get("quoteType") == "EQUITY":
                symbol = quote.get("symbol", "")
                name = quote.get("longname", "") or quote.get("shortname", "")
                exchange = quote.get("exchange", "")
                
                # Always add .SA for Brazilian stocks
                if exchange == "SAO":
                    symbol = f"{symbol}"
                
                results.append({
                    "symbol": symbol,
                    "name": name,
                    "exchange": exchange
                })
        
        return results

    except Exception as e:
        print(f"Error in search_stocks: {str(e)}")
        return []

def fetch_stock_data(symbol):
    try:
        # Download historical data
        df = yf.download(symbol, period="1y")
        if df.empty:
            raise ValueError(f"No data found for symbol {symbol}")
        
        df.reset_index(inplace=True)
        
        # Get last 30 days data
        last_30_days = df.tail(30)
        
        # Properly handle pandas Series
        max_value = float(last_30_days["High"].max().iloc[0]) if isinstance(last_30_days["High"].max(), pd.Series) else float(last_30_days["High"].max())
        min_value = float(last_30_days["Low"].min().iloc[0]) if isinstance(last_30_days["Low"].min(), pd.Series) else float(last_30_days["Low"].min())
        current_price = float(df["Close"].iloc[-1].iloc[0]) if isinstance(df["Close"].iloc[-1], pd.Series) else float(df["Close"].iloc[-1])
        
        # Convert closing prices to list with proper float conversion
        historical_values = [float(x) for x in last_30_days["Close"].values]
        
        # Get stock info
        stock = yf.Ticker(symbol)
        stock_info = stock.info
        stock_name = stock_info.get('longName', symbol)
        stock_exchange = "Bovespa (B3)" if ".SA" in symbol else "NASDAQ"
        
        # Prepare predictions
        predictions = predict_stock(df)
        
        data = {
            "stock_name": stock_name,
            "stock_exchange": stock_exchange,
            "current_price": round(current_price, 2),
            "max_value": round(max_value, 2),
            "min_value": round(min_value, 2),
            "historical_values": historical_values,
            "predictions": predictions
        }
        
        return data
    except Exception as e:
        print(f"Error in fetch_stock_data: {str(e)}")  # Add debug print
        raise Exception(f"Error fetching data for {symbol}: {str(e)}")

def predict_stock(df):
    try:
        # Create features for prediction
        df["Date"] = pd.to_datetime(df["Date"])
        df["Days"] = (df["Date"] - df["Date"].min()).dt.days
        X = df[["Days"]].values
        y = df["Close"].values
        
        # Train model
        model = LinearRegression()
        model.fit(X, y)
        
        # Make predictions
        last_day = X[-1][0]
        future_days = np.array([
            last_day + 1,    # Next day
            last_day + 30,   # Next 30 days
            last_day + 180,  # Next 6 months
            last_day + 365   # Next year
        ]).reshape(-1, 1)
        
        predictions = model.predict(future_days)
        return [round(float(p), 2) for p in predictions]
    except Exception as e:
        print(f"Error in predict_stock: {str(e)}")  # Add debug print
        return [0, 0, 0, 0]  # Return zeros if prediction fails