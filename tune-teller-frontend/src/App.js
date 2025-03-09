import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import RecordSongPage from './components/RecordSong';
import UploadSongPage from './components/UploadSong';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/record" element={<RecordSongPage />} />
                <Route path="/upload" element={<UploadSongPage />} />
            </Routes>
        </Router>
    );
};

export default App;
