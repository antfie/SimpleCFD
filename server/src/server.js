var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');
var server = express();

module.exports = function(logger, port, router) {
  'use-strict';
  
  server.set('views', 'server/views');
  server.set('view engine', 'ejs');
  server.set('x-powered-by', false);
  
  server.use(compression());
  server.use(express.static('client/bundle'));
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(bodyParser.json());
  server.use(router);
  
  var listen = function() {
    server.listen(port, function() {
      logger.log('Listening on port %s.', port);
    });
  };

  return {
    listen
  };
};