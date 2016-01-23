module.exports = function() {
  'use-strict';
  
  const port = process.env.PORT || 4000;
  const mongoConnectionString = process.env.MONGO_CONNECTION_STRING;
  
  return {
    port,
    mongoConnectionString
  };
};