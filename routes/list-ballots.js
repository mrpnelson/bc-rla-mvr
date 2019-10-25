var express = require('express')
var router = express.Router()
var querystring = require("querystring")

// List Ballots
router.get('/', function (req, res) {
    var message = req.query.message
        res.render('list-ballots', {
            message: message,
            ballot_count: 6
    })
})

module.exports = router
