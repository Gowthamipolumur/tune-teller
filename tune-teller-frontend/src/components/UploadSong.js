import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UploadSong = () => {
    const [file, setFile] = useState(null);
    const [prediction, setPrediction] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    // Handle file selection
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Handle file upload and prediction
    const handleFileUpload = async () => {
        if (!file) {
            alert('Please select a file first!');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setIsLoading(true); // Show loading state
            const response = await axios.post(`${BACKEND_URL}/predict`, formData);
            setPrediction(`Predicted Song: ${response.data.song_name}`);
        } catch (error) {
            console.error('Error predicting song:', error);
            alert('Error predicting the song. Please try again.');
        } finally {
            setIsLoading(false); // Hide loading state
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 text-center p-6">
            <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full">
                <h1 className="text-4xl font-bold mb-4 text-purple-600">📤 Upload a Song</h1>

                {/* Back to Home Button */}
                <button
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-all mb-6"
                    onClick={() => navigate('/')}
                >
                    🔙 Back to Home
                </button>

                {/* File Upload Section */}
                <input
                    type="file"
                    accept=".mp3,.wav,.m4a,.aac"
                    onChange={handleFileChange}
                    className="block w-full border-2 border-dashed border-blue-500 rounded-lg p-3 mb-4"
                />

                {/* Predict Button */}
                <button
                    className={`w-full text-white p-4 rounded-lg shadow-md transition-all ${
                        isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    onClick={handleFileUpload}
                    disabled={isLoading}
                >
                    {isLoading ? '⏳ Predicting...' : '🎯 Predict'}
                </button>

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

export default UploadSong;
