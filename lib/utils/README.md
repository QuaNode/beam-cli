#  Utils 

## Prompt 
A shared location for common utilities, helpers, and constants used across both CLI and Backend apps.

### Contents:
- Loggers
- Environment parsers
- Shared Types/Interfaces

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
