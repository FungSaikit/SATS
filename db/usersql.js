var UserSQL = {
    insert: 'INSERT INTO user(username, password) VALUES(?,?)', 
    queryAll: 'SELECT * FROM User', 
    getUserPassword: 'select * from user where username = ?'
};
module.exports = UserSQL;