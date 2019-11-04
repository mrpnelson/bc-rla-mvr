// See also https://expressjs.com/en/guide/routing.html
var express = require('express')
var router = express.Router()

var querystring = require('querystring')

// middleware that is specific to this router
//router.use(function timeLog (req, res, next) {
// console.log('Time: ', Date.now())
// next()
//})

// Submit
router.post('/submit-ballot/', function (req, res) {
    //console.log('submit-ballot')
    //console.log('write_json_to_disk')
    var ballot_string = req.body.ballot_string_calc
    //console.log('ballot_string',ballot_string)

    var filenameprefix=getRawDate();
    let filename = filenameprefix + '.json'

    write_data_to_disk(ballot_string,filename)

    //var message = querystring.escape('Success. Contents of ballot ' + filename + ' - ' + ballot_string)
    var message = querystring.escape('Success processing ballot.')
    //console.log('message:', message)
    res.redirect(303, '/mark-ballot/?message=' + message)
})

// discard-all-ballots
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
    // var data = {}
    // data.table = []
    // for (i=0; i <26 ; i++){
    // var obj = {
    //     id: i,
    //     square: i * i
    // }
    // data.table.push(obj)
    // }
    //fs.writeFile ("data/"+filename, JSON.stringify(data), function(err) {
    fs.writeFile ("data/"+filename, filedata, function(err) {
        if (err) throw err
        console.log('complete')
        // Write backup file to logs
        fs.writeFile ("logs/"+filename, filedata, function(err) {
            if (err) throw err
            console.log('complete')
        })
    })
}

function getRawDate() {
    var date = new Date()

    var moment = require('moment')
    var tz = require('moment-timezone')

    var dt = moment.tz(date, 'America/Los_Angeles')

    //dt = moment(dt).add(7, 'hours')

    //dt = dt.format('LLLL')
    //dt = dt.format('YYYY-MM-DD HH:mm:ss')
    dt = dt.format('YYYYMMDDHHmmss')

    return dt
}
