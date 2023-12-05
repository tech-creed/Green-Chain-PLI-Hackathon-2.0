from flask import jsonify, request
import numpy as np
import tensorflow as tf

from app import *

weekmodel = tf.keras.models.load_model("models/weekPrediction.h5", compile=False)
monthmodel = tf.keras.models.load_model("models/monthModel.h5", compile=False)

# Input 7 day emission
# Output next 7 day emission
@app.route('/week', methods = ['GET', 'POST'])
def week():
    print(request.json['data'])
    data = request.json['data']
    test = np.array(data).astype(np.float32)
    pred = weekmodel.predict(test.reshape(1,7))
    return jsonify({'data': pred.tolist()})

# Input 30 day emission
# Output next 30 day emission
@app.route('/month', methods = ['GET', 'POST'])
def month():
    data = request.json['data']
    test = np.array(data).astype(np.float32)
    pred = monthmodel.predict(test.reshape(1,30))
    return jsonify({'data': pred.tolist()})