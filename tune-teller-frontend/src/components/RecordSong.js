import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RecordSong = () => {
    const [audioURL, setAudioURL] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [prediction, setPrediction] = useState('');
    const [recorder, setRecorder] = useState(null);
    const [isRecordingActive, setIsRecordingActive] = useState(false);

    const navigate = useNavigate();
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    // Start Recording
    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const newRecorder = new MediaRecorder(stream);
        let chunks = [];

        newRecorder.ondataavailable = (e) => chunks.push(e.data);

        newRecorder.onstop = () => {
            const audioBlob = new Blob(chunks, { type: 'audio/wav' });
            const audioURL = URL.createObjectURL(audioBlob);
            setAudioURL(audioURL);

            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.wav');

            setRecorder(null);
            setIsRecordingActive(false);
        };

        newRecorder.start();
        setRecorder(newRecorder);
        setIsRecording(true);
        setIsRecordingActive(true); // Show recording indicator
    };

    // Stop Recording
    const stopRecording = () => {
        if (recorder) {
            recorder.stop();
            setIsRecording(false);
        }
    };

    // Predict the recorded song
    const handlePredict = async () => {
        if (!audioURL) {
            alert('Please record a song first!');
            return;
        }

        const audioBlob = await fetch(audioURL).then((res) => res.blob());
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.wav');

        try {
            const response = await axios.post(`${BACKEND_URL}/predict`, formData);
            setPrediction(`Predicted Song: ${response.data.song_name}`);
        } catch (error) {
            console.error('Error predicting song:', error);
            alert('Error predicting the song. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 text-center p-6">
            <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full">
                <h1 className="text-4xl font-bold mb-4 text-purple-600">🎤 Record a Song</h1>

                {/* Back to Home Button */}
                <button
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-all mb-6"
                    onClick={() => navigate('/')}
                >
                    🔙 Back to Home
                </button>

                {/* Visual Indicator for Active Recording */}
                {isRecordingActive && (
                    <p className="text-red-500 font-semibold mt-2">🔴 Recording in progress...</p>
                )}

                {/* Start/Stop Recording Buttons */}
                {!isRecording ? (
                    <button
                        className="bg-green-500 text-white p-4 w-full rounded-lg shadow-md hover:bg-green-600 transition-all"
                        onClick={startRecording}
                    >
                        🎙️ Start Recording
                    </button>
                ) : (
                    <button
                        className="bg-red-500 text-white p-4 w-full rounded-lg shadow-md hover:bg-red-600 transition-all"
                        onClick={stopRecording}
                    >
                        ⏹️ Stop Recording
                    </button>
                )}

                {/* Audio Playback and Prediction */}
                {audioURL && (
                    <div className="mt-4">
                        <audio
                            controls
                            src={audioURL}
                            className="w-full border border-gray-300 rounded-lg shadow-md"
                        />
                        <button
                            className="bg-blue-500 text-white p-3 w-full rounded-lg shadow-md hover:bg-blue-600 mt-4"
                            onClick={handlePredict}
                        >
                            🎯 Predict
                        </button>
                    </div>
                )}

                {/* Prediction Result */}
                {prediction && (
                    <h3 className="text-green-500 mt-4 font-semibold text-lg">
                        🎵 {prediction}
                    </h3>
                )}
            </div>
        </div>
    );
};

export default RecordSong;
