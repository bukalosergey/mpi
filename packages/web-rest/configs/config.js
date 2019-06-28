module.exports = {

    // application settings
    application: {
        port: 3002,
        baseUrl: 'https://3dsserver.d8corporation.com'
    },

    // redis connection
    redisConnection: {
        port: 6379,
        host: 'localhost',
        db: 0
    },

    // database connection to knex client
    knexConnection: {
        client: "oracledb",
        fetchAsString: ["clob"],
        connection: {
            host: '192.168.1.35', 
            user: 'DSSERVERKNEX',
            password: 'dsserverknex1',
            database: 'ORA12',
            pool: {
                max: 10,
                min: 5,
                timeout: 60,
                increment: 1
            }
        }
    },

    // use strict ssl
    rejectUnauthorized: false,

    // store data from database in redis to increase performance (on big datasets is not recomended)
    cacheTableDataInRedis: true,

    logger: {
        destination: undefined, // the path to the local file, if null or undefined then output to console
        level: 'debug' // 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
    }
}