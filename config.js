const sessionKey =  'ntalk.id'
const sessionSecret = 'ntalk_secret'

module.exports = {
    sessionKey,
    sessionSecret,
    forever: {
        max: 10,
        silent: true,
        killTree: true,
        logFile: 'logs/forever.log',
        outFile: 'logs/app.log',
        errFile: 'logs/error.log'
    },
    cache: {
        maxAge: 3600000
    }
}