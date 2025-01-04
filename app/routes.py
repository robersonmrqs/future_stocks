from flask import render_template, request, jsonify
from .utils import fetch_stock_data, predict_stock

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        symbol = request.form.get("symbol")
        data, predictions = fetch_stock_data(symbol)
        return render_template("index.html", data=data, predictions=predictions)
    return render_template("index.html")
