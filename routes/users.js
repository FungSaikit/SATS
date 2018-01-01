var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var dbConfig = require('../db/DBConfig');
var userSQL = require('../db/Usersql');

const nodemailer = require('nodemailer');
var mailConfig = require('../mail/MailConfig');

var pool = mysql.createPool(dbConfig);
let transporter = nodemailer.createTransport(mailConfig);




var responseJSON = function (res, ret) {
  if (typeof ret == 'undefined') {
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

/* create new user */
router.post('/addUser', function (req, res, next) {
  //从连接池获取链接
  pool.getConnection(function (err, connection) {
    var param = req.body;
    console.log('新建用户：');
    console.log(param);
    connection.query(userSQL.insert, [param.username, param.password], function (err, result) {
      if (result) {
        result = {
          code: 200,
          msg: '新增成功'
        }
      }
      responseJSON(res, result);
      connection.release();
    });
  });
});

router.post('/login', function (req, res, next) {
  pool.getConnection(function (err, connection) {
    var param = req.body;
    console.log('用户登录：');
    console.log(param);
    connection.query(userSQL.getUserPassword, [param.username], function (err, result) {
      if (result && result.length != 0) {
        if (result[0].password == param.password) {
          result = {
            code: 200,
            msg: '验证成功'
          }
        } else {
          result = {
            code: 401.1,
            msg: '密码错误'
          }
        }
      } else {
        result = {
          code: 403,
          msg: '账户不存在'
        }
      }
      responseJSON(res, result)
      connection.release();
    });
  });
});

router.get('/getPasswordCheckCode', function (req, res, next) {
  var checkCode;
  do {
    checkCode = Math.floor(Math.random() * 10000);
  } while (checkCode < 1000);
  // pool.getConnection(function (err, result) {

  // });

  let mailOptions = {
    from: 'jackfungtest@163.com', // sender address
    to: '675703302@qq.com', // list of receivers
    subject: '二手房交易系统', // Subject line
    text: '您获取的验证码为：' + checkCode + '，请妥善保管。' // plain text body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    var result = {
      code: 200,
      checkCode: checkCode,
      msg: '已发送验证码！'
    }
    console.log(checkCode);
    responseJSON(res, result);
  });

});

router.post('/test', function (req, res, next) {
  console.log(req);
  res.send('success!');
});

module.exports = router;