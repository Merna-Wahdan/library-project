const express = require('express')
const mongoose = require('mongoose');

const router = express.Router()

const bcryptjs = require('bcryptjs')

const saltRounds = 10;

const User = require("../models/User.model")

router.get("/signup", (req, res, next) => {
    res.render("auth/signup");
})

 /*
    
    - get data from "req.body"
    - generate salt
    - generate hash
    - prepare an object
    - User.create()
    
    */

router.post("/signup", (req, res, next) => {

const {email, password} = req.body

    // validation: required fields
    if (!email || !password) {
        res.status(400).render('auth/signup', { errorMessage: 'All fields are mandatory. Please provide your username, email and password.' });
        return;
    }

 // validation: pw strength
 const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
 if (!regex.test(password)) {
     res.status(400).render('auth/signup', { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.' });
     return;
 }

bcryptjs.genSalt(saltRounds)
.then( salt => bcryptjs.hash(password, salt))
.then( hash => {
    const newUser = {
        email: email,
        passwordHash: hash
    }

    return User.create(newUser);
})
.then( userFromDB => {
    //account created succcessfully
    res.redirect("/login")
})
.catch( error => {
    console.log("error creating user account... ", error);
    if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).render('auth/signup', { errorMessage: error.message });
    } else if (error.code === 11000) {
        res.status(400).render('auth/signup', { errorMessage: "Validation error. Email needs to be unique" });
    }     else {
        console.log("it failed but not a mongoose error....")
        next(error);
    }
})

})


//GET /login
router.get("/login", (req, res, next) => {
    res.render("auth/login");
});

//POST /login
router.post('/login', (req, res, next) => {
    const { email, password } = req.body;

    if (email === '' || password === '') {
        res.status(400).render('auth/login', { errorMessage: 'Please enter both, email and password to login.' });
        return;
    }

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                //user doesn't exist (no user with this email address)
                res.status(400).render('auth/login', { errorMessage: 'Email is not registered. Try with other email.' });
                return;
            } else if (bcryptjs.compareSync(password, user.passwordHash)) {
                //login successful
                req.session.userDetails = user; // anytime we recieve a request we read it from here

                res.redirect("/user-profile");
                        } else {
                //login failed
                res.status(400).render('auth/login', { errorMessage: 'Incorrect password.' });
            }
        })
        .catch(error => {
            console.log("error trying to login...", error);
            next(error);
        });
});

// POST // logout
router.post('/logout', (req, res, next) => {
    req.session.destroy(err => {
      if (err) next(err);
      res.redirect('/');
    });
  });


router.get("/user-profile", (req, res, next) => {
    const data = {
        userDetails: req.session.userDetails 
    }

    res.render('auth/user-profile', data)
})



module.exports = router;


