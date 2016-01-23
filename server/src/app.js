'use-strict';

var Server = require('./server');
var Config = require('./config');
var Repository = require('./repository');
var Controller = require('./controller');
var Router = require('./router');

var config = new Config();
var logger = console;

var repository = new Repository(logger, config.mongoConnectionString);
var controller = new Controller(repository);
var router = new Router(controller);
var server = new Server(logger, config.port, router);

repository.connect().then(function(db) {
  server.listen(config.port);
});