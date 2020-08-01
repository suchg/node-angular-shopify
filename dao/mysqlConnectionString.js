var mysqlConnectionString = {
    connection: {
        prod: {
            host: 'us-cdbr-east-02.cleardb.com',
            user: 'b7ff08adeb1efd',
            password: 'bf55b92f',
            database: 'heroku_8fa48d4d9e6263e'
        },
        dev: {
            host: 'us-cdbr-east-02.cleardb.com',
            user: 'b7ff08adeb1efd',
            password: 'bf55b92f',
            database: 'heroku_8fa48d4d9e6263e'
        },
        qa: {
            host: 'localhost',
            user: 'subuser',
            password: 'Subuser@123',
            database: 'subscription'
        }
    }
}

module.exports.mysqlConnectionString = mysqlConnectionString;