var express = require('express')
var router = express.Router()
var querystring = require("querystring")
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

    // var ballots_array = []
    // for(let ballot_json of ballots_json) {
    //     ballots_array.push(ballot_json)
    // }

    // data.manual_cvr = []
    // var fs = require('fs')
    // fs.readdir('./data', (err, files) => {
    //     //console.log('files', files)
    //     data.ballot_count = files.length

    //     files.forEach(file => {
    //         //console.log(file)
    //         var ext = file.substr(file.lastIndexOf('.') + 1)
    //         if (ext === 'json') {
    //             //console.log(file)
    //             var file_obj = fs.readFileSync('./data/'+file, 'utf8')
    //             //var file_obj = JSON.parse(fs.readFileSync('./data/'+file, 'utf8'))
    //             //console.log(file_obj)
    //             data.manual_cvr.push(JSON.parse(file_obj))
    //             //data.manual_cvr.push(file_obj)
    //         }
    //     })
        res.render('export-contest', {
            message: message,
            json_content: data
        })
    //})

})

module.exports = router
