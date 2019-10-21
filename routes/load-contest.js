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

module.exports = router
