require('dotenv').config()

const express = require(`express`);
const bodyParser = require(`body-parser`);
const mongoose = require(`mongoose`);
// const encrypt = require(`mongoose-encryption`);
const ejs = require(`ejs`);
// const md5 = require(`md5`);
const session = require('express-session');
const passport = require(`passport`);
const passportLocalMongoose = require(`passport-local-mongoose`);

const app = express();
app.use(express.static(`public`));
app.set(`view engine`, `ejs`);
app.use(bodyParser.urlencoded({
    extended: true
}));

// using session below
app.use(session({
    secret: `my little secret`,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

// connects mongoose to mongoDB
mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true });
mongoose.set(`useCreateIndex`, true);

// creates an userSchema class on which new user objects are gonaa be created
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model(`User`, userSchema);

// Configure Passport/Passport-Local
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get(`/`, (req, res) => {
    res.render(`home`);
});

app.get(`/login`, (req, res) => {
    res.render(`login`);
});

app.get(`/register`, (req, res) => {
    res.render(`register`);
});

/* checking if user is logged in or not
 * if yes then renders to the `/secrets` route
 * if not then redirects to the `/login` route
 */
app.get(`/secrets`, (req, res) => {
    if (req.isAuthenticated()) {
        res.render(`/secrets`);
    } else {
        res.redirect(`/login`);
    }
});

// register a new user to our web-app
app.post(`/register`, (req, res) => {
    User.register({ username: req.body.username}, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect(`/register`);
        } else {
            // creates a logged in session and then redirects to secrets page
            passport.authenticate(`local`)(req, res, function () {
                res.redirect(`/secrets`);
            });
        }
    });
});

// login
app.post(`/login`, (req, res) => {

    const user = new User ({
        usernamme: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        } else {
            passport.authenticate(`local`)(req, res, function () {
                res.redirect(`/secrets`);
            });
        }
    });
})

app.listen(3000, function () {
    console.log(`server is up`);
})
