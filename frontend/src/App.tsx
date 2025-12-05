import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import WeatherPage from './pages/WeatherPage';
import ErrorPage from './pages/ErrorPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/weather" element={<WeatherPage />} />
        <Route 
          path="*" 
          element={<ErrorPage code={404} message="Page Not Found" />} 
        />
        <Route 
          path="/500" 
          element={<ErrorPage code={500} message="Internal Server Error" />} 
        />
      </Routes>
    </Router>
  );
};

export default App;
