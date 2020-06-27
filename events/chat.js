const {redisClient} = require('../libs/db-redis')

module.exports = (app, io) => {

    const onlines = {}

    io.on('connection', (client) => {

        const { session } = client.handshake
        const { usuario } = session

        redisClient.sadd('onlines', usuario.email, () => {
          redisClient.smembers('onlines', (err, emails) => {
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

          redisClient.lpush(hashDaSala,resposta)
          client.broadcast.emit('new-message', novaMensagem)
          io.to(hashDaSala).emit('send-client', resposta)
        })

        client.on('create-room', (hashDaSala) => {
          session.sala = hashDaSala
          client.join(hashDaSala)

          const resposta = `<b>${usuario.nome} :</b> entrou <br>`
          redisClient.lpush(hashDaSala, resposta, () => {
            redisClient.lrange(hashDaSala, 0, -1, (err, msgs) => {
              msgs.forEach(msg => io.to(hashDaSala).emit('send-client', msg))
            })
          })
        })

        client.on('disconnect', () => {
          const {sala} = session
          const resposta = `<b>${usuario.nome}: </b> saiu. <br>`
          redisClient.srem('onlines', usuario.email)

          redisClient.lpush(sala, resposta, () => {

            session.sala = null
            client.leave(sala)
            client.broadcast.emit('notify-offlines', usuario.email)
            io.to(sala).emit('send-client', resposta)

          })
        })
    })
}