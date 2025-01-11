from flask import Blueprint, render_template, request, flash, current_app
from .utils import fetch_stock_data
import json

routes = Blueprint('routes', __name__)

@routes.route("/", methods=["GET", "POST"])
def index():
    data = None
    historical_data = None
    if request.method == "POST":
        try:
            symbol = request.form.get("symbol")
            data = fetch_stock_data(symbol)
            # Ensure historical_values are properly converted to a list of floats
            historical_data = json.dumps([float(x) for x in data["historical_values"]])
            return render_template(
                "index.html",
                data=data,
                historical_data=historical_data
            )
        except Exception as e:
            flash(f"Error fetching data: {str(e)}", "error")
            return render_template("index.html")
    
    return render_template("index.html")