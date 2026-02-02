# beam-cli
CLI for BeamJS applications

# Server Bootstrap & Clustering

This module is responsible for starting the BeamJS server
handling clustering and bootstrapping the application entry point



## Entry File

The main entry point of the application is

```bash
./server.js

This file is responsible for initializing the server and running the application in either single or clustered mode


## Clustering

The server supports Node.js clustering to improve performance by utilizing all available CPU cores

The master process forks worker processes

Each worker runs an instance of the server

If a worker crashes it can be restarted automatically

This behavior is similar to how NestJS handles scalable production setups


## Environment Variables

PORT (Required)
The server requires a PORT environment variable to be defined

example 
PORT=3000


If the PORT variable is not provided, the server will stop and throw an explicit error

Error: PORT environment variable is not defined
This ensures the application does not run in an invalid state, following best practices used in NestJS applications

const http = require('http');

const PORT = process.env.PORT
if (!PORT) throw new Error('PORT environment variable is not defined')

http.createServer((req, res) => {
  res.end('Server is running!')
}).listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})

## Server Startup Flow

Load environment variables

Validate required variables (PORT)

Initialize clustering (if enabled)

Start the server on the specified port



