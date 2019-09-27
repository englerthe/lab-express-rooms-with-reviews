const express = require("express");
const router = express.Router();
const Room = require("../models/room-model");

router.get("/", (req, res, next) => {
  res.render("index");
});

router.use((req, res, next) => {
  if (req.session.currentUser) { // <== if there's user in the session (user is logged in)
    next(); // ==> go to the next route ---
  } else {                          //    |
    res.redirect("/login");         //    |
  }                                 //    |
}); // ------------------------------------                                
//     | 
//     V
router.get("/rooms", (req, res, next) => {
  res.render("restricted/rooms");
});

router.post("/rooms/add", (req, res, next) => {
  const name = req.body.name;
  const description = req.body.description;
  const imageUrl = req.body.imageUrl;
  const owner = req.session.currentUser._id;
  
  if (name === "") { //check if post values are not empty
    res.render("restricted/rooms", { // create signup error message in signup page
      Message: "Enter all necessary data."
    });
    return;
  }
  Room.findOne({ "name": name }) // check if room exists
    .then(thisRoom => {
      if (thisRoom !== null) {
        res.render("restricted/rooms", { // create signup error message in signup page
          Message: "The room " + name + " already exists!"
        });
        return;
      }
      Room.create({
        name: name,
        description: description,
        imageUrl: imageUrl,
        owner: owner
      })
        .then(() => {
          res.render("restricted/rooms", { Message: "The room " + name + " has been created successfully!" });
        })
        .catch(error => {
          console.log("Create room failed: " + error);
        })
    })
    .catch(error => {
      next(error);
    })
});

router.post("/rooms/edit", (req, res, next) => {
  const name = req.body.name;
  const description = req.body.description;
  const imageUrl = req.body.imageUrl;

  if (name === "") { //check if post values are not empty
    res.render("restricted/rooms", {
      Message: "Enter all necessary data."
    });
    return;
  }
  Room.findOne({ name: name })
    .then(thisRoom => {
      //console.log(req.session.currentUser._id, thisRoom.owner);
      if (req.session.currentUser._id == thisRoom.owner) {
      Room.update({ _id: thisRoom._id }, { $set: { name, description, imageUrl } })
        .then(() => {
          res.render("restricted/rooms", { Message: "The room " + name + " has been edited successfully!" })
        })
        .catch(error => {
          next(error);
        })
      } else {
        res.render("restricted/rooms", { Message: "The room " + name + " has not been edited!" })
      }  // end if
    })
    .catch(error => {
      next(error);
    })
  });

  router.post("/rooms/delete", (req, res, next) => {
    const name = req.body.name;
  
    if (name === "") { //check if post values are not empty
      res.render("restricted/rooms", {
        Message: "Enter all necessary data."
      });
      return;
    }
    Room.findOne({ name: name })
      .then(thisRoom => {
        //console.log(req.session.currentUser._id, thisRoom.owner);
        if (req.session.currentUser._id == thisRoom.owner) {
        Room.findByIdAndDelete(thisRoom._id)
          .then(() => {
            res.render("restricted/rooms", { Message: "The room " + name + " has been deleted successfully!" })
          })
          .catch(error => {
            next(error);
          })
        } else {
          res.render("restricted/rooms", { Message: "The room " + name + " has not been deleted!" })
        }  // end if
      })
      .catch(error => {
        next(error);
      })
  });

  module.exports = router;