var express = require('express');
const bodyParser = require('body-parser');
var passport = require('passport');
var authenticate = require('../authenticate');
const mongoose = require('mongoose');
const cors = require('./cors');

var User = require('../models/user');

const userRouter = express.Router();

userRouter.use(bodyParser.json());

/* GET users listing. */
userRouter.route('/')
  .get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.find({})
      .then((user) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user);
      }, (err) => next(err))
      .catch((err) => next(err));
  });

userRouter.route('/signup')
  .post(cors.corsWithOptions, (req, res, next) => {
    User.register(new User({ username: req.body.username }),
      req.body.password, (err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({ err: err });
        }
        else {
          if (req.body.firstname)
            user.firstname = req.body.firstname;
          if (req.body.lastname)
            user.lastname = req.body.lastname;
          user.save((err, user) => {
            if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.json({ err: err });
              return;
            }
            passport.authenticate('local')(req, res, () => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({ success: true, status: 'Registration Successful!' });
            });
          });
        }
      });
  });

userRouter.route('/login')
  .post(cors.corsWithOptions, passport.authenticate('local'), (req, res) => {

    var token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, token: token, status: 'You are successfully logged in!' });
  });

userRouter.route('/logout')
  .get(cors.corsWithOptions, (req, res) => {
    if (req.session) {
      req.session.destroy();
      res.clearCookie('session');
      res.redirect('/');
    }
    else {
      var err = new Error('You are not logged in!');
      err.statusCode = 403;
      next(err);
    }
  });

module.exports = userRouter;
