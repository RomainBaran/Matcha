var express = require('express');
var router = express.Router();
var mongoDb = require('../lib/db');

var check = require('../lib/check');

router.get(/(^\/$)|(^\/home$)/, check.checkConnection.bind([true, 'signin']), (req, res) => {
  mongoDb.MongoClient.connect(mongoDb.url, (error, db) => {

      mongoDb.select(db, {'_id': mongoDb.ObjectID(req.session['id_user'])}, 'user')
                .then((result) => {
                    db.close();
                    result[0].title = 'Home';
                    if (typeof result[0]['tags'] !== undefined)
                        result[0]['tags'] = result[0]['tags'].join();
                    return res.render('home', result[0]);
                }, (result) => {
                    db.close();
                    return res.render('home', {title: 'Home', error: `Can't retrieve personnal data, please try later.`})
                });
  });
});

module.exports = router;
