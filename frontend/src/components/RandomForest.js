import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import dayjs from 'dayjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './RandomForest.css'

const RandomForestForecast = () => {
  const [file, setFile] = useState(null);
  const [region, setRegion] = useState('IN');
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef(null);

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleRegionChange = (e) => {
    setRegion(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first');
      return;
    }
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('region', region);

    try {
      const response = await axios.post('http://localhost:5000/forecast_rf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setForecast({ ...response.data, file_name: file.name });
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.response?.data?.error || 'Error uploading file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatForecastData = () => {
    if (!forecast || !forecast.forecast_index || !forecast.forecast) {
      return [];
    }
    return forecast.forecast_index.map((date, index) => ({
      date: date,
      forecast: forecast.forecast[index]?.toFixed(2) || 0
    }));
  };

  const handleDownloadPDF = async () => {
    if (!forecast) return;

    const pdf = new jsPDF();
    
    pdf.setFontSize(16);
    pdf.text('Random Forest Forecast', 14, 15);

    pdf.setFontSize(12);
    pdf.text(`RMSE: ${forecast.rmse?.toFixed(2) || 'N/A'}`, 14, 25);

    if (chartRef.current) {
      try {
        const dataUrl = await toPng(chartRef.current, { quality: 0.95 });
        pdf.addImage(dataUrl, 'PNG', 10, 30, 190, 100);
      } catch (err) {
        console.error('Error generating chart image:', err);
      }
    }

    pdf.autoTable({
      head: [['Date', 'Forecast']],
      body: (forecast.forecast_index || []).map((date, index) => [
        dayjs(date).format('YYYY-MM-DD'),
        forecast.forecast[index]?.toFixed(2) || 'N/A'
      ]),
      startY: 140
    });

    pdf.save('random_forest_forecast.pdf');
  };

  const handleDownloadCSV = async () => {
    if (!forecast) return;

    const csvContent = [
      ['Date', 'Forecast'],
      ...forecast.forecast_index.map((date, index) => [
        date,
        forecast.forecast[index]?.toFixed(2) || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvLink = document.createElement('a');
    csvLink.href = csvUrl;
    csvLink.setAttribute('download', 'random_forest_forecast.csv');
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);

    if (chartRef.current) {
      try {
        const dataUrl = await toPng(chartRef.current, { quality: 0.95 });
        const link = document.createElement('a');
        link.download = 'random_forest_forecast_chart.png';
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Error generating chart image:', err);
      }
    }
  };

  const handleSave = async() => {
    if (!forecast) return;
    try {
      await axios.post('http://localhost:5000/save_forecast', forecast);
      alert('Forecast saved successfully!');
    } catch (error) {
      console.error('Error saving forecast:', error);
      alert('Failed to save forecast. Please try again.');
    }
  };

  return (
    <div className="random-forest-forecast">
      <h2>MULTIVARIATE Forecast</h2>
      <form onSubmit={handleSubmit}>
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          {file ? (
            <p>Selected file: {file.name}</p>
          ) : (
            <p>Drag 'n' drop a CSV file here, or click to select a file</p>
          )}
        </div>
        <select value={region} onChange={handleRegionChange}>
          <option value="IN">India</option>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="UK">United Kingdom</option>
          <option value="FR">France</option>
          <option value="DE">Germany</option>
          <option value="AU">Australia</option>
        </select>
        <button type="submit" disabled={isLoading || !file} className='rf-upload-button'>
          {isLoading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {forecast && (
        <div className="forecast-results">
          <h3>RMSE: {forecast.rmse?.toFixed(2) || 'N/A'}</h3>
          <h3>Forecast:</h3>
          <div ref={chartRef}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={formatForecastData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="forecast" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <table className="forecast-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Forecast</th>
              </tr>
            </thead>
            <tbody>
              {forecast.forecast_index?.map((date, index) => (
                <tr key={index}>
                  <td>{date}</td>
                  <td>{forecast.forecast[index]?.toFixed(2) || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="button-container">
            <button onClick={handleDownloadPDF} className="rf-download-button">Download PDF</button>
            <button onClick={handleDownloadCSV} className="rf-download-button">Download CSV and Chart</button>
            <button onClick={handleSave} className="rf-save-button">Save to Saves Tab</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RandomForestForecast;