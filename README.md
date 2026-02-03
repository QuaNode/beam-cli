# beam-cli
CLI for BeamJS applications

# Server Bootstrap & Clustering

This module is responsible for starting the BeamJS server,
handling clustering, and bootstrapping the application entry point.

---

## Entry File

The main entry point of the application is:


./server.js 

This file is responsible for initializing the server and running the application in either single or clustered mode

## Clustering

The server supports Node.js clustering to improve performance by utilizing all available CPU cores:

The master process forks worker processes

Each worker runs an instance of the server

If a worker crashes, it can be restarted automatically

This behavior is similar to how NestJS handles scalable production setups

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




## Environment Variables

PORT (Required)
The server requires a PORT environment variable to be defined
Example: PORT=3000

If the PORT variable is not provided, the server will stop and throw an explicit error:PORT environment variable is not defined

This ensures the application does not run in an invalid state following best practices used in NestJS applications

Example Server Code

const http = require('http');

const PORT = process.env.PORT;
if (!PORT) throw new Error('PORT environment variable is not defined');

http.createServer((req, res) => {
  res.end('Server is running!');
}).listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});


## Server Startup Flow

Load environment variables
Validate required variables (PORT)
Initialize clustering (if enabled)
Start the server on the specified port

---
