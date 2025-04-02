import os
from flask import Flask, request, jsonify
import numpy as np
import librosa
import joblib
from pydub import AudioSegment
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load MLP classifier and scaler
model = joblib.load("mlp_model.pkl")
scaler = joblib.load("scaler.pkl")

# Song class labels
classes = ["baby shark", "mary had a little lamb", "Merry Christmas", 
           "Old McDonald Had a Farm", "Twinkle Twinkle", "Wheels on the Bus"]

# Allowed file extensions
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'm4a', 'aac'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Convert any file to mp3
def convert_to_mp3(file_path):
    extension = file_path.split('.')[-1].lower()
    if extension != 'mp3':
        sound = AudioSegment.from_file(file_path)
        mp3_path = file_path.rsplit('.', 1)[0] + ".mp3"
        sound.export(mp3_path, format="mp3")
        return mp3_path
    return file_path

# Extract audio features
def extract_features(file_path):
    file_path = convert_to_mp3(file_path)
    audio, sample_rate = librosa.load(file_path, res_type='scipy')

    mfccs = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=60)
    mfccs_scaled = np.mean(mfccs.T, axis=0)

    chroma = librosa.feature.chroma_stft(y=audio, sr=sample_rate)
    chroma_scaled = np.mean(chroma.T, axis=0)

    mel = librosa.feature.melspectrogram(y=audio, sr=sample_rate)
    mel_scaled = np.mean(mel.T, axis=0)

    features = np.hstack((mfccs_scaled, chroma_scaled, mel_scaled))
    print(f"✅ Extracted Features Shape: {features.shape}")  # Should be (200,)
    return features


# Prediction route
@app.route('/predict', methods=['POST'])
def predict_song():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    temp_dir = "temp"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, file.filename)
    file.save(file_path)

    try:
        features = extract_features(file_path)
        scaled = scaler.transform([features])
        prediction = model.predict(scaled)[0]
        song_name = classes[prediction]
        return jsonify({'song_name': song_name})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

# Deployment confirmation
@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Tune Teller MLP Backend is Running!'})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
