var express = require('express')
var router = express.Router()
var fs = require('fs')

// Mark Ballot
router.get('/', function (req, res) {
    var message = req.query.message
    // Read candidates from JSON.
    var filepath = './data/contest/candidates.json'
    var candidates = fs.readFileSync(filepath, 'utf8')
    // TODO catch/report file read errors
    res.render('mark-ballot', {
        message: message,
        candidates, candidates
    })
})

module.exports = router
