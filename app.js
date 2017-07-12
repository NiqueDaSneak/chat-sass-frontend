"use strict"

// NPM PACKAGES
const express = require('express')
const path = require("path")
const fs = require('fs')
const bodyParser = require('body-parser')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

// CHAT CONTENT
const content = JSON.parse(fs.readFileSync('content/chat.json', 'utf8'))

// DATABASE SETUP
const mongoose = require('mongoose')
mongoose.connect('mongodb://dom:Losangeleslakers47@ds123182.mlab.com:23182/chat-sass-frontend')
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))

var userSchema = mongoose.Schema({email: String, organization: String, password: String})
var User = mongoose.model('User', userSchema)

var messageSchema = mongoose.Schema({type: String, date: String, assetManifest: Object, organization: String, groupNames: Array, id: Number})
var Message = mongoose.model('Message', messageSchema)

// BCRYPT
var bcrypt = require('bcryptjs')

// EXPRESS SETUP
app.use(express.static('public'))
app.use(express.static(__dirname + 'view'))
var session = require('cookie-session')
var sess = {
  secret: 'ELpR4sYMFAv12w4Ae386',
  cookie: {},
  resave: false,
  saveUninitialized: true
}
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// ROUTES
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/index.html'))
})

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/auth.html'))
})

app.get('/auth-error', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/auth-error.html'))
})

app.get('/dashboard/:organization', (req, res) => {
  if (req.session.email) {
    res.sendFile(path.join(__dirname + '/views/dashboard.html'))
    console.log('logged in: ' + req.session.email)
  } else {
    console.log('not logged in')
    res.redirect('/auth')
  }
})

app.post('/login', (req, res) => {
  User.findOne({email: req.body.email}, (err, user) => {
    if (err) return console.error(err)
    bcrypt.compare(req.body.password, user.password).then((response) => {
        if (response) {
          req.session.email = req.body.email
          res.redirect('dashboard/' + user.organization)
        } else {
          res.redirect('auth-error')
        }
    })
  })
})

app.post('/signup', (req, res) => {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
      var newUser = new User({email: req.body.email, organization: req.body.organization, password: hash}).save((err, user) => {
        if (err) return console.error(err)
      })
    })
  })
  req.session.email = req.body.email
  res.redirect('/dashboard')
})

app.post('/message', (req, res) => {
    console.log(req.body)
    res.sendStatus(200)
})

// SOCKET.IO
io.on('connection', (socket) => {

  console.log('Server connected to client!')

  socket.on('requestScheduledMsg', (data) => {
    Message.find({ organization: data.data }, (err, msgs) => {
      socket.emit('scheduledMsgs', {data: msgs})
    })
  })

  socket.on('requestMsgs', (data) => {
    Message.find({ organization: data.data }, (err, msgs) => {
      socket.emit('sendMsgs', {data: msgs})
    })
  })

  socket.on('sendData', (data) => {
    socket.emit('botMessage', {content: content[data.query]})
  })

})

// SET UP SERVER ENVIRONMENT
var port = process.env.PORT || 3000
server.listen(port, function(){
    console.log('Server running on port ' + port)
})

app.on('error', function(){
    console.log(error)
})

module.exports = app
