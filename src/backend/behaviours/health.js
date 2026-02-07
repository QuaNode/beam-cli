const backend = require('beamjs').backend();
const behaviour = backend.behaviour();
const {
  FunctionalChainBehaviour
} = require('functional-chain-behaviour')();

module.exports.health = behaviour({
  name: 'health',
  inherits: FunctionalChainBehaviour,
  path: '/health',
  method: 'GET',
  parameters: {},
  returns: {
    status: {
      type: 'body'
    },
    timestamp: {
      type: 'body'
    }
  }
}, function (init) {
  return function () {
    var self = init.apply(this, arguments).self();
    self.map(function (response) {
      response.status = 'healthy';
      response.timestamp = new Date();
    }).end();
  };
});
