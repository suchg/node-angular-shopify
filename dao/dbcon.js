var connectionProvider = require('./mysqlConnectionStringProvider.js');
// var connection = { escape: () => { return ''; } }; // connectionProvider.mysqlCOnnectionStringProvider.getMysqlConnection();
var pool = connectionProvider.mysqlCOnnectionStringProvider.getPool();
var mysql      = require('mysql');
const dbcon = {
  update: (data, onCallBack) => {
    // connection.query('UPDATE `employee` SET `employee_name`=?,`employee_salary`=?,`employee_age`=? where `id`=?', [req.body.employee_name,req.body.employee_salary, req.body.employee_age, req.body.id], function (error, results, fields) {
    // connection.query('INSERT INTO employee SET ?', postData, function (error, results, fields) {
    // if(connection) {
    //     connection.query( data.query, data.data, function(err, result){
    //         if( err ) { throw err }
    //         onCallBack({ result });
    //     } )
    // } else {
    //   console.log('No connectoin!');
    // }

    pool.getConnection( ( err, connection ) => {
      connection.query( data.query, data.data, (err, result) => {
          if( err ) { throw err }
          connection.release();
          onCallBack({ result });
      } )
    } )
  },
  select: (data, onCallBack) => {
    // connection.query('select * from employee where id=?', [req.params.id], function (error, results, fields) {
    // if(connection) {
    //     connection.query( data.query, function(err, result){
    //         if( err ) { throw err }
    //         onCallBack({ result: result });
    //     } )
    // } else {
    //   console.log('No connectoin!');
    // }

    pool.getConnection( ( err, connection ) => {
      connection.query( data.query, (err, result) => {
          if( err ) { throw err }
          connection.release();
          onCallBack({ result });
      } )
    } )
  },
  delete: (data, onCallBack) => {
    // if(connection) {
    // // connection.query('DELETE FROM `employee` WHERE `id`=?', [req.body.id], function (error, results, fields) {
    //     connection.query( data.query, data.id, function(err, result){
    //         if( err ) { throw err }
    //         onCallBack({ result: result });
    //     } )
    // } else {
    //   console.log('No connectoin!');
    // }

    pool.getConnection( ( err, connection ) => {
      connection.query( data.query, data.id, (err, result) => {
          if( err ) { throw err }
          connection.release();
          onCallBack({ result });
      } )
    } )

  },
  connection: {
    escape: (stringVal) => {
      return mysql.escape(stringVal); 
    }
  }
}

module.exports = dbcon;