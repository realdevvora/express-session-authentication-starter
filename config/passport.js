const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const connection = require('./database');
const User = connection.models.User;
const validPassword = require('../lib/passwordUtils').validPassword;

// fields for input
const customFields = {
    usernameField: 'uname',
    passwordField: 'pw'
}

// verifying fields in DB
const verifyCallback = (username, password, done) => {
    // finding user in DB
    User.findOne({username: username}).then((user) => {
        
        // if user doesnt exist, return false
        if (!user) return done(null, false)

        
        // check if password is valid
        const isValid = validPassword(password, user.hash, user.salt)

        if (isValid) {
            // allowing login
            return done(null, user)
        } else {
            // denying login
            return done(null, false)
        }
    }).catch((err) => {
        done(err)
    })

}

// creating strategy (allows to change algorithm without changing implementation i.e, dependency inversion)
const strategy = new LocalStrategy(verifyCallback)

// passing to passport
passport.use(strategy)

passport.serializeUser((user, done) => {
    done(null, user.id)
});

passport.deserializeUser((userId, done) => {
    User.findById(userId)
        .then((user) => {
            done(null, user)
        })
        .catch(err => done(err))
})