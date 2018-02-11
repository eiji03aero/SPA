'use strict';

var
  setWatch,

  http = require('http'),
  express = require('express'),
  socketIo = require('socket.io'),
  fsHandle = require('fs'),
  morgan = require('morgan'),

  app = express(),
  server = http.createServer(app),
  io = socketIo.listen(server),
  watchMap = {};

setWatch = function (url_path, file_type) {
  console.log('setWatch called on ' + url_path);

  if (! watchMap[url_path]) {
    console.log('Setting watch on ' + url_path);

    fsHandle.watchFile(
      url_path.slice(1),
      function (current, previous) {
        console.log('file accessed %s', 'korekore');
        if (current.mtime !== previous.mtime) {
          console.log('file changed');
          io.sockets.emit(file_type, url_path);
        }
      }
    );
    watchMap[url_path] = true;
  }
}

app.configure(function () {
  app.use(function (req, res, next) {
    if (req.url.indexOf('/js/' >= 0)) {
      setWatch(req.url, 'script');
    }
    else if (req.url.indexOf('/css/') >= 0) {
      setWatch(req.url, 'stylesheet');
    }
    next();
  });
  app.use(express.static(__dirname, '/'));
  app.use(morgan('dev'));
});

app.get('/', function (req, res) {
  res.redirect('/socket.html');
});

server.listen(3000);
console.log(
  'Express server started listening on %d in %s mode',
  server.address().port, app.settings.env
);
