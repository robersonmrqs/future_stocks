from flask import Blueprint, render_template, request, flash
from ..services.stock_service import StockService
import json

bp = Blueprint('main', __name__)
stock_service = StockService()

@bp.route('/', methods=['GET', 'POST'])
def index():
    data = None
    historical_data = None
    
    if request.method == 'POST':
        try:
            symbol = request.form.get('symbol')
            if not symbol:
                flash('No symbol provided', 'error')
                return render_template('index.html', data=data, historical_data=historical_data)
            
            data = stock_service.fetch_stock_data(symbol)
            if data and 'historical_values' in data:
                historical_data = json.dumps(data['historical_values'])
            else:
                flash('No data returned for the symbol', 'error')
                
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    # Always pass both variables to template
    return render_template('index.html', data=data, historical_data=historical_data)

@bp.route('/analyze', methods=['POST'])
def analyze():
    try:
        symbol = request.form.get('symbol')
        if not symbol:
            return {"error": "No symbol provided"}, 400
        
        data = stock_service.fetch_stock_data(symbol)
        if not data:
            return {"error": "No data found for the symbol"}, 404
        
        # Retorne os dados para o frontend
        return {"data": data}, 200
    except Exception as e:
        return {"error": str(e)}, 500