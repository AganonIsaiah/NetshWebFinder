import React, { useState } from 'react';
import axios from 'axios';

const AddNetwork = ({ onNetworkAdded }) => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');

  const handleAddNetwork = async () => {
    try {
      // Make an HTTP request to the server to add the Wi-Fi network
      await axios.post('http://localhost:3001/api/addNetwork', { ssid, password });
      console.log(`Add network request sent for "${ssid}"`);

      // Call the onNetworkAdded callback passed as a prop
      if (onNetworkAdded) {
        onNetworkAdded();
      }

      // Clear input fields after successful addition
      setSsid('');
      setPassword('');
    } catch (error) {
      console.error('Error sending add network request:', error);
    }
  };

  return (
    <div>
      <h2>Add New Network</h2>
      <label>
        SSID (Network Name):
        <input type="text" value={ssid} onChange={(e) => setSsid(e.target.value)} />
      </label>
      <br />
      <label>
        Password:
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <br />
      <button onClick={handleAddNetwork}>Add Network</button>
    </div>
  );
};

export default AddNetwork;
