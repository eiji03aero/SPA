'use strict';

var
  countUp,

  http = require('http'),
  express = require('express'),
  socketIo = require('socket.io'),
  app = express(),
  server = http.createServer(app),
  countIdx = 0;

countUp = function () {
  countIdx += 1;
  console.log(countIdx);
};

app.configure(function () {
  app.use(express.static(__dirname, '/'));
});

app.get('/', function (req, res) {
  res.redirect('/socket.html');
});

server.listen(3000);
