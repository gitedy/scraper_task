var express = require('express');

var app = express();
const bodyParser = require('body-parser');

var mongoose = require('mongoose');

var _ = require('lodash');
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var ObjectId = mongoose.Types.ObjectId;

var gplay = require('google-play-scraper');

app.use(express.static('public'));

var async = require('async')
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true }, function(error) {
    // Check error in initial connection. There is no 2nd param to the callback.
});


const { Schema } = mongoose;
const Product = mongoose.model('product', new Schema({
    _id: String,
    title: String,
    appId: String,
    url: String,
    icon: String,
    developer: String,
    developerId: String,
    priceText: String,
    currency: String,
    price: Number,
    free: Boolean,
    summary: String,
    scoreText: String,
    score: Number
}, { "_id": false }));



app.post('/scrape', function(req, res, next) {

    gplay.list({
            collection: gplay.collection.TOP_FREE,
            num: 50
        })
        .then(function(data) {

            var _data = _.map(data, function(item) {
                item._id = item.appId
                return item;
            })
            async.series(
                [

                    function(callback) {
                        var bulk = Product.collection.initializeOrderedBulkOp();
                        _data.forEach(function(item) {
                            bulk.find({ "_id": item.appId }).upsert().updateOne({
                                "$setOnInsert": item
                            });
                        });
                        bulk.execute(callback);
                    },

                    // All as expected
                    function(callback) {
                        Product.find().exec(function(err, docs) {
                            console.log(docs)
                            callback(err);
                        });
                    },


                    // Start again
                    function(callback) {
                        Product.remove({}, callback);
                    },

                    // Unordered will just continue on error and record an error
                    function(callback) {
                        var bulk = Product.collection.initializeUnorderedBulkOp();
                        _data.forEach(function(item) {
                            bulk.insert(item);
                        });
                        bulk.execute(function(err, result) {
                            callback(); // so what! Could not care about errors
                        });
                    },


                    // Still processed the whole batch
                    function(callback) {
                        Product.find().exec(function(err, docs) {
                            console.log(docs)
                            callback(err);
                        });
                    }
                ],
                function(err) {
                    if (err) throw err;
                    mongoose.disconnect();
                }
            );



        });
});

app.get('/getProducts', function(req, res, next) {

    Product.find({}, function(err, products) {

        res.status(200).send({ data: products });

    })
});
app.post('/getDetails', function(req, res, next) {
    console.log(req.body)
    Product.find({ _id: req.body.id }, function(err, products) {
        console.log(err, products)
        res.status(200).send({ data: products[0] });
    })
});

app.listen(3000, function() {
    console.log("App is running on", 3000);
})