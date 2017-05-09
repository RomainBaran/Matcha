var express = require('express');
var router = express.Router();
var check = require('../lib/check');

router.get('/search', check.checkConnection.bind([true, 'signin']), (req, res) => {
    res.render('search', {title: 'Search for user'});
});

module.exports = router;
