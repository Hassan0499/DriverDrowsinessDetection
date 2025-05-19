from flask import Flask, render_template, request, jsonify
import detection
import numpy as np
import base64
import cv2

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/process_frame', methods=['POST'])
def process_frame():
    data = request.get_json()
    if 'image' not in data:
        return jsonify({'error': 'No image provided'}), 400

    encoded_data = data['image'].split(',')[1]
    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    processed_image, alarm = detection.process_frame(frame)
    return jsonify({
        'image': f"data:image/jpeg;base64,{processed_image}",
        'alarm': alarm
    })

if __name__ == '__main__':
    app.run(debug=True)
