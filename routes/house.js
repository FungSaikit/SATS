var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var dbConfig = require('../db/DBConfig');
var houseSQL = require('../db/housesql');

var pool = mysql.createPool(dbConfig);

//允许跨域
router.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

router.get('/getHouse', function (req, res, next) {
    var houseid = req.query.hid;
    pool.getConnection(function (err, connection) {
        connection.query(houseSQL.getHouse, [houseid], function (err, result) {
            if (!result) {
                result = {
                    code: 0,
                    msg: '查询失败'
                }
            }
            res.json(result[0]);
            connection.release();
        });
    });
});

router.get('/getHouseFeedback', function (req, res, next) {
    var houseid = req.query.hid;
    pool.getConnection(function (err, connection) {
        connection.query(houseSQL.getHouseFeedback, [houseid], function (err, result) {
            if (!result) {
                result = {
                    code: 0,
                    msg: '查询失败'
                }
            }
            res.json(result);
            connection.release();
        });
    });
});

'select * from house where order by post_time desc'
router.get('/getHouseList', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        var isFirst = true;
        var query0 = 'select count(*) from house where ';
        var query1 = 'select * from house where ';

        var isForSell = req.query.isForSell;
        var keyword = req.query.keyword;
        var minPrice = req.query.minPrice;
        var maxPrice = req.query.maxPrice
        var minArea = req.query.minArea;
        var maxArea = req.query.maxArea;
        var room = req.query.room;
        var usage = req.query.usage;
        var page = req.query.page ? req.query.page : 1;

        function addCondition(condition) {
            query0 += !isFirst ? ' and ' : '';
            query1 += !isFirst ? ' and ' : '';
            isFirst = false;
            query0 += condition;
            query1 += condition;
        }

        if (isForSell) {
            addCondition('(is_for_sell = ' + isForSell + ')'); 
        }
        if (keyword) {
            addCondition('(title like \'%' + keyword + '%\') or (properties like \'%' + keyword + '%\') or (district like \'%' + keyword + '%\')');
        }
        if (minPrice) {
            addCondition('(price >= ' + minPrice + ')');
        }
        if (maxPrice) {
            addCondition('(price < ' + maxPrice + ')');
        }
        if (minArea) {
            addCondition('(area >= ' + minArea + ')');
        }
        if (maxArea) {
            addCondition('(area < ' + maxArea + ')');
        }
        if (room || room == 0) {
            addCondition('(room_num = ' + room + ')');
        }
        if (usage) {
            addCondition('(house_usage = ' + usage + ')');
        }


        query1 += ' order by post_time desc limit ' + (page - 1) * 10 + ',10';
        console.log(query0)

        connection.query(query0, function (err, result) {
            console.log(query1);
            if (!result) {
                result = {
                    code: 0,
                    msg: '查询失败'
                }
                res.json(result);
                connection.release();
            } else {
                connection.query(query1, function (err, _result) {
                    resultJSON = {
                        count: result[0]['count(*)'], 
                        list: _result
                    }
                    res.json(resultJSON);
                    connection.release();
                });
            }
        });
    });
})


module.exports = router;