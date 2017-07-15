const passport = require('passport')
const GitHubStrategy = require('passport-github').Strategy
const express = require('express')
const expressSession = require('express-session')


// configure passport oauth strategy
passport.use(new GitHubStrategy({
  clientID: process.env['GITHUB_CLIENT_ID'],
  clientSecret: process.env['GITHUB_CLIENT_SECRET'],
  callbackURL: 'http://192.168.33.10/auth/github/callback'
},
function(accessToken, refreshToken, profile, cb) {
  return cb(null, profile) // just serialize the whole profile
}))
// serialize / deserialize into session
passport.serializeUser(function(user, cb) {
  cb(null, user)
})
passport.deserializeUser(function(obj, cb) {
  cb(null, obj)
})

// configure webserver with oauth
const app = express()
app.use(expressSession({
  secret: process.env['SECRET_KEY'],
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.get('/auth/github/login', passport.authenticate('github'))
// return to original URL if in session
app.get('/auth/github/callback',
  passport.authenticate('github', {failureRedirect: '/login'}),
  function(req, res) {
    // explicitly save session before redirecting
    req.session.save(() => {
      res.redirect(req.session.returnTo || '/')
      delete req.session.returnTo
    })
  }
)


// for all other routes, use static webserver only if properly authenticated
function ensureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  req.session.returnTo = req.path // store wanted path in session
  res.redirect('/auth/github/login') // authenticate against GitHub
}
app.use('/',
  ensureAuthenticated,
  express.static('static')
)
app.listen(80)
