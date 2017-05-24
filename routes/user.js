var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var nodemailer = require('../lib/mail');
var mongoDb = require('../lib/db');
var striptags = require('striptags');

var check = require('../lib/check');

router.get('/signup', check.checkConnection.bind([false, 'home']), (req, res) => {
  res.render('signup', {title: "Matcha - Sign Up"});
});

router.get('/signin', check.checkConnection.bind([false, 'home']), (req, res) => {
  res.render('signin', {title: "Matcha - Sign in"});
});

router.get('/verify/:rand', check.checkConnection.bind([false, 'home']), (req, res) => {
  var pageRender = {title: "Matcha - Sign In"};

  mongoDb.MongoClient.connect(mongoDb.url, function(error, db){
    if (error) {pageRender.error = "Server error"; return ;}

    mongoDb.update(db, {verify: parseInt(req.params.rand)}, {$set: {verify: 0}}, 'user')
          .then((result) => {
              db.close();
              if (typeof result !== 'object' || result['modifiedCount'] === undefined || result['modifiedCount'] < 1)
                pageRender.error = `Access denied`;
              else
                pageRender.success = "Your account is available.";
              return res.render('signin', pageRender);
          }, (err) => {
              db.close();
              pageRender.error = "Access denied";
              return res.render('signin', pageRender);
          });
  });
});

router.post('/login',
  check.checkConnection.bind([false, false]),
  check.checkParams.bind([
    ['email', RegExp.prototype.test.bind(/^[\w\-\.]+@([\w]+\.){1,2}[a-zA-Z]{2,3}$/), "Wrong email format sent"],
    ['password', RegExp.prototype.test.bind(/^(?=(.*[a-zA-Z]){4,})(?=(.*[0-9]){2,})\w+$/), "Wrong password format sent"],
  ]),
  (req, res) => {
    mongoDb.MongoClient.connect(mongoDb.url, function(error, db){
      if (error) return res.json({error: ["Server error"]});

      var hash = crypto.createHash('whirlpool');
      hash.update(req.body[0]['password']);
      req.body[0]['password'] = hash.digest('hex');
      mongoDb.select(db, req.body[0], 'user')
            .then((result) => {
                db.close();
                if (typeof result !== 'object' || result.length !== 1)
                    return res.json({error: [`Wrong email or password`]});
                req.session.id_user = result[0]['_id'];
                return res.json({success: ["OK"]});
            }, (err) => {
                db.close();
                return res.json({error: ["Server error"]});
            });
    });
});

router.post('/register',
  check.checkConnection.bind([false, false]),
  check.checkParams.bind([
    ['firstname', RegExp.prototype.test.bind(/^([a-zA-Z|\ ])+$/), "Wrong first name format sent"],
    ['lastname', RegExp.prototype.test.bind(/^([a-zA-Z]|\ )+$/), "Wrong last name format sent"],
    ['email', RegExp.prototype.test.bind(/^[\w\-\.]+@([\w]+\.){1,2}[a-zA-Z]{2,3}$/), "Wrong email format sent"],
    ['password', RegExp.prototype.test.bind(/^(?=(.*[a-zA-Z]){4,})(?=(.*[0-9]){2,})\w+$/), "Wrong password format sent"],
    ['date', RegExp.prototype.test.bind(/^[0-9]{4}-(0[1-9]|1[0-2])-([0-2][0-9]|3[0-1])$/), "Wrong birthday format sent"],
    ['gender', (elem) => {
      return (elem === 'man' || elem === 'girl');
    }, "Wrong gender sent"]
  ]),
  (req, res) => {
    mongoDb.MongoClient.connect(mongoDb.url, function(error, db){
      if (error) return res.json({error: ["Server error"]});

      mongoDb.select(db, {'email': req.body[0]['email']}, 'user')
            .then((result) => {
                if (typeof result !== 'object' || result.length > 0){
                    db.close();
                    return res.json({error: [`Email already exists, or you don't have checked your mail yet`]});
                }
                var hash = crypto.createHash('whirlpool');
                hash.update(req.body[0]['password']);
                req.body[0]['password'] = hash.digest('hex');
                req.body[0]['verify'] = Math.floor((Math.random() * 10000000) + 10000000);
                req.body[0]['sexualOrientation'] = 'bi';
                mongoDb.insert(db, req.body[0], 'user')
                        .then((result) => {
                            db.close();
                            nodemailer.sendMail({
                              from: '"Matcha" <noreply@matcha.com>',
                              to: req.body[0]['email'],
                              subject: 'Matcha subscription',
                              html: `<p>Welcome to matcha app ! Please follow this <a href='http://localhost:3000/verify/`+ req.body[0]['verify'] +`'>link</a></p>`
                            }, (error, info) => {
                                if (error)
                                    return console.log(error);
                            });
                            return res.json({success: ["An email has been sent"]})
                        }, (err) => {
                            db.close();
                            return res.json({error: ["Server error"]});
                        })
            }, (err) => {
                db.close();
                return res.json({error: ["Server error"]});
            });
    });
});

router.post('/updateInfo',
  check.checkConnection.bind([true, false]),
  check.checkParams.bind([
    ['firstname', RegExp.prototype.test.bind(/^([a-zA-Z|\ ])+$/), "Wrong first name format sent"],
    ['lastname', RegExp.prototype.test.bind(/^([a-zA-Z]|\ )+$/), "Wrong last name format sent"],
    ['email', RegExp.prototype.test.bind(/^[\w\-\.]+@([\w]+\.){1,2}[a-zA-Z]{2,3}$/), "Wrong email format sent"],
    ['date', RegExp.prototype.test.bind(/^[0-9]{4}-(0[1-9]|1[0-2])-([0-2][0-9]|3[0-1])$/), "Wrong birthday format sent"],
    ['gender', (elem) => {
      return (elem === 'man' || elem === 'girl');
    }, "Wrong gender sent"],
    ['sexualOrientation', (elem) => {
      return (elem === 'hetero' || elem === 'bi' || elem === 'homo');
    }, "Wrong Sexual Orientation sent"],
    ['bio', (elem) => true],
    ['tags', (elem) => {
      if (typeof elem !== 'string')
        return false;
      var tagsArray = elem.split(',');
      if (tagsArray.length === 1 && tagsArray[0] === '')
        return true;
      if (tagsArray.filter((elem) => !(/^[a-z|A-Z|0-9]*$/.test(elem))).length > 0)
        return false;
      return true;
    }, "Wrong tags sent"]
  ]),
  (req, res) => {
    mongoDb.MongoClient.connect(mongoDb.url, function(error, db){
      if (error) return res.json({error: ["Server error"]});

      req.body[0]['tags'] = (req.body[0]['tags'] !== ``) ? req.body[0]['tags'].split(',') : undefined;
      mongoDb.update(db, {'_id': mongoDb.ObjectID(req.session['id_user'])}, {$set: req.body[0]},'user')
            .then((result) => {
                db.close();
                if (typeof result !== 'object' || result['modifiedCount'] === undefined || result['modifiedCount'] < 1)
                    return res.json({error: ["Can't update your profile"]});
                return res.json({success: ["Your profile has been updated"]});
            }, (result) => {
                db.close();
                return res.json({error: ["Can't update your profile"]});
            })
    });
  });

router.post('/getUserInfo',
  check.checkConnection.bind([true, false]),
  check.checkParams.bind([
    ['id_user', (elem) => {
      if ((elem === undefined) || (typeof elem === 'string' && !isNaN(parseInt(elem))))
        return true;
      return false;
    }, "Wrong user"]
  ]),
  (req, res) => {
    mongoDb.MongoClient.connect(mongoDb.url, function(error, db){
      if (error) return res.json({error: ["Server error"]});
      /*connection.query('select * from USER where id = ?', [req.session['id_user']]
        (error, results) => {
            if (error) {
              connection.release();
              return res.json({error: ['Server error']});
            }

            var sql = `select P.id, U.id, firstname, lastname, birthdate, gender, sexualOrientation, data from USER U, PHOTO P where profilePhoto = P.id;`,
                attributes = [];

            if (req.body[0]['id_user'] !== undefined){
              sql += ' and U.id = ?'
              attributes.push(req.body[0].id_user);
            } else {
              sql += ' and U.id != ? '
              attributes.push(req.session.id_user);
            }
            sql += ';';
            connection.query(sql,
            attributes,
            function (error, results){
              connection.release();
              if (error) return res.json({error: ["Server error"]});
              return res.json({data: results});
            });
        });*/
        db.close();
    });
  });

module.exports = router;
