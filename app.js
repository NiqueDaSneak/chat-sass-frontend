"use strict"

// NPM PACKAGES
const express = require('express')
const path = require("path")
const fs = require('fs')
const bodyParser = require('body-parser')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const request = require('request')
const util = require('util')

// CHAT CONTENT
const content = JSON.parse(fs.readFileSync('content/chat.json', 'utf8'))

// DATABASE SETUP
const mongoose = require('mongoose')
// mongoose.connect('mongodb://dom:Losangeleslakers47@ds123182.mlab.com:23182/chat-sass-frontend')
mongoose.connect('mongodb://domclemmer:domclemmerpasswordirrigate@ds153173-a0.mlab.com:53173,ds153173-a1.mlab.com:53173/irrigate?replicaSet=rs-ds153173', {useMongoClient: true})
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))

var userSchema = mongoose.Schema({
  email: String,
  organization: String,
  facebook: {
    userID: Number,
    pageID: Number,
    pageAccessToken: String,
    userAccessToken: String,
    refreshToken: String
  }
})

var User = mongoose.model('User', userSchema)

var messageSchema = mongoose.Schema({
  type: String,
  date: String,
  assetManifest: Object,
  organization: String,
  groupNames: Array,
  id: Number
})
var Message = mongoose.model('Message', messageSchema)

var memberSchema = mongoose.Schema({
  organization: String,
  fbID: Number,
  fullName: String,
  enrolled: Boolean,
  timezone: Number,
  photo: String
})
var Member = mongoose.model('Member', memberSchema)

var affirmationSchema = mongoose.Schema({
  text: String
})
var Affirmation = mongoose.model('Affirmation', affirmationSchema)

var groupSchema = mongoose.Schema({
  groupName: String,
  groupMembers: Array,
  organization: String
})
var Group = mongoose.model('Group', groupSchema)

// PASSPORTJS CONFIG
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy

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
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(passport.initialize())
app.use(passport.session())

passport.use(new FacebookStrategy({
    clientID: '372903006444693',
    clientSecret: 'e0cf0b310d6931c9140969a115efefa9',
    callbackURL: "http://chat-sass-frontend.herokuapp.com/auth/check-pages",
    profileFields: ['id', 'emails', 'name']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(refreshToken)
    User.findOne({
      'facebook.userID': profile.id
    }, (err, user) => {
      if (err) {
        console.log(err)
      }
      if (user) {
        return done(null, user)
      } else {
        var newUser = new User()
        if (profile.emails[0].value) {
          newUser.email = profile.emails[0].value
        }
        newUser.facebook.userID = profile.id
        newUser.facebook.userAccessToken = accessToken
        newUser.facebook.refreshToken = refreshToken
        newUser.save((err, user) => {
          if (err) return console.error(err)
          return done(null, user)
        })
      }
    })
  }))

// ROUTES
app.get('/auth/facebook', passport.authenticate('facebook', { scope: [ 'publish_pages', 'user_likes', 'pages_messaging', 'user_friends', 'ads_management', 'email', 'pages_show_list', 'manage_pages'] }))

// Facebook redirect
var id
app.get('/auth/check-pages', passport.authenticate('facebook', {
  failureRedirect: '/',
  session: false
}), (req, res, next) => {
  if (req.user.facebook.pageID) {
    console.log('USER: ' + JSON.stringify(req.user))
    res.redirect('/dashboard/' + req.user.organization)
  } else {
    res.sendFile(path.join(__dirname + '/views/pages.html'))
    console.log('USER: ' + JSON.stringify(req.user))
    id = req.user.facebook.userID
  }
})

app.get('/save-page', (req, res) => {
  User.findOne({
    'facebook.userID': req.query.userid
  }, (err, user) => {
    if (err) return console.error(err)
    user.facebook.pageID = req.query.pageid
    user.organization = req.query.org.split(' ').join('').toLowerCase()
    user.facebook.pageAccessToken = req.query.access_token
    user.save((err, user) => {
      if (err) return console.error(err)

      // send this to subscribe the page to our webhook
      var webhookPromise = new Promise(function(resolve, reject) {
        var webhookOptions = {
          method: 'post',
          url: 'https://graph.facebook.com/v2.6/' + user.facebook.pageID + '/subscribed_apps?access_token=' + user.facebook.pageAccessToken
        }

        request(webhookOptions, (err, res, body) => {
          if (err) {
            console.error('error posting json: ', err)
            throw err
          }
          var headers = res.headers
          var statusCode = res.statusCode
          console.log('headers: ', headers)
          console.log('statusCode: ', statusCode)
          console.log('body: ', body)
          resolve()
        })
      })
      var getStartedPromise = new Promise(function(resolve, reject) {
        // send this to implement a get started button
        var getStarted = {
          "get_started": {
            "payload": "GET_STARTED_PAYLOAD"
          }
        }
        var getStartedOptions = {
          method: 'post',
          body: getStarted,
          json: true,
          url: 'https://graph.facebook.com/v2.6/' + user.facebook.pageID + '/messenger_profile?access_token=' + user.facebook.pageAccessToken
        }

        request(getStartedOptions, (err, res, body) => {
          if (err) {
            console.error('error with get started button: ', err)
            throw err
          }
          var headers = res.headers
          var statusCode = res.statusCode
          console.log('headers: ', headers)
          console.log('statusCode: ', statusCode)
          console.log('body: ', body)
          resolve()
        })
      })

      var setGreetingPromise = new Promise(function(resolve, reject) {
        // send this to implement a get started button
        var setGreeting = {
          "setting_type": "greeting",
          "greeting": {
            "text": "Welcome {{user_first_name}}! Go ahead and tap Get Started to sign up!"
          }
        }
        var setGreetingOptions = {
          method: 'post',
          body: setGreeting,
          json: true,
          url: 'https://graph.facebook.com/v2.6/' + user.facebook.pageID + '/thread_settings?access_token=' + user.facebook.pageAccessToken
        }

        request(setGreetingOptions, (err, res, body) => {
          if (err) {
            console.error('error with get started button: ', err)
            throw err
          }
          var headers = res.headers
          var statusCode = res.statusCode
          console.log('headers: ', headers)
          console.log('statusCode: ', statusCode)
          console.log('body: ', body)
          resolve()
        })
      })

        webhookPromise.then(() => {
          console.log('subscribed to webhook')
          getStartedPromise.then(() => {
            console.log('new page should have get started button')
            setGreetingPromise.then(() => {
              console.log('greeting set! promises done! ')
            })
          })
        })
      res.redirect('/dashboard/' + user.organization)
    })
  })
})

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
  // if (req.session.email) {
  res.sendFile(path.join(__dirname + '/views/dashboard.html'))
  // console.log('logged in: ' + req.session.email)
  // } else {
  // console.log('not logged in')
  // res.redirect('/auth')
  // }
})

app.post('/message', (req, res) => {
  console.log(req.body)
  res.sendStatus(200)
})

// SOCKET.IO
io.on('connection', (socket) => {

  console.log('Server connected to client!')

  socket.on('requestScheduledMsg', (data) => {
    Message.find({
      organization: data.data
    }, (err, msgs) => {
      socket.emit('scheduledMsgs', {
        data: msgs
      })
    })
  })

  socket.on('requestMsgs', (data) => {
    Message.find({
      organization: data.data
    }, (err, msgs) => {
      console.log(msgs)
      socket.emit('sendMsgs', {
        data: msgs
      })
    })
  })

  socket.on('sendData', (data) => {
    socket.emit('botMessage', {
      content: content[data.query]
    })
  })

  socket.on('requestMembers', (data) => {
    Member.find({
      organization: data.data
    }, (err, users) => {
      if (err) return console.error(err)
      for (var i = 0; i < users.length; i++) {
        socket.emit('addUser', {
          data: users[i]
        })
      }
    })
  })

  socket.on('requestMembersForMessage', (data) => {
    Group.find({
      organization: data.data
    }, (err, groups) => {
      if (err) return console.error(err)
      for (var i = 0; i < groups.length; i++) {
        socket.emit('showGroupsForMessage', {
          data: groups[i]
        })
      }
    })
  })

  socket.on('createGroup', (data) => {
    console.log(data.groupMembers)
    var newGroup = new Group({
      groupName: data.groupName,
      groupMembers: data.groupMembers,
      organization: data.org
    }).save((err, group) => {
      if (err) {
        return console.error(err)
      } else {
      }
    })
  })

  socket.on('getList', (data) => {
    Group.find({
      organization: data.org
    }, (err, group) => {
      if (err) {
        return console.error(err)
      } else {
        socket.emit('showList', {
          data: group
        })
      }
    })
  })

  socket.on('getGroups', (data) => {
    Group.find({
      organization: data.org
    }, (err, group) => {
      if (err) {
        return console.error(err)
      } else {
        socket.emit('groups', {
          data: group
        })
      }
    })
  })

  socket.on('requestPages', () => {
    console.log('...requesting')
    socket.emit('userID', {
      id: id
    })
    requestPages(id)
  })

  function requestPages(id) {
    var options = {
      method: 'get',
      url: "https://graph.facebook.com/v2.6/" + id + "/accounts?access_token=EAAFTJz88HJUBAAuDTlDz2QflnfI2nM8E7rZCkxTWHJrlhngEIUqNHWpVAnwvOhyEZCbRB3wxL2en3Pca7eZAW7WJmIKyrgRFHgyt1oupDz7n2v0BBZCiMSozLoZAxOvdSeZCBLFfFirffklKfN2e4a5JBZCd7p7s5Y2Us6VVEcgeQZDZD"
    }
    request(options, function(err, res, body) {
      if (err) {
        console.error(err)
      }
      console.log(body)
      var data = JSON.parse(body)
      for (var i = 0; i < data.data.length; i++) {
        socket.emit('addPages', {
          page: data.data[i]
        })
        console.log('pageName!!!!' + data.data[i].name)
        console.log('access_token!!!!' + data.data[i].access_token)
      }
    })
  }
})



// SET UP SERVER ENVIRONMENT
var port = process.env.PORT || 3000
server.listen(port, function() {
  console.log('Server running on port ' + port)
})

app.on('error', function() {
  console.log(error)
})

module.exports = app
