const { passwordMongoDB } = require('../password.config')
const mongoose = require('mongoose')
const bluebird = require('bluebird')

const currentEnv = process.env.NODE_ENV || 'development'

const envURL = {
    test: `mongodb+srv://danilo:${passwordMongoDB}@ntalk-6rsri.gcp.mongodb.net/ntalk_teste?retryWrites=true&w=majority`,
    development: `mongodb+srv://danilo:${passwordMongoDB}@ntalk-6rsri.gcp.mongodb.net/ntalk?retryWrites=true&w=majority`
}

mongoose.Promise = bluebird
mongoose.connect(envURL[currentEnv.trim()],  { useNewUrlParser: true })

module.exports = mongoose

