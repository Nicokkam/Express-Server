var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
const authenticate = require('../authenticate');

const cors = require('./cors');
const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
  .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => { res.sendStatus(200); })
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate('user')
      .populate('dishes')
      .then((favorites) => {
        var userFavorites;
        if (favorites) {
          userFavorites = favorites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
          if (!userFavorites) {
            var err = new Error('You have no favorites!');
            err.status = 404;
            return next(err);
          }
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(userFavorites);
        } else {
          var err = new Error('There are no favorites');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate('user')
      .populate('dishes')
      .then((favorites) => {
        var user;
        if (favorites.lenght > 0) {
          user = favorites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
        }
        if (!user) {
          favorites = new Favorites({
            'user': req.user._id,
            'dishes': req.body
          });
        }
        else {
          req.body.forEach((dish, i) => {
            if (dish in favorites.dishes === false)
              favorites.dishes.push(dish)
          })
        }
        favorites.save()
          .then((favorites) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorites);
          }), (err) => next(err)
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate('user')
      .populate('dishes')
      .then((favorites) => {
        var favToRemove;
        if (favorites) {
          favToRemove = favorites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
        }

        //TODO Another way to do the same, but doesnt return the empty favorites
        // Favorites.findByIdAndRemove(favToRemove._id)
        //   .then((resp) => {
        //     res.statusCode = 200;
        //     res.setHeader('Content-Type', 'application/json');
        //     res.json(favorites);
        //   }, (err) => next(err))
        //   .catch((err) => next(err));

        if (favToRemove) {
          favToRemove.remove()
            .then((favorites) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorites);
            }), (err) => next(err)
        }
        else {
          var err = new Error('You have no favorites!');
          err.status = 404;
          return next(err);
        }

        //TODO Somehow use this to return the empty favorites
        // favorites.save()
        //   .then((favorites) => {
        //     res.statusCode = 200;
        //     res.setHeader("Content-Type", "application/json");
        //     res.json(favorites);
        // }), (err) => next(err)

      }, (err) => next(err))
      .catch((err) => next(err));
  });

favoriteRouter.route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/:dishId');
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({})
      .populate('user')
      .populate('dishes')
      .then((favorites) => {
        var user;
        if (favorites.lenght > 0) {
          user = favorites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];

          favorites.save()
            .then((favorites) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorites);
            }), (err) => next(err)
        }

        if (req.params.dishId in favorites.dishes.id === false) {
          favorites.dishes.push(dish)
        }
        else {
          var err = new Error(`Dish ${req.params.dishId} already in favorites`);
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.dishId}`);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findByIdAndRemove(req.params.dishId)
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, (err) => next(err))
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;