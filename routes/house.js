var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var dbConfig = require('../db/DBConfig');
var houseSQL = require('../db/housesql');

var pool = mysql.createPool(dbConfig);

//获取当前时间字符串
function zero(num) {
	return num > 10 ? num : "0" + num;
}

function currentTime() {
	var oDate = new Date();
	var oYear = oDate.getFullYear();
	var oMonth = oDate.getMonth() + 1;
	var oDay = oDate.getDate();
	var oHours = oDate.getHours();
	var oMinute = oDate.getMinutes();
	var oSeconds = oDate.getSeconds();
	var timeValue = oYear + "-" + zero(oMonth) + "-" + zero(oDay) + " " + zero(oHours) + ":" + zero(oMinute) + ":" + zero(oSeconds);
	return timeValue;
}

//允许跨域
router.all('*', function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With,content-type");
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

//买家查询订单
router.get('/getMyOrder', (req, res, next) => {
	var user = req.query.user;
	pool.getConnection((err, connection) => {
		connection.query(houseSQL.getMyOrder, [user], (err, result) => {
			if (!result) {
				result = {
					code: 0,
					msg: '查询失败'
				}
			}
			res.json(result);
			connection.release();
		})
	})
})

//卖家查询已经发布了的房源
router.get('/getMyHouse', function (req, res, next) {
	var user = req.query.user;
	pool.getConnection(function (err, connection) {
		connection.query(houseSQL.getMyHouse, [user], function (err, result) {
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

//卖家查询他的房源被交易情况
router.get('/getMyTrade', function (req, res, next) {
	var user = req.query.user;
	pool.getConnection(function (err, connection) {
		connection.query(houseSQL.getMyTrade, [user], function (err, result) {
			if (!result) {
				result = {
					code: 0,
					msg: '查询失败'
				}
				console.log(err);
			}
			res.json(result);
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

// 'select * from house where order by post_time desc'
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
});

//发布房子
router.post('/postHouse', (req, res, next) => {
	var form = req.body;
	pool.getConnection((err, connection) => {
		connection.query(houseSQL.insert, [form.is_for_sell, form.user, form.title, form.description, form.price, form.price / parseInt(form.area), form.room_num, form.livingroom_num, form.kitchen_num, form.bathroom_num, form.total_floor, form.floor, form.build_year, form.properties, form.district, form.view_time, form.area, form.inside_area, form.direction, form.lift, form.house_per_floor, form.last_trade, form.trading_right, form.house_age, form.age_limit, form.mortgage, form.house_right, form.house_label, form.decoration_desc, form.main_sellpoint, form.facility, form.traffic, form.house_usage, JSON.stringify(form.fileList), form.construction_type, form.decoration, '0', currentTime(), form.user_name, form.user_phone], (error, result) => {
			if (error) {
				console.log(error);
				result = {
					code: -200,
					error: error
				}
			} else {
				result = {
					code: 200,
					msg: '成功'
				}
			}
			connection.release();
			res.json(result);
		});
	})
})


//经纪人接单
router.get('/getOrder', (req, res, next) => {
	try {
		var order = req.query.order;
		var agent_id = req.query.agent_id;
		var agent_name = req.query.agent_name;
	} catch (error) {
		console.log(error)
		return res.json({
			code: 400,
			msg: '服务器错误'
		})
	}
	pool.getConnection((err, connection) => {
		connection.query(houseSQL.agentGetOrder, [agent_id, agent_name, order], (error, result) => {
			if (error) {
				console.log(error);
				result = {
					code: -200,
					error: error
				}
			} else {
				result = {
					code: 200,
					msg: '成功'
				}
			}
			connection.release();
			res.json(result);
		});
	})
})

//经纪人带看房
router.get('/viewHouse', (req, res, next) => {
	try {
		var order_id = req.query.o_id;
	} catch (error) {
		console.log(error);
	}
	pool.getConnection((err, connection) => {
		connection.query(houseSQL.agentViewHouse, [currentTime(), order_id], (error, result) => {
			if (error) {
				console.log(error);
				result = {
					code: -200,
					error: error
				}
			} else {
				result = {
					code: 200,
					msg: '成功'
				}
			}
			connection.release();
			res.json(result);
		})
	})
})

//客户下订房源
router.get('/orderHouse', (req, res, next) => {
	try {
		var order_id = req.query.o_id;
	} catch (error) {
		console.log(error);
	}
	pool.getConnection((err, connection) => {
		connection.query(houseSQL.orderHouse, [currentTime(), order_id], (error, result) => {
			if (error) {
				console.log(error);
				result = {
					code: -200,
					error: error
				}
			} else {
				result = {
					code: 200,
					msg: '成功'
				}
			}
			connection.release();
			res.json(result);
		})
	})
})

//卖家确认收款
router.get('/alreadyGetHouse', (req, res, next) => {
	try {
		var order_id = req.query.o_id;
		var saveTime = currentTime();
	} catch (error) {
		console.log(error);
	}
	pool.getConnection((err, connection) => {
		connection.query(houseSQL.alreadyGetHouse, [saveTime, saveTime, order_id], (error, result) => {
			if (error) {
				console.log(error);
				result = {
					code: -200,
					error: error
				}
			} else {
				connection.query(houseSQL.setAlreadySold, [order_id], (error, result) => {
					if (!error) {
						result = {
							code: 200,
							msg: '成功'
						}
						connection.release();
						res.json(result);
					}
				})
			}
		})
	})
})

//买家确认收房
router.get('/alreadyGetMoney', (req, res, next) => {
	try {
		var order_id = req.query.o_id;
		var saveTime = currentTime();
	} catch (error) {
		console.log(error);
	}
	pool.getConnection((error, connection) => {
		connection.query(houseSQL.alreadyGetMoney, [saveTime, saveTime, order_id], (error, result) => {
			if (error) {
				console.log(error);
				result = {
					code: -200,
					error: error
				}
			} else {
				connection.query(houseSQL.setAlreadySold, [order_id], (error, result) => {
					if (!error) {
						result = {
							code: 200,
							msg: '成功'
						}
						connection.release();
						res.json(result);
					}
				})
			}
		})
	})
})

router.get('/agentGetOrderList', (req, res, next) => {
	var type = parseInt(req.query.type);
	var agent_id = req.query.a_id;
	var sqlString = 'select * from `order` left join `house` on `order`.house_id = `house`.id where ';
	switch (type) {
		case 0:
			sqlString += 'status = 1';
			break;
		case 1:
			sqlString += 'agent_id = ' + agent_id;
			break;
		case 2:
			sqlString += 'agent_id = ' + agent_id + ' and status = 2';
			break;
		case 3:
			sqlString += 'agent_id = ' + agent_id + ' and status = 3';
			break;
		case 4:
			sqlString += 'agent_id = ' + agent_id + ' and status = 4 or status = 5 or status = 6';
			break;
		case 5:
			sqlString += 'agent_id = ' + agent_id + ' and status = 7';
			break;
		default:
			res.json('[]');
			return;
	}
	pool.getConnection((err, connection) => {
		connection.query(sqlString, (error, result) => {
			if (error) {
				console.log(error);
				result = {
					code: -200,
					error: error
				}
			}
			connection.release();
			res.json(result);
		})
	})
})

router.post('/bookTheHouse', (req, res, next) => {
	var house_id = req.body.house_id;
	var buyer_id = req.body.buyer_id;
	var buyer_name = req.body.buyer_name;
	var buyer_phone = req.body.buyer_phone;
	pool.getConnection((err, connection) => {
		connection.query(houseSQL.insertOrder, [house_id, buyer_id, buyer_name, buyer_phone, currentTime()], (error, result) => {
			if (error) {
				console.log(error);
				result = {
					code: -200,
					error: error
				}
			} else {
				result = {
					code: 200,
					msg: '成功'
				}
			}
			connection.release();
			res.json(result);
		})
	})
})

router.post('/feedback', (req, res, next) => {
	var house_id = req.body.house_id;
	var agent_id = req.body.agent_id;
	var agent_name = req.body.agent_name;
	var content = req.body.content;
	pool.getConnection((err, connection) => {
		connection.query(houseSQL.agentFeedback, [house_id, agent_id, agent_name, content, currentTime()], (error, result) => {
			if (error) {
				console.log(error);
				result = {
					code: -200,
					error: error
				}
			} else {
				result = {
					code: 200,
					msg: '成功'
				}
			}
			connection.release();
			res.json(result);
		})
	})
})

router.get('/cancelOrder', (req, res, next) => {
	var order_id = req.query.o_id;
	pool.getConnection((err, connection) => {
		connection.query(houseSQL.cancelOrder, [currentTime(), order_id], (err, result) => {
			if (err) {
				console.log(err);
				result = {
					code: -200,
					error: err
				}
			} else {
				result = {
					code: 200,
					msg: '成功'
				}
			}
			connection.release();
			res.json(result);
		})
	})
})

module.exports = router;