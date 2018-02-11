'use strict';

var configRoutes;

configRoutes = function (app, server) {
  app.get('/', function (req, res) {
    res.redirect('/spa.html');
  });

  app.all('/:obj_type/*?', function (req, res, next) {
    res.contentType('json');
    next();
  })

  app.get('/:obj_type/list', function (req, res) {
    res.send({ title: req.params.obj_type + ' list' });
  });

  app.post('/:obj_type/create', function (req, res) {
    var { obj_type } = req.params;
    res.send({ title: req.params.obj_type + ' created' });
  });

  app.get('/:obj_type/read/:id([0-9]+)', function (req, res) {
    var { obj_type, id } = req.params;
    res.send({
      title: obj_type + ' with id ' + id + ' found'
    });
  });

  app.post('/:obj_type/update/:id([0-9]+)',
    function (req, res) {
      var { obj_type, id } = req.params;
      res.send({
        title: obj_type + ' with id ' + id + ' update'
      })
    }
  )

  app.get('/:obj_type/delete/:id([0-9]+)',
    function (req, res) {
      var { obj_type, id } = req.params;
      res.send({
        title: obj_type + ' with id ' + id + ' deleted'
      });
    }
  );
};

module.exports = { configRoutes: configRoutes };
