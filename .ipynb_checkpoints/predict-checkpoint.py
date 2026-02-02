# from flask import Flask, request, jsonify
import joblib
import pandas as pd

# app = Flask(__name__)

# model_pipeline = joblib.load('bridge_model.pkl')

# @app.route('/predict', methods=['POST'])
# def predict():
    # data = request.get_json()

data = {'Strain_microstrain': 1000, 'Vibration_ms2': 1000, 'Temperature_C': 20, 'Humidity_percent': 30}
    
df = pd.DataFrame([data])
    
prediction = model_pipeline.predict(df)

bqi = prediction

print(bqi)
    
# return jsonify({'healthIndex': prediction[0], })

# if __name__ == '__main__':
#     app.run(port=5000)