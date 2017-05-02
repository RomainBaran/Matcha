var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var nodemailer = require('../lib/mail');
var pool = require('../lib/db');
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

  pool.getConnection(function(error, connection){
    if (error) {pageRender.error = "Server error"; return ;}

    connection.query('update USER set verify = 0 where verify = ?', [req.params.rand],
      function(error, results, fields){
        connection.release();
        if (error || results.affectedRows == 0) {
          pageRender.error = "Access denied";
          return res.render('signin', pageRender);
        }
        pageRender.success = "Your account is available.";
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
    pool.getConnection(function(error, connection){
      if (error) return res.json({error: ["Server error"]});

      var hash = crypto.createHash('whirlpool');
      hash.update(req.body[0]['password']);
      connection.query('select * from USER where mail = ? and passwd = ? and verify = 0',
      [req.body[0]['email'], hash.digest('hex')],
        function (error, results, fields){
          //check for errors
          connection.release();
          if (error) return res.json({error: ["Server error"]});
          if (results.length === 0) return res.json({error: ["Wrong email or password"]});
          req.session.id_user = results[0].id;
          return res.json({success: ["OK"]});
        }
      );
    });
});

router.post('/register',
  check.checkConnection.bind([false, false]),
  check.checkParams.bind([
    ['first-name', RegExp.prototype.test.bind(/^([a-zA-Z|\ ])+$/), "Wrong first name format sent"],
    ['last-name', RegExp.prototype.test.bind(/^([a-zA-Z]|\ )+$/), "Wrong last name format sent"],
    ['email', RegExp.prototype.test.bind(/^[\w\-\.]+@([\w]+\.){1,2}[a-zA-Z]{2,3}$/), "Wrong email format sent"],
    ['password', RegExp.prototype.test.bind(/^(?=(.*[a-zA-Z]){4,})(?=(.*[0-9]){2,})\w+$/), "Wrong password format sent"],
    ['date', RegExp.prototype.test.bind(/^[0-9]{4}-(0[1-9]|1[0-2])-([0-2][0-9]|3[0-1])$/), "Wrong birthday format sent"],
    ['gender', (elem) => {
      return (parseInt(elem) === 1 || parseInt(elem) === 2);
    }, "Wrong gender sent"]
  ]),
  (req, res) => {
    pool.getConnection(function(error, connection){
      if (error) return res.json({error: ["Server error"]});
      connection.query('select mail from USER where mail = ?', [req.body[0]['email']],
      function (error, results, fields){
        //check for errors
        if (error) {
          connection.release();
          return res.json({error: ["Server error"]});
        }
        if (results.length > 0){
          connection.release();
          return res.json({error: [["Email already exists", "email"]]});
        }
        //create hash
        var hash = crypto.createHash('whirlpool');
        hash.update(req.body[0]['password']);
        var rand = Math.floor((Math.random() * 10000000) + 10000000);
        //insertion
        connection.query('insert into USER(firstname, lastname, mail, passwd,  birthdate, gender, verify) values(?,?,?,?,?,?,?)',
        [req.body[0]['first-name'], req.body[0]['last-name'], req.body[0]['email'], hash.digest('hex'), req.body[0]['date'], req.body[0]['gender'], rand],
        function (error, results){
          connection.release();
          if (error) return res.json({error: ["Server error"]});
          nodemailer.sendMail({
            from: '"Matcha" <noreply@matcha.com>',
            to: req.body[0]['email'],
            subject: 'Matcha subscription',
            html: `<p>Welcome to matcha app ! Please follow this <a href='http://localhost:3000/verify/`+ rand +`'>link</a></p>`
          }, (error, info) => {
              if (error) {
                  return console.log(error);
              }
              console.log('Message %s sent: %s', info.messageId, info.response);
          });
          return res.json({success: ["An email has been sent"]});
        });
      });
    });
});

router.post('/updateInfo',
  check.checkConnection.bind([true, false]),
  check.checkParams.bind([
    ['first-name', RegExp.prototype.test.bind(/^([a-zA-Z|\ ])+$/), "Wrong first name format sent"],
    ['last-name', RegExp.prototype.test.bind(/^([a-zA-Z]|\ )+$/), "Wrong last name format sent"],
    ['email', RegExp.prototype.test.bind(/^[\w\-\.]+@([\w]+\.){1,2}[a-zA-Z]{2,3}$/), "Wrong email format sent"],
    ['date', RegExp.prototype.test.bind(/^[0-9]{4}-(0[1-9]|1[0-2])-([0-2][0-9]|3[0-1])$/), "Wrong birthday format sent"],
    ['gender', (elem) => (parseInt(elem) === 1 || parseInt(elem) === 2), "Wrong gender sent"],
    ['sexualOrientation', (elem) =>(parseInt(elem) === 1 || parseInt(elem) === 2 || parseInt(elem) === 3), "Wrong Sexual Orientation sent"],
    ['bio', (elem) => true],
    ['tags', (elem) => {
      if (typeof elem !== 'string')
        return false;
      var tagsArray = elem.split(',');
      if (tagsArray.length === 1 && tagsArray[0] === '')
        return true;
      if (tagsArray.filter((elem) => !(Number.isInteger(parseInt(elem)))).length > 0)
        return false;
      return true;
    }, "Wrong tags sent"]
  ]),
  (req, res) => {
    pool.getConnection(function(error, connection){
      if (error) return res.json({error: ["Server error"]});

      connection.query('delete from USER_TAGS where id_user = ?; update USER set firstname = ?, lastname = ?, mail = ?, birthdate = ?, gender = ?, sexualOrientation = ?, bio = ? where id = ?;',
      [req.session.id_user, req.body[0]['first-name'], req.body[0]['last-name'], req.body[0]['email'], req.body[0]['date'], req.body[0]['gender'],
      req.body[0]['sexualOrientation'], striptags(req.body[0]['bio']), req.session.id_user],
      function (error, results){
        if (error) {
          connection.release();
          return res.json({error: ["Server error"]});
        }
        if (req.body[0]['tags'] === '') {
          connection.release();
          return res.json({success: ['Your profile has been updated']});
        }

        var sql = 'insert into USER_TAGS (id_user, id_tag) values',
            params = [];

        req.body[0]['tags'].split(',').forEach((elem, index, currArray) => {
          sql += ' (?,?)';
          sql += (index < (currArray.length - 1)) ? ',' : ';';
          params.push(req.session.id_user, parseInt(elem));
        });

        connection.query(sql, params, (error, results) => {
          if (error) return res.json({error: [`Tags can't be updated for some reasons`]});
          return res.json({success: ['Your profile has been updated']});
        });
        connection.release();
        return ;
      });
    });
  });

  router.post('/uploadPicture',
    check.checkConnection.bind([true, false]),
    check.checkParams.bind([
      ['picture', (elem) => {
          if (typeof elem !== 'string' || elem.search('data:image/jpeg;base64,') === -1)
            return false;

          const data = elem.split(',')[1];

          if (!data || data === '')
            return false;

          try{
              atob(data);
          } catch (DOMException e) {
              console.log(e)
          }
          return true;
      }, "Wrong picture format sent"]
    ]),
    (req, res) => {

        return res.json({success: ['Picture sucessfully uploaded']});
  });

module.exports = router;
