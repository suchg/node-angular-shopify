var mysqlConnectionString = {
  connection: {
      dev: {
          host: 'localhost',
          user: 'subuser',
          password: 'Subuser@123',
          database: 'subscription'
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