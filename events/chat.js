const { passwordRedis} = require('../password.config')
const redis = require('redis').createClient({
  port: 10330,
  host: 'redis-10330.c16.us-east-1-2.ec2.cloud.redislabs.com',
  auth_pass: passwordRedis
})

module.exports = (app, io) => {

    const onlines = {}

    io.on('connection', (client) => {

        const { session } = client.handshake
        const { usuario } = session

        redis.sadd('onlines', usuario.email, () => {
          redis.smembers('onlines', (err, emails) => {
            emails.forEach(email => {
              client.emit('notify-onlines', email)
              client.broadcast.emit('notify-onlines', email)
            })
          })
        })

        client.on('send-server', (hashDaSala, msg) => {

          const resposta = `<b> ${usuario.nome}:</b> ${msg} <br>`
          const novaMensagem = {
            email: usuario.email,
            sala: hashDaSala
          }

          redis.lpush(hashDaSala,resposta)
          client.broadcast.emit('new-message', novaMensagem)
          io.to(hashDaSala).emit('send-client', resposta)
        })

        client.on('create-room', (hashDaSala) => {
          session.sala = hashDaSala
          client.join(hashDaSala)

          const resposta = `<b>${usuario.nome} :</b> entrou <br>`
          redis.lpush(hashDaSala, resposta, () => {
            redis.lrange(hashDaSala, 0, -1, (err, msgs) => {
              msgs.forEach(msg => io.to(hashDaSala).emit('send-client', msg))
            })
          })
        })

        client.on('disconnect', () => {
          const {sala} = session
          const resposta = `<b>${usuario.nome}: </b> saiu. <br>`
          redis.srem('onlines', usuario.email)

          redis.lpush(sala, resposta, () => {

            session.sala = null
            client.leave(sala)
            client.broadcast.emit('notify-offlines', usuario.email)
            io.to(sala).emit('send-client', resposta)

          })
        })
    })
}