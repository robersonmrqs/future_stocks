from flask import Blueprint, render_template, request, flash, jsonify
from .utils import fetch_stock_data, search_stocks
import json

routes = Blueprint('routes', __name__)

@routes.route("/", methods=["GET", "POST"])
def index():
    data = None
    historical_data = None
    if request.method == "POST":
        try:
            symbol = request.form.get("symbol")
            if not symbol:
                flash("No symbol provided", "error")
                return render_template("index.html")
            
            data = fetch_stock_data(symbol)
            if data and "historical_values" in data:
                historical_data = json.dumps(data["historical_values"])
            else:
                flash("No data returned for the symbol", "error")
            
            return render_template(
                "index.html",
                data=data,
                historical_data=historical_data
            )
        except Exception as e:
            flash(f"Error: {str(e)}", "error")
            return render_template("index.html")
    
    return render_template("index.html")

@routes.route("/search", methods=["GET"])
def search():
    query = request.args.get("q", "")
    if len(query) < 2:
        return jsonify([])
    
    results = search_stocks(query)
    return jsonify(results)

import yfinance as yf
from flask import jsonify

@routes.route("/market_data")
def market_data():
    symbol = request.args.get('symbol')
    try:
        # Create a Ticker object
        ticker = yf.Ticker(symbol)
        
        # Get the latest data
        data = ticker.history(period='1d')
        
        if data.empty:
            return jsonify({
                'price': 0,
                'change': 0,
                'error': 'No data available'
            })
        
        # Get the latest price
        current_price = data['Close'].iloc[-1]
        
        # Calculate the percentage change
        previous_price = data['Open'].iloc[0]
        change_percent = ((current_price - previous_price) / previous_price) * 100
        
        return jsonify({
            'price': round(current_price, 2),
            'change': round(change_percent, 2)
        })
        
    except Exception as e:
        print(f"Error fetching data for {symbol}: {str(e)}")  # Add debugging
        return jsonify({
            'price': 0,
            'change': 0,
            'error': str(e)
        }), 200  # Return 200 instead of 500 to avoid breaking the UI

@routes.route("/historical_data")
def historical_data():
    symbol = request.args.get('symbol')
    range_days = request.args.get('range', '30')
    
    if range_days == 'max':
        period = 'max'
    else:
        period = f"{range_days}d"
    
    try:
        df = yf.download(symbol, period=period)
        data = df['Close'].tolist()
        dates = df.index.strftime('%Y-%m-%d').tolist()
        return jsonify({
            'prices': data,
            'dates': dates
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500