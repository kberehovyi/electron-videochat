(
    function () {
        const express = require('express')
        const app = express()
        const path = require('path')
        const server = require('http').Server(app)
        const io = require('socket.io')(server)
        // const { v4: uuidV4 } = require('uuid')
        const chatRoomId = 'f1f1'

        app.set('view engine', 'ejs')
        app.use(express.static(path.join(__dirname, 'public')))

        app.get('/', (req, res) => {
            res.redirect(`/${chatRoomId}`)
        })

        app.get('/:room', (req, res) => {
            res.render(path.join(__dirname, 'views', 'room.ejs'))
        })

        io.on('connection', socket => {
            socket.on('join-room', (roomId, userId) => {
                socket.join(roomId)
                socket.to(roomId).broadcast.emit('user-connected', userId)

                socket.on('disconnect', () => {
                    socket.to(roomId).broadcast.emit('user-disconnected', userId)
                })
            })
        })

        server.listen(3000, () => console.log('Server listen'))

        module.exports = server;
    }()
);
