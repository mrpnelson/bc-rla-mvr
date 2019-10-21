var express = require('express')
var router = express.Router()
var querystring = require("querystring")

// Export Contest
router.get('/', function (req, res) {
    var message = req.query.message
    res.render('export-contest', {
        message: message
    })
})

module.exports = router
