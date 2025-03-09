import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <div className="bg-white shadow-lg rounded-2xl p-10 max-w-md w-full text-center">
                <h1 className="text-4xl font-bold text-blue-600 mb-6">🎵 Tune Teller 🎵</h1>
                <p className="text-gray-600 mb-8">Guess the song with just a few notes!</p>

                <div className="space-y-5">
                    <Link
                        to="/record"
                        className="w-full bg-green-500 text-white p-4 rounded-xl shadow-md hover:bg-green-600 transition-all block"
                    >
                        🎤 Record a Song
                    </Link>

                    <Link
                        to="/upload"
                        className="w-full bg-blue-500 text-white p-4 rounded-xl shadow-md hover:bg-blue-600 transition-all block"
                    >
                        📤 Upload a Song
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
