'use strict';

var
  http = require('http'),
  express = require('express'),
  basicAuth = require('basic-auth-connect'),
  morgan = require('morgan'),
  log4js = require('log4js'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),

  app = express(),
  server = http.createServer(app),

  routes = require('./routes');

app.configure( function () {
  app.use(basicAuth('user', 'spa'));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function () {
  app.use(morgan('dev'));
  log4js.configure('config/log4js.json');
  // var systemLogger = log4js.getLogger('system');
  // systemLogger.info('kore ga domodomo %s', 'inserting my dick');
});

app.configure('production', function () {
  app.use(express.errorHandler());
});

routes.configRoutes(app, server);

server.listen(3000);
console.log(
  'Express server started listening on port %d in %s mode',
  server.address().port, app.settings.env
);
