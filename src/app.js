const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const hbs = require('hbs')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

//define paths for wxpress config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialPath = path.join(__dirname, '../templates/partials')

//setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialPath)

//setup static directory to serve
app.use(express.static(publicDirectoryPath))

app.get('', (req,res) => {
    res.render('index', {
        title: 'chat-app'
    })
})
app.get('/chat', (req,res) => {
    res.render('chat', {
        title: 'Попизделки'
    })
})
module.exports = {
    server,
    io
}