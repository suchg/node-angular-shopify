var mysql = require('mysql');

var mysqlConnectionString = require('./mysqlConnectionString');

var mysqlCOnnectionStringProvider = {
    getMysqlConnection: function getMysqlConnection(){
        var connection = mysql.createConnection( mysqlConnectionString.mysqlConnectionString.connection.dev );

        connection.connect(function(err){
            if(err){
                throw err;
            }
            console.log('Connected successfully.');
        });

        return connection;
    },
    closeMysqlConnection: function closeMysqlConnection ( currentConnectionObject ){
        if( currentConnectionObject ) {
            currentConnectionObject.end(function(err){
                if(err) { throw err; }
                console.log('Connection closed successfully.');
            });
        }
    }
}

module.exports.mysqlCOnnectionStringProvider = mysqlCOnnectionStringProvider;