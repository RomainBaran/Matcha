var express = require('express');
var router = express.Router();
var mongoDb = require('../lib/db');

var check = require('../lib/check');

var getYearsOld = (birthdate) => {
  var date = new Date(),
      todayYear = date.getFullYear(),
      todayMonth = date.getMonth(),
      today = date.getDate(),
      birthYear = birthdate.getFullYear(),
      birthMonth = birthdate.getMonth(),
      birthDay = birthdate.getDate(),
      age = todayYear - birthYear;

  if (todayMonth < birthMonth)
    age--;
  else if (todayMonth === birthMonth && today < birthDay)
    age--;
  return age;
}

router.get(/(^\/$)|(^\/home$)/, check.checkConnection.bind([true, 'signin']), (req, res) => {
  mongoDb.MongoClient.connect((error, db) => {
    /*connection.query('select * from USER where id = ?; select * from TAGS; select id_tag from USER_TAGS where id_user = ?;',
      [req.session.id_user, req.session.id_user],
      function(error, results, fields){
        connection.release();
        if (error || results.length === 0) {
          return res.render('home', {title: 'Matcha - Home', error: 'Access Denied'});
        }
        var render = results[0][0];
        render.yearsOld = getYearsOld(render.birthdate);
        render.birthdate = render.birthdate.getFullYear() + '-' + ('0' + (render.birthdate.getMonth() + 1)).slice(-2) + '-' + ('0' + render.birthdate.getDate()).slice(-2);
        render.title = 'Matcha - Home';
        render.tags = results[1];
        render.ownTags = results[2]
                        .map((elem) => elem['id_tag'])
                        .join();
        return res.render('home', render);
    });*/
    return res.render('home', {title: 'Home'});
  });
});

module.exports = router;
