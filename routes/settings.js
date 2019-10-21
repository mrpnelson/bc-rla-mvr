var express = require('express')
var router = express.Router()
var querystring = require("querystring")

// Settings
router.get('/', function (req, res) {
    var message = req.query.message
    res.render('settings', {
        message: message
    })
})

module.exports = router
