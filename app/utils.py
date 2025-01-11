import yfinance as yf
import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np
from datetime import datetime, timedelta

def fetch_stock_data(symbol):
    try:
        # Download historical data
        df = yf.download(symbol, period="1y")
        if df.empty:
            raise ValueError(f"No data found for symbol {symbol}")
        
        df.reset_index(inplace=True)
        
        # Get last 30 days data
        last_30_days = df.tail(30)
        
        # Safely extract max, min, and current values
        high_max = last_30_days["High"].max()
        low_min = last_30_days["Low"].min()
        last_close = df["Close"].iloc[-1]
        
        # Convert to float, handling both Series and scalar values
        max_value = float(high_max[0] if isinstance(high_max, pd.Series) else high_max)
        min_value = float(low_min[0] if isinstance(low_min, pd.Series) else low_min)
        current_price = float(last_close[0] if isinstance(last_close, pd.Series) else last_close)
        
        # Convert closing prices to list
        historical_values = [float(x) for x in last_30_days["Close"].values]
        
        # Get stock info
        stock = yf.Ticker(symbol)
        stock_info = stock.info
        stock_name = stock_info.get('longName', symbol)
        stock_exchange = "Bovespa (B3)" if ".SA" in symbol else "NASDAQ"
        
        data = {
            "stock_name": stock_name,
            "stock_exchange": stock_exchange,
            "current_price": round(current_price, 2),
            "max_value": round(max_value, 2),
            "min_value": round(min_value, 2),
            "historical_values": historical_values,
            "predictions": predict_stock(df)
        }
        
        return data
    except Exception as e:
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
        raise Exception(f"Error making predictions: {str(e)}")