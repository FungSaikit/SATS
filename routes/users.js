var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  console.log(req.query.username);
  console.log(req.query.password);
  res.send('respond with a resource');
});

router.post('/login', function (req, res, next) {
  console.log(req.body)
  console.log(req.body.username);
  console.log(req.body.password);
  if (req.body.username == req.body.password) {
    res.send('Success!');
  } else {
    res.send('fail!');
  }
});

module.exports = router;
