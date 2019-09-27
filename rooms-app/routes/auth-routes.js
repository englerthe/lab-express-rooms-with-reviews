const express = require('express');
const router  = express.Router();
const User = require("../models/user-model");
const Room = require("../models/room-model");

const bcrypt = require("bcryptjs");
const bcryptSalt = 10;

router.get("/main", (req, res, next) => {
  Room.find()
  .then(listofRooms => {
    console.log(listofRooms);
    res.render("auth/main", {listofRooms});
  })
  .catch(error => {
    next(error);
  })
});

router.get("/signup", (req, res, next) => {
    res.render("auth/signup");
});

router.post("/signup", (req, res, next) => {
    const fullname = req.body.fullname;
    const email = req.body.email;
    const password = req.body.password;
    const salt = bcrypt.genSaltSync(bcryptSalt); //begin to crypt
    const hashPass = bcrypt.hashSync(password, salt);
    
    if (fullname === "" || password === "" || email === "") { //check if post values are not empty
      res.render("auth/signup", { // create signup error message in signup page
        errorMessage: "Enter a fullname and password to sign in." 
      });
      return;
    }
    User.findOne({ "fullname": fullname }) // check if username exists
      .then(user => {
        if (user !== null) {
          res.render("auth/signup", { // create signup error message in signup page
            errorMessage: "The fullname "+fullname+" already exists!"
          });
          return;
        } 
        const salt = bcrypt.genSaltSync(bcryptSalt); //create user / pw in database
        const hashPass = bcrypt.hashSync(password, salt);
        User.create({
          fullname: fullname,
          email: email,
          password: hashPass
        })
          .then(() => {
            res.redirect("/");
          })
          .catch(error => {
            console.log(error);
          })
      })
      .catch(error => {
        next(error);
      })
  });

router.get("/login", (req, res, next) => {
    res.render("auth/login");
});

router.post("/login", (req, res, next) => {
    const getUser = req.body.fullname;
    const getPass = req.body.password;
  console.log(getUser, getPass);
    if (getUser === "" || getPass === "") { //check if post values are not empty
      res.render("auth/login", { // create login error message in login page
        errorMessage: "Login only possible with full name and password"
      });
      return;
    }
  
    User.findOne({ "fullname": getUser }) // check if username exists
    .then(user => {
        if (!user) { // if user does not exist
          res.render("auth/login", { // create login error message in login page
            errorMessage: "The full name doesn't exist." 
          });
          return;
        }
        if (bcrypt.compareSync(getPass, user.password)) { // if user exists, compare pw
          req.session.currentUser = user; // save session
          res.redirect("/"); // if pw ok, then goto startpage
        } else { // if pw doesnt match
          res.render("auth/login", { // create error message in login page
            errorMessage: "Incorrect password"
          });
        }
    })
    .catch(error => {
      next(error);
    })
});
  

module.exports = router;
  