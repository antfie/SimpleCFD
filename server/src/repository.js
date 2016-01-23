var BluebirdPromise = require('bluebird');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var Collection = mongodb.Collection;
var ObjectId = mongodb.ObjectId;

BluebirdPromise.promisifyAll(Collection.prototype);
BluebirdPromise.promisifyAll(MongoClient);

module.exports = function(logger, connectionString) {
  'use strict';
  
  let collection = null;
  
  let connect = function() {
    return MongoClient.connectAsync(connectionString).then(function(db) {
      collection = db.collection('data');
      logger.log('Connected to MongoDB.');
    });
  };
  
  let getData = function(link) {
    return collection.findOneAsync({ _id: ObjectId(link) }).then(function(data) {
      return data;
    });
  };
  
  let isNewLink = function(link) {
    return ObjectId.isValid(link);
  };
  
  let getNewLinkFromOldLink = function(oldLink) {
    return collection.findOneAsync({ oldLink: oldLink }).then(function(data) {
      return data._id;
    });
  };
  
  let getNewLink = function() {
    return new BluebirdPromise(function(resolve, reject) {
      return resolve(new ObjectId());
    });
  };
  
  let save = function(data) {
    data._id = ObjectId(data._id);
    return collection.saveAsync(data);
  };
  
  return {
    connect,
    getData,
    isNewLink,
    getNewLinkFromOldLink,
    getNewLink,
    save
  };
};