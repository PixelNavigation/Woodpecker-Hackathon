from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.arima.model import ARIMA
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import StandardScaler
import holidays
from datetime import datetime
app = Flask(__name__)
saved_forecasts = []
CORS(app)
@app.route('/forecast_arima', methods=['POST'])
def forecast_arima():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    file_name = file.filename
    try:
        data = pd.read_csv(file, parse_dates=['date'], index_col='date')
        if 'sales' not in data.columns:
            return jsonify({'error': 'CSV must contain a "sales" column'}), 400
        sales = data['sales']
        if len(sales) < 50:
            return jsonify({'error': 'Not enough data. Need at least 50 observations.'}), 400
        sales = sales.sort_index()
        date_range = pd.date_range(start=sales.index.min(), end=sales.index.max(), freq='D')
        sales = sales.reindex(date_range).interpolate()
        try:
            print("Fitting SARIMAX model...")
            model = SARIMAX(sales, order=(1, 1, 1), seasonal_order=(1, 1, 1, 12))
            arima_result = model.fit(disp=False)
        except Exception as e:
            print(f"SARIMAX fitting failed: {e}")
            try:
                print("Fitting ARIMA model...")
                model = ARIMA(sales, order=(1, 1, 1))
                arima_result = model.fit()
            except Exception as e2:
                print(f"ARIMA fitting failed: {e2}")
                return jsonify({'error': 'Both SARIMAX and ARIMA fitting failed', 'details': str(e2)}), 500
        forecast_steps = 30
        forecast = arima_result.get_forecast(steps=forecast_steps)
        forecast_index = pd.date_range(start=sales.index[-1] + pd.Timedelta(days=1), periods=forecast_steps)
        forecast_values = forecast.predicted_mean.tolist()
        try:
            conf_int = forecast.conf_int().values.tolist()
        except Exception as e:
            print(f"Confidence intervals not available: {e}")
            conf_int = [[None, None] for _ in range(forecast_steps)]
        try:
            last_30_days = sales[-30:]
            predicted_last_30 = arima_result.get_forecast(steps=30).predicted_mean
            rmse = np.sqrt(mean_squared_error(last_30_days, predicted_last_30))
        except Exception as e:
            print(f"RMSE calculation failed: {e}")
            rmse = None
        return jsonify({
            'model_name': 'UNIVARIATE',
            'forecast': forecast_values,
            'confidence_intervals': conf_int,
            'forecast_index': forecast_index.strftime('%Y-%m-%d').tolist(),
            'rmse': rmse,
            'actual': last_30_days.tolist(),
            'file_name': file_name
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/forecast_rf', methods=['POST'])
def forecast_rf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    file = request.files['file']
    if 'region' not in request.form:
        return jsonify({'error': 'Region must be specified'}), 400
    region = request.form['region']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    file_name = file.filename
    try:
        if not hasattr(holidays, region):
            return jsonify({'error': f'Unsupported region: {region}'}), 400
        data = pd.read_csv(file, parse_dates=['date'], index_col='date')
        if 'sales' not in data.columns:
            return jsonify({'error': 'CSV must contain a "sales" column'}), 400
        data['month'] = data.index.month
        data['year'] = data.index.year
        data['day_of_week'] = data.index.dayofweek
        data['day_of_month'] = data.index.day
        data['week_of_year'] = data.index.isocalendar().week
        data['quarter'] = data.index.quarter
        data['is_weekend'] = (data.index.dayofweek >= 5).astype(int)
        country_holidays = getattr(holidays, region)()
        data['is_holiday'] = data.index.to_series().apply(lambda x: x in country_holidays).astype(int)
        for lag in [1, 7, 14, 30]:
            data[f'sales_lag_{lag}'] = data['sales'].shift(lag)
        for window in [7, 14, 30]:
            data[f'sales_rolling_mean_{window}'] = data['sales'].rolling(window=window).mean()
            data[f'sales_rolling_std_{window}'] = data['sales'].rolling(window=window).std()
        data = data.dropna()
        X = data.drop('sales', axis=1)
        y = data['sales']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
        rf_model.fit(X_train_scaled, y_train)
        y_pred = rf_model.predict(X_test_scaled)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        last_date = data.index[-1]
        forecast_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=30)
        forecast_features = pd.DataFrame(index=forecast_dates)
        forecast_features['month'] = forecast_features.index.month
        forecast_features['year'] = forecast_features.index.year
        forecast_features['day_of_week'] = forecast_features.index.dayofweek
        forecast_features['day_of_month'] = forecast_features.index.day
        forecast_features['week_of_year'] = forecast_features.index.isocalendar().week
        forecast_features['quarter'] = forecast_features.index.quarter
        forecast_features['is_weekend'] = (forecast_features.index.dayofweek >= 5).astype(int)
        forecast_features['is_holiday'] = forecast_features.index.to_series().apply(lambda x: x in country_holidays).astype(int)
        for lag in [1, 7, 14, 30]:
            forecast_features[f'sales_lag_{lag}'] = y.iloc[-lag]
        for window in [7, 14, 30]:
            forecast_features[f'sales_rolling_mean_{window}'] = y.iloc[-window:].mean()
            forecast_features[f'sales_rolling_std_{window}'] = y.iloc[-window:].std()
        forecast_features_scaled = scaler.transform(forecast_features)
        forecast = rf_model.predict(forecast_features_scaled)
        return jsonify({
            'rmse': rmse,
            'forecast': forecast.tolist(),
            'forecast_index': forecast_dates.strftime('%Y-%m-%d').tolist(),
            'actual': y_test.tolist(),
            'model_name': 'MULTIVARIATE',
            'region': region,
            'file_name': file_name
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/save_forecast', methods=['POST'])
def save_forecast():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        data['timestamp'] = datetime.now().isoformat()
        saved_forecasts.append(data)
        
        return jsonify({'message': 'Forecast saved successfully', 'id': len(saved_forecasts) - 1}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/get_saved_forecasts', methods=['GET'])
def get_saved_forecasts():
    try:
        return jsonify(saved_forecasts), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
if __name__ == '__main__':
    app.run(debug=True)