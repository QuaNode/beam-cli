const beam = require('beamjs');
const path = require('path');

const behavioursPath = path.join(__dirname, 'behaviours');

const port = process.env.PORT || 3000;

beam.app(behavioursPath, {
  path: '/api/v1',
  port: port,
  parser: 'json',
  origins: '*'
});
