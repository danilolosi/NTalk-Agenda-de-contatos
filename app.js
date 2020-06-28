const express = require('express')
const path = require('path')
const http = require('http')
const socketIO = require('socket.io')
const consign = require('consign')
const bodyParser = require('body-parser')
const csurf = require('csurf')
const cookie = require('cookie')
const compression = require('compression')
const expressSession = require('express-session')
const methodOverride = require('method-override')
const config = require('./config')
const error = require('./middlewares/error')
const {redisClient, connection} = require('./libs/db-redis')
const redisAdapter = require('socket.io-redis')
const RedisStore = require('connect-redis')(expressSession)

const app = express()
const server = http.Server(app)
const io = socketIO(server)
const store = new RedisStore({client: redisClient,
                              prefix: config.sessionKey})

app.set('views', path.join(__dirname , 'views'))
app.set('view engine', 'ejs')
app.use(compression())
app.use(expressSession({
    store,
    name: config.sessionKey,
    secret: config.sessionSecret
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
app.use(methodOverride('_method'))
app.use(
  express.static(
    path.join(__dirname, 'public'),
    {maxAge: 3600000}
    )
  )

app.use(csurf())
app.use((req,res,next) => {
  res.locals._csrf = req.csrfToken()
  next()
})

io.adapter(redisAdapter({host: connection.host , port: connection.port, auth_pass: connection.auth_pass}))
io.use((socket,next) => {

    const cookieData = socket.request.headers.cookie
    const cookieObj = cookie.parse(cookieData)
    const sessionHash = cookieObj[config.sessionKey] || ''
    const sessionID = sessionHash.split('.')[0].slice(2)

    store.get(sessionID, (err, currentSession) => {
      if(err){
        return next(new Error('Acesso negado!'))
      }
      socket.handshake.session = currentSession
      return next()
    })

    return true
})

consign({})
  .include('models')
  .then('controllers')
  .then('routes')
  .then('events')
  .into(app, io)

  app.use(error.notFound)
  app.use(error.serverError)

server.listen(3000, () => console.log('Ntalk no ar'))

module.exports = app
