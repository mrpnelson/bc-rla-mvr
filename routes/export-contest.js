var express = require('express')
var router = express.Router()
var fs = require('fs')

// Export Contest
router.get('/', function (req, res) {
    var message = req.query.message
    var data = {}
    // Create 'contests' object and populate
    var contests = []

    var filepath = './data/contest/contest.json'
    //{"Description":"TEAM MASCOT","Id":333}
    var contest = fs.readFileSync(filepath, 'utf8')
    var contest_json = JSON.parse(contest)
    var contest_desc = contest_json.Description
    var contest_id = contest_json.Id

    var contest = {}
    contest.Description = contest_desc
    contest.Id = contest_id

    contests.push(contest)
    data.contests = contests

    // Create 'candidates' object and populate
    var candidates = ['candidates array']
    data.candidates = candidates

    // Create 'ballots' object and populate
    var ballots = ['ballots array']
    data.ballots = ballots

    res.render('export-contest', {
        message: message,
        json_content: data
    })
})

module.exports = router
