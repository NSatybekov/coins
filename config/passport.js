const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const connection = require('./database');
const User = require('../models/userSchema');
const mongoose = require('mongoose');
const session = require('express-session')
const MongoStore = require('connect-mongo')
const crypto = require('crypto')


exports.initializePassport = function(passport){
    passport.use(new LocalStrategy(
        async function(username, password, done) {
            const user = await User.findOne({username: username}) 
                if (!user) { return done(null, false) }

                try{
                    const isValid = validPassword(password, user.hash, user.salt)
                    if (isValid) {
                        return done(null, user);
                    } else {
                        return done(null, false);
                    }
                }catch (err) {
                    return done(err)
                  }

            }))

            passport.serializeUser((user, done) => {done(null, user.id)})
            passport.deserializeUser((id, done) => {
                User.findById(id, (err, user)=> {
                    if (err) { return done(err)}
                    done(null, user)
                })
            })
}



exports.sessionDetails = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongoUrl: process.env.DB_URL
    }),
    cookie: {
        maxAge: 1000 * 60 * 10
    }
}

exports.checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }
  
exports.checkNotAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }


exports.checkProfileOwner = (req, res, next) => {
    if(req.params.id == req.user._id) {
       return next()
    }
    res.send('Ty sho ohuel, tebe nelzya etogo delat ty ne owner')
}

function validPassword(password, hash, salt) {
    const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
}
// создать подключение и запись в БД - как затестить хэширование и солтинг

