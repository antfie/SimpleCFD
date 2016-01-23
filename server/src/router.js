var Router = require('express').Router;

module.exports = function(controller) {
  'use strict';
  
  let router = Router();
  
  router.get('/', function(req, res) {
    return controller.getNewLink().then(function(newLink) {
      res.redirect('/' + newLink + '/');
    });
  });

  router.get('/:link/', function(req, res) {
    console.log('Request:', req.params.link);
    return controller.getData(req.params.link).then(function(data) {
      if (data && data.newLink) {
        return res.redirect('/' + data.newLink + '/');
      }
      
      return res.render('index', { data: data });
    });   
  });
  
  router.post('/:link/', function(req, res) {
    return controller.save(req).then(function() {
      console.log('Saved link: ' + req.params.link);
      return res.json({ ok: true });
    }).catch(function(err) {
      console.log('Error saving link ' + req.params.link + ': ', err);
      return res.sendStatus(500);
    });
  });
  
  return router;
};