const http = require('http');
const utility = require('./services/utility');

const hostname = '0.0.0.0';
const port = 8080;

const startDate = utility.getRecurringStartDate();
console.log(startDate.format("YYYY-MM-DD HH:mm:ss").toString());
// const server = http.createServer((req, res) => {
//   res.writeHead(200, {'Content-Type': 'text/html'});
//   res.write('Hello World!');
//   res.end();
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

