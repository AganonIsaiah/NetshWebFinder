const express = require('express'); // Express.js framework for handling HTTP requests
const { exec, execSync } = require('child_process'); // Child process module to execute shell commands
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


// New endpoint for adding a Wi-Fi network
app.post('/api/addNetwork', async (req, res) => {
  const { ssid, password } = req.body;

  try {
    console.log('Received request to add Wi-Fi network:', ssid, password);

    // Create an XML file with the network profile
    const profileXml = `
      <WLANProfile xmlns="http://www.microsoft.com/networking/WLAN/profile/v1">
        <name>${ssid}</name>
        <SSIDConfig>
          <SSID>
            <name>${ssid}</name>
          </SSID>
        </SSIDConfig>
        <connectionType>ESS</connectionType>
        <connectionMode>manual</connectionMode>
        <MSM>
          <security>
            <authEncryption>
              <authentication>WPA2PSK</authentication>
              <encryption>AES</encryption>
              <useOneX>false</useOneX>
            </authEncryption>
            <sharedKey>
              <keyType>passPhrase</keyType>
              <protected>false</protected>
              <keyMaterial>${password}</keyMaterial>
            </sharedKey>
          </security>
        </MSM>
      </WLANProfile>
    `;

    // Save the XML to a file 
    const filePath = `${__dirname}/profiles/profile.xml`;

    require('fs').writeFileSync(filePath, profileXml);

    // Run the netsh command to add the profile
    execSync(`netsh wlan add profile filename="${filePath}" interface="Wi-Fi"`);

    // Log success
    console.log(`Wi-Fi network "${ssid}" added successfully.`);

    // Respond with success message
    res.json({ success: true, message: `Wi-Fi network "${ssid}" added successfully.` });
  } catch (error) {
    // Handle errors
    console.error(`Error adding new Wi-Fi network "${ssid}": ${error.message}`);
    // Respond with an error message
    res.status(500).json({ success: false, message: `Error adding Wi-Fi network "${ssid}"` });
  }
});

// Start the server and listen for incoming requests on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});