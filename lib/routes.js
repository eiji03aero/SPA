/*
 * routes.js - module to provide routing
*/

/*jslint         node    : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global */

// ------------ BEGIN MODULE SCOPE VARIABLES --------------
'use strict';
var
  configRoutes,
  crud = require('./crud.js'),
  chat = require('./chat'),
  makeMongoId = crud.makeMongoId;
// ------------- END MODULE SCOPE VARIABLES ---------------

// --------------- BEGIN PUBLIC METHODS ------------------
configRoutes = function (app, server) {
  app.get('/', function (req, res) {
    res.redirect('/spa.html');
  });

  app.all('/:obj_type/*?', function (req, res, next) {
    res.contentType('json');
    next();
  });

  app.get('/:obj_type/list', function (req, res) {
    crud.read(
      req.params.obj_type,
      {}, {},
      function (map_list) {
        res.send(map_list);
      }
    );
  });

  app.post('/:obj_type/create', function (req, res) {
    crud.construct(
      req.params.obj_type,
      req.body,
      function (map_list) { res.send(result_map); }
    );
  });

  app.get('/:obj_type/read/:id', function (req, res) {
    crud.read(
      req.params.obj_type,
      { _id: makeMongoId(req.params.id) },
      {},
      function (map_list) { req.send(map_list); }
    );
  });

  app.post('/:obj_type/update/:id', function (req, res) {
    crud.update(
      req.params.obj_type,
      { _id: makeMongoId(req.params.id) },
      req.body,
      function (result_map) { res.send(result_map); }
    );
  });

  app.get('/:obj_type/delete/:id', function (req, res) {
    crud.destroy(
      req.params.obj_type,
      { _id: makeMongoId(req.params.id) },
      function (result_map) { res.send(result_map); }
    );
  });

  chat.connect(server);
};

module.exports = { configRoutes : configRoutes };
// ----------------- END PUBLIC METHODS -------------------
