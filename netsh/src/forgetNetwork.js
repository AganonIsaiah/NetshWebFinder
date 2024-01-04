const { spawn } = require('child_process');
const path = require('path');

const networkNameToDelete = process.argv.slice(2).join(' ');

if (!networkNameToDelete) {
  console.error('Network name not provided.');
  process.exit(1);
}

try {
  console.log('Deleting Wi-Fi network:', networkNameToDelete);

  const netshPath = path.join(process.env.SystemRoot, 'System32', 'netsh.exe');
  const scriptPath = path.join(__dirname, 'forgetNetworks.js');

  const scriptProcess = spawn(netshPath, ['wlan', 'delete', 'profile', `name="${networkNameToDelete}"`], { shell: true });

  scriptProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  scriptProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  scriptProcess.on('close', (code) => {
    if (code === 0) {
      console.log(`Wi-Fi network "${networkNameToDelete}" deleted successfully.`);
      process.exit(0);
    } else {
      console.error(`Error deleting Wi-Fi network "${networkNameToDelete}"`);
      process.exit(1);
    }
  });
} catch (error) {
  console.error(`Error deleting Wi-Fi network "${networkNameToDelete}": ${error.message}`);
  process.exit(1);
}
