var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var dbConfig = require('../db/DBConfig');
var userSQL = require('../db/Usersql');

var pool = mysql.createPool(dbConfig.mysql);

var responseJSON = function (res, ret) {
  if(typeof ret == 'undefined') {
    res.json({
      code: '-200', 
      msg: '操作失败'
    });
  } else {
    res.json(ret);
  }
}

/* GET users listing. */
router.get('/', function (req, res, next) {
  console.log(req.query.username);
  console.log(req.query.password);
  res.send('respond with a resource');
});

router.post('/addUser', function (req, res, next) {
  //从连接池获取链接
  pool.getConnection(function(err, connection) {
    var param = req.body;
    console.log(param);
    connection.query(userSQL.insert, [param.username, param.password], function(err, result) {
      if (result) {
        result = {
          code: 200, 
          msg: '新增成功'
        }
      }
      responseJSON(res, result);
      connection.release();
    })
  })
});

module.exports = router;
