var UserSQL = {
    queryUser: 'select * from user where email_address = ?',
    insertRegister: 'insert into register(email_address, identifying_code) values(?, ?)',
    getRegisterCode: 'select identifying_code from register where email_address = ? order by id desc limit 0,1',
    insert: 'INSERT INTO user(email_address, password, nickname) VALUES(?, ?, ?)', 
    queryAll: 'SELECT * FROM User', 
    getUserPassword: 'select password, id, nickname from user where email_address = ?',
    getAgentPassword: 'select password, id, name from agent where username = ?'
};
module.exports = UserSQL;