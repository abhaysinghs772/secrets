require('dotenv').config()

const express = require(`express`);
const bodyParser = require(`body-parser`);
const mongoose = require(`mongoose`);
const encrypt = require(`mongoose-encryption`);
const ejs = require(`ejs`);
const md5 = require(`md5`);

const app = express();
app.use(express.static(`public`));
app.set(`view engine`, `ejs`);
app.use(bodyParser.urlencoded({
    extended: true
}));

// connects mongoose to mongoDB
mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true });

// creates an userSchema class on which new user objects are gonaa be created
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// Secret String Instead of Two Keys

// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']});

// creates an Users( plural ) Model on top of userSchema
const User = new mongoose.model(`User`, userSchema);

app.get(`/`, (req, res) => {
    res.render(`home`);
});

app.get(`/login`, (req, res) => {
    res.render(`login`);
});

app.get(`/register`, (req, res) => {
    res.render(`register`);
});

// register a new user to our web-app
app.post(`/register`, (req, res) => {

    // console.log(req.body.username, req.body.password);

    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
    });

    newUser.save((err) => {
        if (!err) {
            res.render(`secrets`);
        } else {
            console.log(err);
        }
    });
});

// login
app.post(`/login`, (req, res) => {
    const userName = req.body.username;
    const password = md5(req.body.password);

    // checks whether the given credentials exist or not
    // if yes then log `user exist`
    // else log `user does not exist`
    User.findOne({ email: userName}, (err, founduser) => {
        if (founduser) {
            if(founduser.password == password){
                // console.log(`user exist`, founduser);
                res.render(`secrets`);
            }
        } else {
            // console.log(`user does not exist`, err);
            console.log(err);
        }
    });

})

app.listen(3000, function () {
    console.log(`server is up`);
})
