from dataclasses import dataclass
from typing import Dict, Any, List
import yfinance as yf

@dataclass
class MarketItem:
    symbol: str
    name: str
    price: float
    change: float
    color: str = ""
    trend: str = ""
    
    def __post_init__(self):
        self.color = "positive" if self.change >= 0 else "negative"
        self.trend = "Aumentando rápido" if self.change >= 0 else "Diminuindo"

class MarketService:
    def __init__(self):
        self.indices = [
            {"symbol": "^IXIC", "name": "NASDAQ"},
            {"symbol": "^DJI", "name": "DOW JONES"},
            {"symbol": "^GSPC", "name": "S&P 500"},
            {"symbol": "^BVSP", "name": "BOVESPA"}
        ]
        self.currencies = [
            {"symbol": "BRL=X", "name": "USD/BRL"},
            {"symbol": "EUR=X", "name": "EUR/BRL"}
        ]
        self.commodities = [
            {"symbol": "CL=F", "name": "OIL WTI"}
        ]
        
    def _fetch_market_data(self, symbol: str) -> Dict[str, Any]:
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="2d")
            
            if hist.empty:
                return MarketItem(symbol=symbol, name=symbol, price=0.0, change=0.0)
            
            current_price = float(hist['Close'].iloc[-1])
            prev_price = float(hist['Close'].iloc[-2] if len(hist) > 1 else hist['Open'].iloc[-1])
            change = ((current_price - prev_price) / prev_price) * 100
            
            return {"price": current_price, "change": change}
        except Exception as e:
            print(f"Error fetching {symbol}: {str(e)}")
            return {"price": 0.0, "change": 0.0}

    def get_market_overview(self) -> Dict[str, List[MarketItem]]:
        market_data = {
            "indices": [],
            "currencies": [],
            "commodities": []
        }
        
        # Fetch indices
        for index in self.indices:
            data = self._fetch_market_data(index["symbol"])
            market_data["indices"].append(
                MarketItem(
                    symbol=index["symbol"],
                    name=index["name"],
                    price=data["price"],
                    change=data["change"]
                )
            )
        
        # Fetch currencies
        for currency in self.currencies:
            data = self._fetch_market_data(currency["symbol"])
            market_data["currencies"].append(
                MarketItem(
                    symbol=currency["symbol"],
                    name=currency["name"],
                    price=data["price"],
                    change=data["change"]
                )
            )
        
        # Fetch commodities
        for commodity in self.commodities:
            data = self._fetch_market_data(commodity["symbol"])
            market_data["commodities"].append(
                MarketItem(
                    symbol=commodity["symbol"],
                    name=commodity["name"],
                    price=data["price"],
                    change=data["change"]
                )
            )
        
        return market_data