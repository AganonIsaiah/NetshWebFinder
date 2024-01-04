const { spawn } = require('child_process');
const path = require('path');

// Get the Wi-Fi network name to delete from command line arguments
const networkNameToDelete = process.argv.slice(2).join(' ');

// Check if the network name is provided; if not, exit with an error message
if (!networkNameToDelete) {
  console.error('Network name not provided.');
  process.exit(1);
}

try {
  // Log the start of the Wi-Fi network deletion process
  console.log('Deleting Wi-Fi network:', networkNameToDelete);

  // Construct the paths to the 'netsh.exe' and 'forgetNetworks.js' scripts
  const netshPath = path.join(process.env.SystemRoot, 'System32', 'netsh.exe');
  const scriptPath = path.join(__dirname, 'forgetNetworks.js');

  // Spawn a child process to execute the 'netsh' command to delete the Wi-Fi network
  const scriptProcess = spawn(netshPath, ['wlan', 'delete', 'profile', `name="${networkNameToDelete}"`], { shell: true });

  // Event listeners for capturing stdout, stderr, and close events of the spawned process
  scriptProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  scriptProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  scriptProcess.on('close', (code) => {
    // Check the exit code of the process to determine success or failure
    if (code === 0) {
      console.log(`Wi-Fi network "${networkNameToDelete}" deleted successfully.`);
      process.exit(0);
    } else {
      console.error(`Error deleting Wi-Fi network "${networkNameToDelete}"`);
      process.exit(1);
    }
  });
} catch (error) {
  // Handle any errors that occur during the deletion process
  console.error(`Error deleting Wi-Fi network "${networkNameToDelete}": ${error.message}`);
  process.exit(1);
}
