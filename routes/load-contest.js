var express = require('express')
var router = express.Router()
var querystring = require("querystring")

// Load Contest
router.get('/', function (req, res) {
    var message = req.query.message
    res.render('load-contest', {
        message: message
    })
})

// Preview Contest
router.post('/preview', function (req, res) {
    var message = req.body.message
    res.render('preview-contest', {
        message: message
    })
})

// Contest Confirmed
router.post('/confirmed', function (req, res) {
    var message = req.body.message
    res.render('contest-confirmed', {
        message: message
    })
})

module.exports = router
