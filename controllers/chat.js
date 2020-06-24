module.exports = (app) => {

    const chatController = {
        index (req, res) {
            const { usuario } = req.session
            res.render('chat/index', { usuario })
        }
    }

    return chatController

}