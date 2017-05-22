var express = require('express');
var router = express.Router();
var mongoDb = require('../lib/db');
var fs = require('fs');

var check = require('../lib/check');

router.post('/uploadPicture',
    check.checkConnection.bind([true, false]),
    check.checkParams.bind([
      ['pic', (elem) => {
        if (typeof elem !== 'string' || elem.search('data:image/jpeg;base64,') === -1)
          return false;

        const data = elem.split(',')[1];

        if (!data || data === '')
          return false;

        var buffer = Buffer.from(data, 'base64');
        if (typeof buffer !== 'object'
            || (buffer[0] !== 255 || buffer[1] !== 216))
          return false;
        return true;
      }, "Wrong picture format sent"]
    ]),
    (req, res) => {
      mongoDb.MongoClient.connect((error, db) => {
        if (error) return res.json({error: ["Server error"]});

        /*connection.query('select * from PHOTO where id_user = ?;',
        [req.session.id_user],
        function (error, results){
          if (error) {
            connection.release();
            return res.json({error: ["Server error"]});
          }
          if (results.length >= 5){
            connection.release();
            return res.json({error: ["You already have at least five pictures"]});
          }
          connection.query('insert into PHOTO (id_user, data) values (?,?)',
          [req.session.id_user, req.body[0]['pic']],
          function (error, results){
            connection.release();
            if (error) return res.json({error: ['Server error, try later']})
            return res.json({success: ['Picture sucessfully uploaded'], insertId: [results.insertId]});
          });
      });*/
      });
  });

router.post('/getPicture',
    check.checkConnection.bind([true, false]),
    check.checkParams.bind([
      ['id_user', (elem) => {
        if ((elem === undefined) || (typeof elem === 'string' && !isNaN(parseInt(elem))))
          return true;
        return false;
      }, "Wrong user"]
    ]),
    (req, res) => {
      mongoDb.MongoClient.connect((error, db) => {
        if (error) return res.json({error: ["Server error"]});

        const idUser = (req.body[0]['id_user'] !== undefined) ?
            req.body[0]['id_user'] :
            req.session.id_user;

        /*connection.query('select PHOTO.id, data, profilePhoto from PHOTO, USER where USER.id = PHOTO.id_user and PHOTO.id_user = ?', [idUser],
        function (error, results){
          connection.release();
          if (error) return res.json({error: ["Server error"]});
          return res.json({data: results});
      });*/
      });
    });

router.post('/deletePicture',
    check.checkConnection.bind([true, false]),
    check.checkParams.bind([
      ['id_photo', (elem) => {
        if ((typeof elem === 'string' && !isNaN(parseInt(elem))))
          return true;
        return false;
    }, "Wrong picture selected"]
    ]),
    (req, res) => {
      mongoDb.MongoClient.connect((error, db) => {
        if (error) return res.json({error: ["Server error"]});

        /*connection.query('select profilePhoto from USER where id = ? and profilePhoto = ?', [req.session.id_user, req.body[0].id_photo],
        function(error, results){
            if (error || results.length !== 1) return ;
            connection.query('update USER set profilePhoto = NULL where id = ?', [req.session.id_user]);
        });
        connection.query('delete from PHOTO where id_user = ? and id = ?;', [req.session.id_user, req.body[0].id_photo],
        function (error, results){
          connection.release();
          if (error) return res.json({error: ["Access Denied"]});
          return res.json({success: ["Picture successfully deleted"]});
        });*/
      });
});

router.post('/setProfilePicture',
    check.checkConnection.bind([true, false]),
    check.checkParams.bind([
      ['id_photo', (elem) => {
        if ((typeof elem === 'string' && !isNaN(parseInt(elem))))
          return true;
        return false;
    }, "Wrong picture selected"]
    ]),
    (req, res) => {
      mongoDb.MongoClient.connect((error, db) => {
        if (error) return res.json({error: ["Server error"]});

        /*connection.query('select id from PHOTO where id_user = ? and id = ?;', [req.session.id_user, req.body[0].id_photo],
        function (error, results){
          if (error || results.length !== 1){
              connection.release();
              return res.json({error: ["Access Denied"]})
          }
          connection.query('update USER set profilePhoto = ? where id = ?', [req.body[0].id_photo, req.session.id_user],
            function (error, results){
                connection.release();
                if (error) return res.json({error: ["Server error"]});
                return res.json({success: ["Profile picture set"]});
          });
      });*/
      });
});

module.exports = router;
