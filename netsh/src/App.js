// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [wifiInfo, setWifiInfo] = useState([]);

  useEffect(() => {
    const fetchWifiInfo = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/getWifiInfo');
        setWifiInfo(response.data);
      } catch (error) {
        console.error('Error:', error.message);
      }
    };

    fetchWifiInfo();
  }, []);

  return (
    <div>
      <h1>Wi-Fi Information</h1>
      <ul>
        {wifiInfo.map((wifi, index) => (
          <li key={index}>
            <strong>Name:</strong> {wifi.name}, <strong>Password:</strong> {wifi.password}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
