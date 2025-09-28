import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // We will create this file next

function App() {
  const [productId, setProductId] = useState('');
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchProduct = async () => {
    if (!productId) {
      setError('Please enter a Product ID.');
      return;
    }
    setLoading(true);
    setError('');
    setProductData(null);

    try {
      // Use the GET endpoint to fetch both blockchain data and AI insights
      const response = await axios.get(`http://localhost:3001/products/${productId}`);
      console.log(response.data);
      setProductData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>🌿 VeriFresh</h1>
        <p>Enter a Product ID to verify its supply chain journey.</p>
      </header>

      <div className="search-box">
        <input
          type="text"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="Enter Product ID (e.g., 304)"
        />
        <button onClick={handleFetchProduct} disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Product'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {productData && (
        <div className="results-container">
          <div className="result-card">
            <h2>Blockchain Data</h2>
            <p><strong>Product Name:</strong> {productData.productData.name}</p>
            <p><strong>Farm:</strong> {productData.productData.farmName}</p>
            <p><strong>Harvest Time:</strong> {new Date(productData.productData.harvestTimestamp * 1000).toLocaleString()}</p>
            <h3>History</h3>
            <ul>
              {productData.productData.history.map((log, index) => (
                <li key={index}>
                  <strong>{log.status}</strong> at {log.location} on {new Date(log.timestamp * 1000).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>

          <div className="result-card ai-card">
            <h2>🤖 AI Insights (from Gemini)</h2>
            <p><strong>Freshness Score:</strong> {productData.aiInsights.freshness_score}/100</p>
            <p><strong>Visual Inspection:</strong> {productData.aiInsights.visual_inspection || 'N/A'}</p>
            <p><strong>Quality Assessment:</strong> {productData.aiInsights.quality_assessment}</p>
            <p><strong>Transit Anomalies:</strong> {productData.aiInsights.transit_anomalies}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;