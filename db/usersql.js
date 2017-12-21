var UserSQL = {
    insert: 'INSERT INTO user(username, password) VALUES(?,?)', 
    queryAll: 'SELECT * FROM User', 
    getUserById: 'SELECT * FROM User WHERE uid = ? '
};
module.exports = UserSQL;