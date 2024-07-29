import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { X } from 'lucide-react';
import './Saves.css';

const SavesTab = () => {
  const [savedForecasts, setSavedForecasts] = useState([]);
  const [selectedForecast, setSelectedForecast] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    fetchSavedForecasts();
  }, []);

  const fetchSavedForecasts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/get_saved_forecasts');
      setSavedForecasts(response.data);
    } catch (error) {
      console.error('Error fetching saved forecasts:', error);
    }
  };

  const handleSelectForecast = (forecast) => {
    setSelectedForecast(forecast);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const formatForecastData = (forecast) => {
    return forecast.forecast_index.map((date, index) => ({
      date,
      forecast: forecast.forecast[index],
      lowerCI: forecast.confidence_intervals && forecast.confidence_intervals[index] ? forecast.confidence_intervals[index][0] : null,
      upperCI: forecast.confidence_intervals && forecast.confidence_intervals[index] ? forecast.confidence_intervals[index][1] : null
    }));
  };

  const ForecastThumbnail = ({ forecast }) => (
    <div className="forecast-thumbnail" onClick={() => handleSelectForecast(forecast)}>
      <h3>{forecast.model_name || 'Unknown Model'}</h3>
      {forecast.region && <p>Region: {forecast.region}</p>}
      <p>File: {forecast.file_name || 'Unnamed'}</p>
      <p>{new Date(forecast.timestamp).toLocaleString()}</p>
      <div style={{ width: '100%', height: '100px' }}>
        <ResponsiveContainer>
          <LineChart data={formatForecastData(forecast)}>
            <Line type="monotone" dataKey="forecast" stroke="#8884d8" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="saves-container">
      <h2>Saved Forecasts</h2>
      <div className="forecasts-grid">
        {savedForecasts.map((forecast, index) => (
          <ForecastThumbnail key={index} forecast={forecast} />
        ))}
      </div>
      {isPopupOpen && selectedForecast && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="saves-popup-close-button" onClick={closePopup}>
              <X size={24} />
            </button>
            <h2>Forecast Details</h2>
            <div className="selected-forecast">
              <p>Model Type: {selectedForecast.model_name || 'Unknown Model'}</p>
              {selectedForecast.region && <p>Region: {selectedForecast.region}</p>}
              <p>File: {selectedForecast.file_name || 'Unnamed'}</p>
              <p>RMSE: {selectedForecast.rmse.toFixed(4)}</p>
              <div style={{ width: '100%', height: '400px' }}>
                <ResponsiveContainer>
                  <LineChart
                    data={formatForecastData(selectedForecast)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="forecast" stroke="#8884d8" />
                    {selectedForecast.confidence_intervals && selectedForecast.confidence_intervals.length > 0 && (
                      <>
                        <Line type="monotone" dataKey="lowerCI" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="upperCI" stroke="#ffc658" />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="table-container">
                <table className="forecast-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Forecast</th>
                      {selectedForecast.confidence_intervals && selectedForecast.confidence_intervals.length > 0 && (
                        <>
                          <th>Lower CI</th>
                          <th>Upper CI</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {formatForecastData(selectedForecast).map((data, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                        <td>{data.date}</td>
                        <td>{data.forecast.toFixed(2)}</td>
                        {selectedForecast.confidence_intervals && selectedForecast.confidence_intervals.length > 0 && (
                          <>
                            <td>{data.lowerCI !== null ? data.lowerCI.toFixed(2) : 'N/A'}</td>
                            <td>{data.upperCI !== null ? data.upperCI.toFixed(2) : 'N/A'}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavesTab;