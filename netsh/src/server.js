const express = require('express'); // Express.js framework for handling HTTP requests
const { exec } = require('child_process'); // Child process module to execute shell commands
const util = require('util'); // Utility module for various functions
const cors = require('cors'); // Import the cors module

const execAsync = util.promisify(exec); // Promisify the exec function for easier asynchronous handling
const app = express(); // Create an Express application
const port = 3001; // Set the port for the server to listen on

// Enable CORS (Cross-Origin Resource Sharing) to allow requests from different origins
app.use(cors());
app.use(express.json())

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

app.get('/api/getWifiInfo', async (req, res) => {
  try {
    const wifiInfo = await getWifiArray();
    res.json(wifiInfo);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/forgetNetworks', async (req, res) => {
  const { networkName } = req.body;
  console.log(`Received request to forget Wi-Fi network: ${networkName}`);

  try {
    console.log(`Forgetting Wi-Fi network: ${networkName}`);

    // Run the netsh command to delete the specified Wi-Fi network profile
    const { stderr, stdout } = await execAsync(`netsh wlan delete profile name="${networkName}"`);

    if (stderr) {
      console.error(`Error deleting Wi-Fi network "${networkName}": ${stderr}`);
      res.status(500).json({ success: false, message: `Error deleting Wi-Fi network "${networkName}"` });
    } else {
      console.log(`Wi-Fi network "${networkName}" deleted successfully.`);
      res.json({ success: true, message: `Wi-Fi network "${networkName}" deleted successfully.` });
    }
  } catch (error) {
    console.error(`Error forgetting Wi-Fi network "${networkName}": ${error.message}`);
    res.status(500).json({ success: false, message: `Error forgetting Wi-Fi network "${networkName}"` });
  }
});


// Start the server and listen for incoming requests on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});