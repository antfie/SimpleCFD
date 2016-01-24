var moment = require('moment');
var extend = require('util')._extend;
var defaultData = require('./default');

module.exports = function(repository) {
  'use strict';
  
  var now = moment();
  for (var index = defaultData.data.length - 1; index > -1; index--) {
    var row = defaultData.data[index];
    row[0] = now.format('YYYY-MM-DD');
    now.subtract(1, 'day');
  }
  
  defaultData.events[0][0] = moment().subtract(2, 'days').format('YYYY-MM-DD');
  
  let getData = function(link) {
    if (repository.isNewLink(link)) {
      return repository.getData(link).then(function(data) {
        if (!data) {
          return defaultData;
        }
        
        delete data._id;        
        return data;
      });
    }
    
    return repository.getNewLinkFromOldLink(link).then(function(newLink) {
      return { newLink };
    });
  };
  
  let getNewLink = function(oldLink) {
    return repository.getNewLink();
  };
  
  let save = function(req) {
    let data = req.body;
    data._id = req.params.link;
    
    if (!data.publicLink) {
      return repository.getNewLink().then(function(publicLink) {
        data.publicLink = publicLink;        
        return repository.save(data);
      });
    }
    
    return repository.save(data);
  };
  
  return {
    getData,
    getNewLink,
    save
  };
};