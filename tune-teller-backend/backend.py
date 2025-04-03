import os
from flask import Flask, request, jsonify
import numpy as np
import librosa
import joblib
from pydub import AudioSegment
from flask_cors import CORS
from io import BytesIO

app = Flask(__name__)
CORS(app)

# Load MLP classifier and scaler
model_path = os.path.join(os.path.dirname(__file__), "mlp_model.pkl")
model = joblib.load(model_path)

scaler_path = os.path.join(os.path.dirname(__file__), "scaler.pkl")
scaler = joblib.load(scaler_path)

# Song class labels
classes = [
    "baby shark",
    "mary had a little lamb",
    "Merry Christmas",
    "Old McDonald Had a Farm",
    "Twinkle Twinkle",
    "Wheels on the Bus"
]

# Extract features from in-memory audio blob
def extract_features_from_blob(audio_bytes):
    try:
        # Convert blob to mp3 using pydub
        sound = AudioSegment.from_file(BytesIO(audio_bytes), format="wav")
        mp3_io = BytesIO()
        sound.export(mp3_io, format="mp3")
        mp3_io.seek(0)

        # Load using librosa (first 5 seconds)
        audio, sample_rate = librosa.load(mp3_io, sr=None, res_type='kaiser_fast', duration=5.0)

        mfccs = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=60)
        mfccs_scaled = np.mean(mfccs.T, axis=0)

        chroma = librosa.feature.chroma_stft(y=audio, sr=sample_rate)
        chroma_scaled = np.mean(chroma.T, axis=0)

        mel = librosa.feature.melspectrogram(y=audio, sr=sample_rate)
        mel_scaled = np.mean(mel.T, axis=0)

        features = np.hstack((mfccs_scaled, chroma_scaled, mel_scaled))
        return features

    except Exception as e:
        print(f"❌ Feature Extraction Failed: {e}")
        raise

# Prediction route
@app.route('/predict', methods=['POST'])
def predict_song():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Invalid file name'}), 400

    try:
        file_bytes = file.read()
        features = extract_features_from_blob(file_bytes)

        if features.shape[0] != 200:
            return jsonify({'error': f'Expected 200 features, got {features.shape[0]}'}), 400

        scaled = scaler.transform([features])
        prediction = model.predict(scaled)[0]
        song_name = classes[prediction]

        return jsonify({'song_name': song_name})

    except Exception as e:
        print(f"❌ Backend Error: {str(e)}")
        return jsonify({'error': f"Internal Server Error: {str(e)}"}), 500

# Root route to verify deployment
@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Tune Teller MLP Backend is Running!'})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
