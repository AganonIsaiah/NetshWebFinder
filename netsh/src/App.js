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

  const handleForgetNetwork = async (name) => {
    try {
      const networkName = name.includes(' ') ? `"${name}"` : name;
  
      // Make an HTTP request to the server to forget the Wi-Fi network
      await axios.post('http://localhost:3001/api/forgetNetworks', { networkName });
      console.log(`Forget network request sent for "${networkName}"`);
    } catch (error) {
      console.error('Error sending forget network request:', error.message);
    }
  };
  
  
  
  
  return (
    <div>
      <h1>Wi-Fi Information</h1>
     
      <ul>
        {wifiInfo.map((wifi, index) => (
          <li key={index}>
            <strong>Name:</strong> {wifi.name}, <strong>Password:</strong> {wifi.password}
            <button onClick={() => handleForgetNetwork(wifi.name)}>Forget Network</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
