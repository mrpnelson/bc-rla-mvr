// See also https://expressjs.com/en/guide/routing.html
var express = require('express')
var router = express.Router()
var fs = require('fs')

var querystring = require('querystring')

router.post('/submit-ballot/', function (req, res) {
    //console.log("submit-ballot req.body", req.body)

    // Write ballot to JSON
    var ballot_string_calc = req.body.ballot_string_calc

    // Write ballot and history to JSON
    let filepath='data/ballots/'
    let historypath='data/ballots_history/'
    var filenameprefix=getRawDate();
    let filename = filenameprefix + '.json'
    let filedata = ballot_string_calc
    write_data_to_disk(filepath, historypath, filename, filedata)

    // Append ballot id to list of marked ballots
    var ballot_id = req.body.imprinted_id
    var ballots_marked = fs.readFileSync('data/contest/ballots_marked.json', 'utf8')
    var ballots_marked_json = JSON.parse(ballots_marked)
    var ballots_marked_array = []
    for(let ballot_json of ballots_marked_json) {
        ballots_marked_array.push(ballot_json)
    }
    ballots_marked_array.push(ballot_id)
    var ballots_back_to_json = JSON.stringify(ballots_marked_array)

    fs.writeFile ("data/contest/ballots_marked.json", ballots_back_to_json, function(err) {
        if (err) throw err
    })

    res.redirect(307, '/ballots/ballot-success/') // 307 Temporary Redirect preserves form data
})
router.post('/ballot-success/', function (req, res) {
    var ballot_id = req.body.imprinted_id
    var ballot_string = req.body.ballot_string
    var ballot_string_calc = req.body.ballot_string_calc
    //console.log("ballot-success req.body", req.body)

    // Read candidates from JSON.
    var filepath = './data/contest/candidates.json'
    var candidates = fs.readFileSync(filepath, 'utf8')
    // TODO catch/report file read errors
    res.render('ballot-success', {
        ballot_id: ballot_id,
        ballot_string: ballot_string,
        ballot_string_calc: ballot_string_calc,
        candidates: candidates
    })
})
router.post('/discard-all-ballots/', function (req, res) {
    //console.log('discard-all-ballots')
    var fs = require('fs')
    fs.readdir('./data/ballots/', (err, files) => {
        //console.log('files', files)
        files.forEach(file => {
            //console.log(file)
            var ext = file.substr(file.lastIndexOf('.') + 1)
            if (ext === 'json') {
                //console.log(file)
                fs.unlinkSync('./data/ballots/'+file);
            }
        })
        // Clear the list of ballots entered.
        fs.writeFileSync ("data/contest/ballots_marked.json", JSON.stringify([]))
        var message = querystring.escape('Success discarding all ballots.')
        //console.log('message:', message)
        res.redirect(303, '/settings/?message=' + message)
    })
})

router.post('/generate-random-ballots/', function (req, res) {
    var fs = require('fs')

    // Read contest details
    var filepath = './data/contest/contests.json'
    var contest = fs.readFileSync(filepath, 'utf8')
    var contest_json = JSON.parse(contest)
    var contest_desc = contest_json.description
    var contest_id = contest_json.id
    var contest_details = contest_desc + ' (id: ' + contest_id + ")"

    // Read candidate list
    var filepath = './data/contest/candidates.json'
    var candidate_list = fs.readFileSync(filepath, 'utf8')

    // Read ballots list
    var filepath = './data/contest/ballots.json'
    var ballot_ids_list_string = fs.readFileSync(filepath, 'utf8')
    console.log('ballot_ids_list_string:', ballot_ids_list_string)
    var ballot_ids_list = JSON.parse(ballot_ids_list_string)
    console.log('ballot_ids_list:', ballot_ids_list)


    var export_data = {}

    // Create 'contests' object and populate
    var contests = []
    var contest_obj = {}
    contest_obj.description = contest_json.description
    contest_obj.id = contest_json.id
    contests.push(contest_obj)
    export_data.contests = contests

    // Create 'candidates' object and populate
    var candidates = []
    var candidate_list_obj = JSON.parse(candidate_list)
    var num_candidates = candidate_list_obj.length
    num_candidates-- // exclude write-in
    console.log('num_candidates:', num_candidates)
    for (let candidate of candidate_list_obj) {
        var candidates_obj = {}
        candidates_obj.description = candidate.description
        candidates_obj.id = candidate.id
        candidates.push(candidates_obj)
    }
    export_data.candidates = candidates

    // Read and loop ballot list

    // Create 'ballots' object and populate
    var ballots = []

    for (let ballot_index in ballot_ids_list) {
        let ballot_id = ballot_ids_list[ballot_index]
        console.log('ballot_id:', ballot_id)

        // Get random candidate
        let random_index = Math.floor(Math.random() * num_candidates); 
        let random_candidate = candidate_list_obj[random_index]
        let random_candidate_id = random_candidate.id
        console.log('random_candidate_id:', random_candidate_id)

        //var marks = {"15":2,"16":3,"17":1}
        var can_quote = '"'+random_candidate_id+'"'
        var marks_string = '{"'+random_candidate_id+'": 1}'
        console.log('marks_string:', marks_string)
        var marks = JSON.parse(marks_string)
        console.log('marks:', marks)
        //var marks[can_quote] = 1
        //var marks[random_candidate_id] = 1

        var votes = {"339": marks}// replace hard-coded contest id
        var ballot_contents_json = {"id":ballot_id, "votes":votes}
        console.log('ballot_contents_json:', ballot_contents_json)
        ballots.push(ballot_contents_json)
    }


    export_data.ballots = ballots


    // Write results to disk.
        var export_filename = 'mvr_random.json'
        console.log("export_data",export_data)
        console.log("export_data_string",JSON.stringify(export_data))
        var export_data_string = JSON.stringify(export_data)
        fs.writeFile ("public/output/"+export_filename, export_data_string, function(err) {
            if (err) throw err
            // Create duplicate in data/contest_history/timestamp/
            var rawdate = getRawDate();
            var datedir = "data/contest_history/"+rawdate
            if (!fs.existsSync(datedir)){
                fs.mkdirSync(datedir);
            }
            fs.writeFile (datedir+ "/"+export_filename, export_data_string, function(err) {
                if (err) throw err
                // Show results and link to download
                var message = 'Success.'
                res.render('settings', {
                    mvr_random: export_filename,
                    message: message
                })
            })
        })

        

        // })
})
module.exports = router

function write_data_to_disk(filepath, historypath, filename, filedata) {
    fs.writeFile (filepath+filename, filedata, function(err) {
        if (err) throw err
        // Write backup file to logs
        fs.writeFile (historypath+filename, filedata, function(err) {
            if (err) throw err
        })
    })
}
function getRawDate() {
    var date = new Date()
    var moment = require('moment')
    var dt = moment.tz(date, 'America/Los_Angeles')
    dt = dt.format('YYYYMMDDHHmmss')
    return dt
}
