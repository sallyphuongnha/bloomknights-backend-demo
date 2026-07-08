const http = require("node:http");
const { createApp } = require("./app");

const port = Number(process.env.PORT) || 3000;
const app = createApp();

const server = http.createServer(app.handle);

server.listen(port, () => {
  console.log(`BloomKnights backend demo running at http://localhost:${port}`);
});
