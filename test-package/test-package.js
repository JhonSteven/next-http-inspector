// Test package to verify the module resolution
console.log('Test package loaded successfully');

module.exports = {
  setupNextInstrument: function(options = {}) {
    console.log('setupNextInstrument called with options:', options);
    return {
      wsServer: null,
      uiServer: null
    };
  },
  reinitializeInstrument: function(options = {}) {
    console.log('reinitializeInstrument called with options:', options);
    return {
      wsServer: null,
      uiServer: null
    };
  }
};
