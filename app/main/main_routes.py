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