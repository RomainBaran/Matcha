var mongodbConf = {
    MongoClient: require('mongodb').MongoClient,
    ObjectID: require('mongodb').ObjectID,
    url: 'mongodb://localhost:27017/matcha',
    insert: (db, values, collectionName) => {
     return new Promise((resolve, reject) => {
         var collection = db.collection(collectionName);
         collection.insertOne(values, (err, result) => {
             if (err) reject(err);
             resolve(result);
         });
     })
    },
    select: (db, filter, collectionName) => {
        return new Promise((resolve, reject) => {
            var collection = db.collection(collectionName);
            filter = (typeof filter !== 'object') ? {} : filter;
            collection.find(filter).toArray((err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    },
    update: (db, filter, update, collectionName) => {
        return new Promise((resolve, reject) => {
            var collection = db.collection(collectionName);
            filter = (typeof filter !== 'object') ? {} : filter;
            update = (typeof update !== 'object') ? {} : update;
            try{
                resolve(collection.updateOne(filter, update));
            } catch(err) {
                reject(err);
            }
        });
    },
    delete: (db, filter, collectionName) => {
        return new Promise((resolve, reject) => {
            var collection = db.collection(collectionName);
            filter = (typeof filter !== 'object') ? {} : filter;
            collection.deleteOne(filter).toArray((err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }
};

module.exports = mongodbConf;
