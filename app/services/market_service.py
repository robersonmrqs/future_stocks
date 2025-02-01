from dataclasses import dataclass
from typing import Dict, Any, List
import yfinance as yf

@dataclass
class MarketItem:
    symbol: str
    name: str
    price: float
    change: float
    points: float
    color: str = ""
    trend: str = ""
    
    def __post_init__(self):
        self.color = "positive" if self.change >= 0 else "negative"
        self.trend = "up" if self.change >= 0 else "down"

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
        
    def get_market_data(self, symbol: str) -> Dict[str, Any]:
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="1d")
            
            if hist.empty:
                return {"price": 0.0, "change": 0.0, "points": 0.0}
            
            current_price = float(hist['Close'].iloc[-1])
            prev_price = float(hist['Close'].iloc[-2] if len(hist) > 1 else hist['Open'].iloc[-1])
            change = ((current_price - prev_price) / prev_price) * 100
            points = current_price - prev_price
            
            return {
                "price": current_price,
                "change": change,
                "points": points
            }
        except Exception as e:
            print(f"Error fetching {symbol}: {str(e)}")
            return {"price": 0.0, "change": 0.0, "points": 0.0}

    def get_market_overview(self) -> Dict[str, List[MarketItem]]:
        market_data = {
            "indices": [],
            "currencies": [],
            "commodities": []
        }
        
        # Fetch indices
        for index in self.indices:
            data = self.get_market_data(index["symbol"])
            market_data["indices"].append(
                MarketItem(
                    symbol=index["symbol"],
                    name=index["name"],
                    price=data["price"],
                    change=data["change"],
                    points=data["points"]
                )
            )
        
        # Fetch currencies
        for currency in self.currencies:
            data = self.get_market_data(currency["symbol"])
            market_data["currencies"].append(
                MarketItem(
                    symbol=currency["symbol"],
                    name=currency["name"],
                    price=data["price"],
                    change=data["change"],
                    points=data["points"]
                )
            )
        
        # Fetch commodities
        for commodity in self.commodities:
            data = self.get_market_data(commodity["symbol"])
            market_data["commodities"].append(
                MarketItem(
                    symbol=commodity["symbol"],
                    name=commodity["name"],
                    price=data["price"],
                    change=data["change"],
                    points=data["points"]
                )
            )
        
        return market_data

    def get_historical_data(self, symbol: str, range_days: str) -> Dict[str, Any]:
        # Mapeamento do range do frontend para o formato do Yahoo Finance
        range_mapping = {
            "5d": "5d",
            "30": "1mo",   # 30 dias → 1 mês
            "180": "6mo",  # 180 dias → 6 meses
            "365": "1y",   # 365 dias → 1 ano
            "1825": "5y",  # 1825 dias → 5 anos
            "30": "1mo",   # 30 dias → 1 mês
            "3650": "10y", # 3650 dias → 10 anos
            "max": "max"   # Máximo histórico
        }

        # Converte o range do frontend para um range válido
        range_validado = range_mapping.get(range_days, "1mo")  # Se não encontrar, usa 1 mês como padrão

        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=range_validado)

            if hist.empty:
                return {"dates": [], "prices": []}

            return {
                "dates": hist.index.strftime('%Y-%m-%d').tolist(),
                "prices": hist["Close"].tolist()
            }
        except Exception as e:
            print(f"Erro ao buscar dados históricos para {symbol}: {e}")
            return {"dates": [], "prices": []}