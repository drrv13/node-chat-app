const {server, io} = require('./app')
const Filter = require('bad-words')
const port = process.env.PORT || 3000
const {
    generateMessage,
    generateLocationMessage
} = require('./utils/messages')
const {
    addUser,
    getUsersInRoom,
    getUser,
    removeUser
} = require('./utils/users')


io.on('connection', (socket) => {
    console.log('New WebSocket connection')
    
    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id: socket.id, ...options})
        if (error) {
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('messageToClient', generateMessage('Боженька','Добро пожаловать в наше арабское казино'))
        socket.broadcast.to(user.room).emit('messageToClient', generateMessage('Боженька' ,`${user.username} говорит всем здрасьте`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
        // socket.emit, io.emit, socket.broadcast.emit
        // io.to.emit, socket.broadcast.to.emit
    })
    
    socket.on('messageToServer', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }
        const user = getUser(socket.id)
        io.to(user.room).emit('messageToClient', generateMessage(user.username, message))
        callback()
    })
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, coords.latitude,coords.longitude))
        callback('Location shared')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('messageToClient', generateMessage('Боженька' ,`${user.username} ушел курить`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
    })
})



server.listen(port, () => {
    console.log('Server is now up on port ' + port)
})