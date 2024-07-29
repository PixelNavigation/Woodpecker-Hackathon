import React, { useState, useRef } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import FileUpload from './FileUpload';
import './ARIMA.css';

const ARIMA = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [forecast, setForecast] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef(null);

  const handleFileDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
    setFileName(acceptedFiles[0].name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/forecast_arima', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setForecast({ ...response.data, file_name: file.name });
      setShowPopup(true);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!forecast) return;

    const pdf = new jsPDF();
    
    if (chartRef.current) {
      try {
        const dataUrl = await toPng(chartRef.current, { quality: 0.95 });
        pdf.addImage(dataUrl, 'PNG', 10, 10, 190, 100);
      } catch (err) {
        console.error('Error generating chart image:', err);
      }
    }

        pdf.autoTable({
      head: [['Date', 'Forecast', 'Lower CI', 'Upper CI']],
      body: (forecast.forecast_index || []).map((date, index) => [
        dayjs(date).format('YYYY-MM-DD'),
        forecast.forecast[index],
        forecast.confidence_intervals[index][0],
        forecast.confidence_intervals[index][1]
      ]),
      startY: 120
    });

    pdf.save('arima_forecast.pdf');
  };

  const handleDownloadCSV = async () => {
    if (!forecast) return;
    const csvContent = [
      ['Date', 'Forecast', 'Lower CI', 'Upper CI'],
      ...(forecast.forecast_index || []).map((date, index) => [
        date,
        forecast.forecast[index],
        forecast.confidence_intervals[index][0],
        forecast.confidence_intervals[index][1]
      ])
    ].map(row => row.join(',')).join('\n');

    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvLink = document.createElement('a');
    csvLink.href = csvUrl;
    csvLink.setAttribute('download', 'arima_forecast.csv');
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);

    if (chartRef.current) {
      try {
        const dataUrl = await toPng(chartRef.current, { quality: 0.95 });
        const link = document.createElement('a');
        link.download = 'arima_forecast_chart.png';
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

  const formatForecastData = () => {
    if (!forecast) return [];
    return (forecast.forecast_index || []).map((date, index) => ({
      date: dayjs(date).format('YYYY-MM-DD'),
      forecast: forecast.forecast[index],
      lowerCI: forecast.confidence_intervals[index][0],
      upperCI: forecast.confidence_intervals[index][1]
    }));
  };

  return (
    <div className="arima-container">
      <h2>UNIVARIATE FORECAST</h2>
      <form onSubmit={handleSubmit}>
        <FileUpload onDrop={handleFileDrop} fileName={fileName} />
        <button type="submit" disabled={isLoading || !file} className='arima-upload-button'>
          {isLoading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {isLoading && <div className="loading-indicator">Processing your file. Please wait...</div>}
      {showPopup && forecast && (
        <div className="popup-card">
          <button className="close-button" onClick={() => setShowPopup(false)}>×</button>
          <h3>Forecast Results</h3>
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
                <Line type="monotone" dataKey="lowerCI" stroke="#82ca9d" />
                <Line type="monotone" dataKey="upperCI" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <table className="forecast-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Forecast</th>
                <th>Lower CI</th>
                <th>Upper CI</th>
              </tr>
            </thead>
            <tbody>
              {(forecast.forecast_index || []).map((date, index) => (
                <tr key={index}>
                  <td>{dayjs(date).format('YYYY-MM-DD')}</td>
                  <td>{forecast.forecast[index]}</td>
                  <td>{forecast.confidence_intervals[index][0]}</td>
                  <td>{forecast.confidence_intervals[index][1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="button-container">
            <button onClick={handleDownloadPDF} className="arima-download-button">Download PDF</button>
            <button onClick={handleDownloadCSV} className="arima-download-button">Download CSV and Chart</button>
            <button onClick={handleSave} className="arima-save-button">Save to Saves Tab</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARIMA;
