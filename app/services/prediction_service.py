import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from typing import List

class PredictionService:
    def predict_stock(self, df: pd.DataFrame) -> List[float]:
        try:
            df["Date"] = pd.to_datetime(df["Date"])
            df["Days"] = (df["Date"] - df["Date"].min()).dt.days
            
            model = LinearRegression()
            model.fit(df[["Days"]].values, df["Close"].values)
            
            last_day = df["Days"].iloc[-1]
            future_days = np.array([
                last_day + 1,    # Next day
                last_day + 30,   # Next 30 days
                last_day + 180,  # Next 6 months
                last_day + 365   # Next year
            ]).reshape(-1, 1)
            
            predictions = model.predict(future_days)
            return [round(float(p), 2) for p in predictions]
        except Exception as e:
            print(f"Error in predict_stock: {str(e)}")
            return [0, 0, 0, 0]