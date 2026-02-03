from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

model_pipeline = joblib.load("bridge_model.pkl")

def sendHealthStatus(bqi):
    if 100 >= bqi >= 80:
        return "EXCELLENT"
    elif 80 > bqi >= 60:
        return "GOOD"
    elif 60 > bqi >= 40:
        return "FAIR"
    elif 40 > bqi >= 20:
        return "POOR"
    elif 20 > bqi >= 0:
        return "CRITICAL"
    else:
        return "ERROR DATA"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    df = pd.DataFrame([data])

    prediction = model_pipeline.predict(df)[0]

    bqi = float(prediction) * 100

    healthStatus = sendHealthStatus(bqi)

    return jsonify({
        "healthIndex": bqi,
        "healthState": healthStatus,
        "recommendedAction": ""
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)
