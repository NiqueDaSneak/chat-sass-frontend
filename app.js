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

// DATABASE SETUP
const mongoose = require('mongoose')
// mongoose.connect('mongodb://dom:Losangeleslakers47@ds123182.mlab.com:23182/chat-sass-frontend')
mongoose.connect('mongodb://domclemmer:domclemmerpasswordirrigate@ds153173-a0.mlab.com:53173,ds153173-a1.mlab.com:53173/irrigate?replicaSet=rs-ds153173', {useMongoClient: true})
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))

var userSchema = mongoose.Schema({
  email: String,
  organization: String,
  onboarded: Boolean,
  username: String,
  userID: Number,
  pageID: Number,
  pageAccessToken: String,
  userAccessToken: String,
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
    callbackURL: "https://www.irrigatemessaging.com/auth/check-pages",
    profileFields: ['id', 'emails', 'name']
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({
      'userID': profile.id
    }, (err, user) => {
      if (err) {
        console.log(err)
      }
      if (user) {
        return done(null, user)
      } else {
        var newUser = new User()
        console.log('PROFILE: ' + JSON.stringify(profile))
        console.log('PROFILE.EMAILS: ' + profile.emails)
        if (profile.emails === undefined) {
          console.log('no email')
        } else {
          newUser.email = profile.emails[0].value
        }

        newUser.onboarded = false
        newUser.userID = profile.id
        newUser.userAccessToken = accessToken
        newUser.save((err, user) => {
          if (err) return console.error(err)
          return done(null, user)
        })
      }
    })
  }))

// ROUTES
app.get('/auth/facebook', passport.authenticate('facebook', { scope: [ 'manage_pages', 'publish_pages', 'pages_messaging', 'email', 'pages_show_list'] }))

// Facebook redirect
app.get('/auth/check-pages', passport.authenticate('facebook', {
  failureRedirect: '/',
  session: false
}), (req, res, next) => {
  req.session.user = req.user
  if (req.user.pageID) {
    res.redirect('/dashboard/' + req.user.organization)
  } else {
    res.redirect('/choose-page/' + req.user.userID + '/' + req.user.userAccessToken)
  }
})

app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/privacy-policy.html'))
})

app.get('/choose-page/:userID/:userAccessToken', (req, res, next) => {
  res.sendFile(path.join(__dirname + '/views/pages.html'))
})

app.get('/save-page', (req, res) => {
  User.findOne({
    'userID': req.query.userid
  }, (err, user) => {
    if (err) return console.error(err)

    var getUsername = new Promise(function(resolve, reject) {
      let options = {
        method: 'get',
        url: 'https://graph.facebook.com/v2.10/' + req.query.pageid + '?fields=username&access_token=' + req.query.access_token
      }

      request(options, (err, res, body) => {
        if (err) {
          console.error('error with getting username: ' + err)
          throw err
        }


        var headers = res.headers
        var statusCode = res.statusCode
        console.log('headers: ', headers)
        console.log('statusCode: ', statusCode)
        console.log('body: ', body)
        resolve(body)
      })
    })

    getUsername.then((body) => {
      let userObj = JSON.parse(body)
      user.username = userObj.username
      user.pageID = req.query.pageid
      user.organization = req.query.org.split(' ').join('').toLowerCase()
      user.pageAccessToken = req.query.access_token
      user.save((err, user) => {
        if (err) return console.error(err)

        // send this to subscribe the page to our webhook
        var webhookPromise = new Promise(function(resolve, reject) {
          var webhookOptions = {
            method: 'post',
            url: 'https://graph.facebook.com/v2.10/' + user.pageID + '/subscribed_apps?access_token=' + user.pageAccessToken
          }

          request(webhookOptions, (err, res, body) => {
            if (err) {
              console.error('error with webhook: ', err)
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
            url: 'https://graph.facebook.com/v2.10/' + user.pageID + '/messenger_profile?access_token=' + user.pageAccessToken
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
            url: 'https://graph.facebook.com/v2.10/' + user.pageID + '/thread_settings?access_token=' + user.pageAccessToken
          }

          request(setGreetingOptions, (err, res, body) => {
            if (err) {
              console.error('error with greeting: ', err)
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
})

app.get('*', (req, res) => {
  var host = req.get('host')
  if (!req.connection.encrypted) {
    console.log('not https')
    if (host === 'localhost:3000') {
      console.log('localhost')
    } else {
      console.log( 'redirecting to https')
      res.redirect('https://' + host + req.url)
    }
  } else {
    console.log('https')
  }
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/index.html'))
})

app.get('/dashboard/:organization', (req, res) => {
  if (req.session.user) {
  res.sendFile(path.join(__dirname + '/views/dashboard.html'))
  console.log('LOGGED IN: ' + JSON.stringify(req.session.user))
  } else {
  console.log('not logged in')
  res.redirect('/auth/facebook')
  }
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

  socket.on('requestPages', (data) => {
    requestPages(data.userID, data.userAccessToken)
  })

  socket.on('requestDelete', (data) => {
    Message.findOneAndRemove({'_id': data.data}, (err) => {
      if (err) {
        console.log(err)
      }
      socket.emit('reloadPage')
    })
  })

  socket.on('isOnboarded?', (data) => {
    User.findOne({'organization': data.data}, (err, user) => {
      if (err) {
        console.log(err)
      }
      if (user.onboarded === true) {
        console.log('already onboarded')
      } else {
        socket.emit('onboardUser',{data: user.username})
      }
    })
  })

  socket.on('promoteOnFacebook', (data) => {
    User.findOne({'organization': data.org}, (err, user) => {
      let options = {
        method: 'post',
        url: 'https://graph.facebook.com/v2.10/'  + user.pageID + '/feed?message=' + data.post + '&access_token=' + user.pageAccessToken
      }

      request(options, (err, res, body) => {
        if (err) {
          console.error('error with webhook: ', err)
          throw err
        }
        var headers = res.headers
        var statusCode = res.statusCode
        console.log('headers: ', headers)
        console.log('statusCode: ', statusCode)
        console.log('body: ', body)
        let bodyResponse = JSON.parse(body)
        // link to the post
          // 'https://www.facebook.com/' + bodyResponse.id
      })
    })

    var webhookPromise = new Promise(function(resolve, reject) {
      var webhookOptions = {
        method: 'post',
        url: 'https://graph.facebook.com/v2.10/' + user.pageID + '/subscribed_apps?access_token=' + user.pageAccessToken
      }

      request(webhookOptions, (err, res, body) => {
        if (err) {
          console.error('error with webhook: ', err)
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
    console.log(data.post)
    console.log(data.org)

  })

  socket.on('onboardComplete', (data) => {
    User.findOne({'organization': data.data}, (err, user) => {
      if (err) {
        console.log(err)
      }
      user.onboarded = true
      user.save((err, user) => {
        if (err) {
          console.log(err)
        } else {
          console.log('are they onboarded? ' + user.onboarded)
        }
      })
    })
  })

  socket.on('deleteGroup', (data) => {
    Group.findOneAndRemove({'groupName': data.groupName}, (err) => {
      if (err) {
        console.log(err)
      }
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
  })

  function requestPages(userID, userAccessToken) {
    var options = {
      method: 'get',
      url: "https://graph.facebook.com/v2.10/" + userID + "/accounts?access_token=" + userAccessToken
    }
    request(options, function(err, res, body) {
      if (err) {
        console.error(err)
      }
      console.log('BODY!!!! ' + body)
      var data = JSON.parse(body)
      console.log('its works! number of pages: ' + data.data.length)
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
