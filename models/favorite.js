const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish'
        }
    ]
}, {
    timestamps: true
});

var Favorites = mongoose.model('Favorite', favoriteSchema);
favoriteSchema.plugin(passportLocalMongoose);

module.exports = Favorites;