# NetshWebFinder

NetshWebFinder is a simple web project developed using Node.js and React. It utilizes the 'netsh' command to perform operations on users' networks.

## Author

Isaiah Aganon

Email: IsaiahAganon@cmail.carleton.ca

## Features

1. **Display Network Information:**
   - Shows simple network information saved on users' computers.

2. **Forget Networks:**
   - Displays the networks' name and passcode along with an option to forget the network.

3. **Add New Networks:**
   - Allows users to save new networks to their computer by inputting an SSID and passcode.

4. **Device Impact:**
   - The options performed on this webpage affect the users' device by changing their 'known networks.'

5. **Limitations:**
   - Program is unable to fetch the wifi name and passcode of heavily secured networks (such as University network information).

### Installation

1. Clone the repository: git clone https://github.com/AganonIsaiah/NetshWebFinder.git
2. Navigate to project directory: cd netsh
3. Install dependencies: npm install
4. Start server: npm start
5. Open: http://localhost:3000/NetshWebFinder
