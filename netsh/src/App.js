import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddNetwork from './addNetwork';
import './App.css'; // For styling

const App = () => {
  const [wifiInfo, setWifiInfo] = useState([]);

  // Function to fetch Wi-Fi information
  const fetchWifiInfo = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/getWifiInfo');
      setWifiInfo(response.data);
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  useEffect(() => {
    // Initial fetch when component mounts
    fetchWifiInfo();

    // Set up a timer to fetch Wi-Fi information every 5 seconds (adjust as needed)
    const refreshInterval = setInterval(() => {
       fetchWifiInfo();
     }, 3000);

    // Clear the interval when the component is unmounted
    return () => clearInterval(refreshInterval);
  }, []);

  const handleForgetNetwork = async (name) => {
    try {
      const networkName = name.includes(' ') ? `"${name}"` : name;

      // Make an HTTP request to the server to forget the Wi-Fi network
      await axios.post('http://localhost:3001/api/forgetNetworks', { networkName });
      console.log(`Forget network request sent for "${networkName}"`);

      // Update the state to remove the deleted network
      setWifiInfo((prevWifiInfo) =>
        prevWifiInfo.filter((wifi) => wifi.name !== name)
      );

    } catch (error) {
      console.error('Error sending forget network request:', error.message);
    }
  };

   // Callback function to be called after adding a new network
   const handleNetworkAdded = () => {
    // Fetch the updated Wi-Fi information after adding a network
    fetchWifiInfo();
  };

  return (
    <div className="app-container">
      <h1>Wi-Fi Information</h1>

      <ul className="wifi-list">
        {wifiInfo.map((wifi, index) => (
          <li key={index} className="wifi-item">
            <div className="wifi-details">
              <div>
                <strong>Name:</strong> {wifi.name}
              </div>
              <div>
                <strong>Password:</strong> {wifi.password}
              </div>
              <div>
                <button onClick={() => handleForgetNetwork(wifi.name)}>Forget Network</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <AddNetwork onNetworkAdded={handleNetworkAdded} />
    </div>
  );
};

export default App;