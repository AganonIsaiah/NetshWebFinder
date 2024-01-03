const express = require('express'); // Express.js framework for handling HTTP requests
const { exec } = require('child_process'); // Child process module to execute shell commands
const util = require('util'); // Utility module for various functions
const cors = require('cors'); // Import the cors module

// Promisify the exec function for easier asynchronous handling
const execAsync = util.promisify(exec);

// Create an Express application
const app = express();

// Set the port for the server to listen on
const port = 3001;

// Enable CORS (Cross-Origin Resource Sharing) to allow requests from different origins
app.use(cors());

// Function to retrieve Wi-Fi information asynchronously
async function getWifiArray() {
  const wifiArray = [];

  // Get output of 'netsh wlan show profiles' cmd
  const { stdout: data } = await execAsync('netsh wlan show profiles');

  // Retrieve names from output
  const profiles = data.split('\r\n')
    .filter(line => line.includes('All User Profile'))
    .map(line => line.split(":")[1].trim());

  // Asynchronously retrieves key from each profile
  await Promise.all(profiles.map(async profile => {
    const { stdout: results } = await execAsync(`netsh wlan show profile "${profile}" key=clear`);

    // Retrieves key from output
    const keyContent = results.split('\r\n')
      .filter(line => line.includes('Key Content'))
      .map(line => line.split(":")[1].trim());

    if (keyContent.length > 0) {
      // Store Wi-Fi name and passcode in the array
      wifiArray.push({
        name: profile.trim(),
        password: keyContent[0]
      });
    }
  }));

  return wifiArray;
}

// API endpoint to retrieve Wi-Fi information
app.get('/api/getWifiInfo', async (req, res) => {
  try {
    // Call the asynchronous function to get Wi-Fi information
    const wifiInfo = await getWifiArray();
    // Respond with the Wi-Fi information in JSON format
    res.json(wifiInfo);
  } catch (error) {
    // Log any errors and respond with a 500 Internal Server Error
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server and listen for incoming requests on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});