const { body, validationResult } = require("express-validator");
const User = require('../models/userSchema')
const crypto = require('crypto');
const passport = require("passport");

exports.index = (req, res) => {
    res.render('index', {username: req.user.username})
}


exports.login_get = (req, res) => {
    res.render('login', {title: ''})
}


exports.login_post =   passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/register',
        failureFlash: true
    }) // need to add pages where user will be forwarded after


exports.register_get = (req, res) => {
    res.render('register', {title: 'Register'})
}

exports.register_post = [
    body("username", "Username required").trim().isLength({min: 1}).escape(),
    body("password", "password is required").trim().isLength({min: 1}).escape(),

(req, res, next) => {
    const saltHash = hashPassword(req.body.password)
            User.findOne({username: req.body.username})
                .exec((err, found_user) => {
                    if(err) {return next(err)}
                    if(found_user) {
                            res.render('register', {title: 'Username already exist please choose another one'})
                    }
                    else{
                        const salt = saltHash.salt;
                        const hash = saltHash.hash;
                        const newUser = new User({
                            username: req.body.username,
                            hash: hash,
                            salt: salt
                        });
                        newUser.save()
                            .then((user) => {
                                console.log(user);
                            });
                            res.render('index', {username: req.body.username})
                    }
                })
}
]



exports.logout_post = (req, res) => {
    req.logout((err) => {
        if(err) return next(err)
        res.redirect('/')
    })

}


function hashPassword(password) {
    const salt = crypto.randomBytes(32).toString('hex');
    const genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    return {
      salt: salt,
      hash: genHash
    };

}
// hash validation function is in passport config file