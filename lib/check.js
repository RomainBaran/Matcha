module.exports = {
  checkConnection: function (req, res, next) {
    if (typeof this !== "object"){
      res.redirect("/");
      return ;
    }
    if (("id_user" in req.session) === this[0]){
      if (this[2])
        console.log(this[2])
      next();
      return ;
    }
    if (this[1] !== false){
      res.redirect('/' + this[1]);
      return ;
    }
    res.json({error: ["Access denied"]});
  },
  checkParams: function (req, res, next){
    var inputs = this.map((elem) => { return  elem[0]; }),
        check = null;

    if (!req.body || !req.body[0]){
      res.sendStatus(500);
      return ;
    }
    if ((check = Object.keys(req.body[0])
                  .filter((elem) => { return (inputs.indexOf(elem) === -1); })
                  .map((elem) => { return ["Wrong name sent: '" + elem + "'", elem] })) && check.length > 0)
        return res.json({error: check});

    if ((check = this
                  .filter((elem) => { return !(elem[1](req.body[0][elem[0]])); })
                  .map((elem) => { return [elem[2], elem[0]] })) && check.length > 0)
        return res.json({error: check});

    next();
  }
}
