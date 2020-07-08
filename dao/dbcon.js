var connectionProvider = require('./mysqlConnectionStringProvider.js');
var connection = connectionProvider.mysqlCOnnectionStringProvider.getMysqlConnection();

const dbcon = {
  update: (data, onCallBack) => {
    // connection.query('UPDATE `employee` SET `employee_name`=?,`employee_salary`=?,`employee_age`=? where `id`=?', [req.body.employee_name,req.body.employee_salary, req.body.employee_age, req.body.id], function (error, results, fields) {
    // connection.query('INSERT INTO employee SET ?', postData, function (error, results, fields) {
    if(connection) {
        connection.query( data.query, data.data, function(err, result){
            if( err ) { throw err }
            onCallBack({ result });
        } )
    } else {
      console.log('No connectoin!');
    }
  },
  select: (data, onCallBack) => {
    // connection.query('select * from employee where id=?', [req.params.id], function (error, results, fields) {
    if(connection) {
        connection.query( data.query, function(err, result){
            if( err ) { throw err }
            onCallBack({ result: result });
        } )
    } else {
      console.log('No connectoin!');
    }
  },
  delete: (data, onCallBack) => {
    if(connection) {
    // connection.query('DELETE FROM `employee` WHERE `id`=?', [req.body.id], function (error, results, fields) {
        connection.query( data.query, data.id, function(err, result){
            if( err ) { throw err }
            onCallBack({ result: result });
        } )
    } else {
      console.log('No connectoin!');
    }
  },
  connection: connection
}

module.exports = dbcon;