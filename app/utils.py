import yfinance as yf
import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np

def fetch_stock_data(symbol):
    # Obter dados históricos
    df = yf.download(symbol, period="1y")
    df.reset_index(inplace=True)
    # Gerar previsão
    predictions = predict_stock(df)
    return df.to_dict(orient="records"), predictions

def predict_stock(df):
    # Usar apenas o preço de fechamento
    df["Date"] = pd.to_datetime(df["Date"])
    df["Days"] = (df["Date"] - df["Date"].min()).dt.days
    X = df[["Days"]].values
    y = df["Close"].values

    # Treinamento do modelo
    model = LinearRegression()
    model.fit(X, y)

    # Previsão para os próximos 30 dias
    future_days = np.arange(X[-1][0] + 1, X[-1][0] + 31).reshape(-1, 1)
    future_prices = model.predict(future_days)

    return future_prices.tolist()
