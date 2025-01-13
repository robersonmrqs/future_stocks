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