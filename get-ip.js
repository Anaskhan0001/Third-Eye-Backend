const os = require('os');

const interfaces = os.networkInterfaces();
console.log('\n🌐 Your Network IPs:\n');

Object.keys(interfaces).forEach(name => {
  interfaces[name].forEach(iface => {
    if (iface.family === 'IPv4' && !iface.internal) {
      console.log(`${name}: ${iface.address}`);
    }
  });
});

console.log('\n📌 Add this IP to MongoDB Atlas IP Whitelist\n');
