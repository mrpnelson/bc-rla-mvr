var express = require('express')
var router = express.Router()
var querystring = require("querystring")

// Mark Ballot
router.get('/', function (req, res) {
    var message = req.query.message
    res.render('mark-ballot', {
        message: message
    })
})

module.exports = router
