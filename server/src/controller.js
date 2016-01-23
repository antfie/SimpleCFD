module.exports = function(repository) {
  'use strict';
  
  let getData = function(link) {
    if (repository.isNewLink(link)) {
      return repository.getData(link);
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
    
    return repository.save(data);
  };
  
  return {
    getData,
    getNewLink,
    save
  };
};