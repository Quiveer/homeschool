const express = require('express');
const router = express.Router();
const fs = require('fs');
var path = require("path");
var mongoose = require("mongoose");
var multer = require("multer");
mongoose.Promise = global.Promise;
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const winston = require('winston');

// Logger configuration
const logConfiguration = {
  "transports":[
      new winston.transports.File({
          filename:"./views/index.log"
      })
      ]
};
// create logger
const logger = winston.createLogger(logConfiguration);


var cors = require("cors");
router.use(cors());

const helmet = require("helmet");
router.use(helmet());

require("cookie-parser");

const admins = require("../models/admin");
const users = require("../models/user");

mongoose.set("useCreateIndex", true);

const uri =
  "mongodb+srv://Trav:grutikas@bakery-gnzlr.gcp.mongodb.net/test?retryWrites=true&w=majority";
const client = mongoose.createConnection(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

client
  .once("open", () => {
    logger.info("school database connected!")
    console.log('school database connected');
    
  })
  .catch(err => {
    logger.info(err)
    console.log(err);
    
  });


router.get("/", (req, res) => { res.render("welcome"); });
// register image

  // SET STORAGE
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + '_' + file.originalname)
    }
  });
   
  var upload = multer({ storage: storage });
  
  router.get("/register", (req, res) => { res.render("register"); });
  
  router.post('/register', upload.single('myImage'), function (req, res){ 
      var newItem = new users({
        username: req.body.username,
        email: req.body.email,
        mobile1: req.body.mobile1,
        guardian: req.body.guardian,
        mobile2: req.body.mobile2,
        code: req.body.code,
        filename: req.file.filename
      });
  
      newItem.save(); 
      mongoose
        .connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
        .then(client => {
          res.redirect("register");
          console.log(newItem);
        })
        .catch(err => {
        });
      client.close();
  });

  router.get("/delete/:id", (req, res) => {
    mongoose
      .connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      })
      .then(client => {
        users.findByIdAndRemove({_id: req.params.id}, (err, doc) => {
          if (err) throw err;
          fs.unlink(path.join("public/uploads/", doc.filename), err => {
            if (err) throw err;
            res.redirect("/users");
          });
        });
      })
    client.close();
  });

// register
router.get("/register", (req, res) => { res.render("register"); });
router.post("/register", (req,res) => {
    res.redirect("register");
});
router.get("/admin", (req, res) => { res.render("admin"); });
router.post("/login", (req,res) => {
    res.redirect("users");
});
router.get("/users", (req, res) => {
  mongoose
  .connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(client => {
    users.find()
      .exec((err, docs) => {
        if (err) return next(err);
        res.render("users", {alldocs: docs});
      });
  })
client.close();
});

module.exports = router;