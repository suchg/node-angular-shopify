var mysql = require('mysql');

var mysqlConnectionString = require('./mysqlConnectionString');

var mysqlCOnnectionStringProvider = {
    getMysqlConnection: function getMysqlConnection(){
        var connection = mysql.createConnection( mysqlConnectionString.mysqlConnectionString.connection.dev );

        connection.connect(function(err){
            if(err){
                console.error(err);
            }
            console.log('Connected successfully.');
        });

        return connection;
    },
    closeMysqlConnection: function closeMysqlConnection ( currentConnectionObject ){
        if( currentConnectionObject ) {
            currentConnectionObject.end(function(err){
                if(err) { console.error(err); }
                console.log('Connection closed successfully.');
            });
        }
    },
    getPool: () => {
        var pool  = mysql.createPool(
                                      { 
                                        ...{connectionLimit : 10},
                                        ...mysqlConnectionString.mysqlConnectionString.connection.dev
                                      }
                                    );
        return pool;
    }
}

module.exports.mysqlCOnnectionStringProvider = mysqlCOnnectionStringProvider;