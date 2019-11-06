// See also https://expressjs.com/en/guide/routing.html
var express = require('express')
var router = express.Router()

var querystring = require('querystring')

router.post('/submit-ballot/', function (req, res) {
    //console.log("submit-ballot req.body", req.body)
    var ballot_string_calc = req.body.ballot_string_calc
    var filenameprefix=getRawDate();
    let filename = filenameprefix + '.json'
    write_data_to_disk(ballot_string_calc,filename)
    res.redirect(307, '/ballots/ballot-success/') // 307 Temporary Redirect preserves form data
})
router.post('/ballot-success/', function (req, res) {
    var ballot_id = req.body.imprinted_id
    var ballot_string = req.body.ballot_string
    var ballot_string_calc = req.body.ballot_string_calc
    //console.log("ballot-success req.body", req.body)
    res.render('ballot-success', {
        ballot_id: ballot_id,
        ballot_string: ballot_string,
        ballot_string_calc: ballot_string_calc
    })
})
router.post('/discard-all-ballots/', function (req, res) {
    console.log('discard-all-ballots')

    var fs = require('fs')
    fs.readdir('./data', (err, files) => {
        //console.log('files', files)
        files.forEach(file => {
            console.log(file)
            var ext = file.substr(file.lastIndexOf('.') + 1)
            if (ext === 'json') {
                console.log(file)
                var file_obj = fs.readFileSync('./data/'+file, 'utf8')
                console.log(file_obj)

                //fs.unlink('./data/'+file, callback) 
                fs.unlinkSync('./data/'+file);
            }
        })
        var message = querystring.escape('Success discarding all ballots.')
        console.log('message:', message)
        res.redirect(303, '/list-ballots/?message=' + message)    
    })
})
module.exports = router

function write_data_to_disk(filedata, filename) {
    var fs = require('fs');
    fs.writeFile ("data/"+filename, filedata, function(err) {
        if (err) throw err
        // Write backup file to logs
        fs.writeFile ("logs/"+filename, filedata, function(err) {
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
