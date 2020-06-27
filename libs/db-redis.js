const { passwordRedis } = require('../password.config')
const redis = require('redis')

const connection = {
    port: 10330,
    host: 'redis-10330.c16.us-east-1-2.ec2.cloud.redislabs.com',
    auth_pass: passwordRedis
}

module.exports = {
    redisClient : redis.createClient({
        port : connection.port,
        host: connection.host,
        auth_pass: connection.auth_pass
    }),
    connection: connection
}
    