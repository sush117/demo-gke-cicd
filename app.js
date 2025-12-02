const http = require('http');
const port = process.env.PORT || 8080;
http.createServer((req, res) => {
  res.end('Hello World from GKE!');
}).listen(port, () => console.log(`Listening on ${port}`));
