// var http, server;
//
// http = require('http');
// server = http.createServer(function (req, res) {
//   var response_text = req.url === '/test'
//     ? 'you have hit the test page'
//     : 'Hello world';
//   res.writeHead(200, { 'Content-Type': 'text/plain' });
//   res.end(response_text);
// }).listen(3000);
//
// console.log('Listening on port %d', server.address().port);
//
// var
//   connectHello, server,
//   http = require('http'),
//   connect = require('connect'),
//   logger = require('connect-logger'),
//   app = connect(),
//   bodyText = 'Hello connect';
//
// connectHello = function (req, res, next) {
//   res.setHeader('content-length', bodyText.length);
//   res.end(bodyText);
// };
//
// app
//   .use(logger)
//   .use(connectHello);
// server = http.createServer(app);
//
// server.listen(3000);
// console.log('started listening...');

'use strict';

var
  http = require('http'),
  express = require('express'),
  log4js = require('log4js'),
  logger = log4js.getLogger(),

  app = express(),
  server = http.createServer(app);

app.get('/', function (req, res) {
  res.send('Hello express');
});


server.listen(3000);
console.log(
  'Express server started listening on port %d in %s mode',
  server.address().port, app.settings.env
);
