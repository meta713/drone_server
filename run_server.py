from flask import Flask, request
from predict_number import predict_image_by_model
import json
app = Flask(__name__)

@app.route('/', methods=['GET'])
def detect_number():
    try:
        filenames = request.args.get('filenames')
        result = predict_image_by_model(filenames, 'model.h5')
        return json.dumps(result)
    except Exception as e:
        print(e)
        return ''

if __name__ == '__main__':
    app.run()
