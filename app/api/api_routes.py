from flask import Blueprint, jsonify, request
from ..services.stock_service import StockService
from ..services.market_service import MarketService

bp = Blueprint('api', __name__, url_prefix='/api')
stock_service = StockService()
market_service = MarketService()

@bp.route('/search')
def search():
    query = request.args.get('q', '')
    if len(query) < 2:
        return jsonify([])
    return jsonify(stock_service.search_stocks(query))

@bp.route('/market_data')
def market_data():
    symbol = request.args.get('symbol')
    return jsonify(market_service.get_market_data(symbol))

@bp.route('/historical_data')
def historical_data():
    symbol = request.args.get('symbol')
    range_days = request.args.get('range', '30')
    return jsonify(market_service.get_historical_data(symbol, range_days))