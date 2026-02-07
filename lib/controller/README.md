# main Controller

## Prompt 
This library encapsulates the logic for managing the backend processes.

### Core Responsibilities:
1.  **Clustering**: Implement clustering logic to spawn backend workers.
2.  **Health Check**: Implement a "Wait" mechanism to ensure the backend process is live before sending requests.
3.  **Path Management**: It must accept the path to the backend `server.js` and the port from environment variables.

## How Clustering Works Internally 

Node.js clustering allows the application to run multiple worker processes that share the same port.

Flow:

Master process starts

CPU cores are detected

Workers are forked

Each worker runs the same server instance

Requests are distributed between workers automatically

This increases:

Performance

Stability

CPU utilization

## Basic Cluster Setup

const cluster = require('cluster');
const os = require('os');
const http = require('http');

const cpuCount = os.cpus().length;
const PORT = process.env.PORT;

if (!PORT) throw new Error('PORT environment variable is not defined');

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < cpuCount; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

} else {
  http.createServer((req, res) => {
    res.end(`Handled by worker ${process.pid}`);
  }).listen(PORT);
}

## Server Startup Flow

Load environment variables
Validate required variables (PORT)
Initialize clustering (if enabled)
Start the server on the specified port
