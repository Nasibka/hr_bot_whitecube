// const dev = process.env.NODE_ENV == "dev";
const dev = 'dev'

const winston = require('winston');
const mongoose = require('mongoose');
const config = require('../config/default');
let db = config.dev.db

module.exports = function() {
    if (dev) {
        db = config.dev.db;
    } else {
        db = config.prod.db;
    }
    mongoose.connect(db, { useNewUrlParser: true , useUnifiedTopology: true})
        .then(() => console.log(`Connected to ${db}...`));

    // mongoose.connection.on('open', function (ref) {
    //     mongoose.connection.db.listCollections().toArray(function (err, names) {
    //         console.log(names); 
    //     });
    // })
 
}
