var express = require('express')
var router = express.Router()
var fs = require('fs')
var querystring = require("querystring")

// Load Contest
router.get('/', function (req, res) {
    var message = req.query.message
    res.render('load-contest', {
        message: message
    })
})

// Preview Contest
router.post('/preview', function (req, res) {
    var formidable = require('formidable')
    var form = new formidable.IncomingForm()
    form.encoding = 'utf-8';
    form.uploadDir = "./data/uploads/raw";
    form.parse(req, function (err, fields, files) {
        //console.log('form fields', fields)
        //console.log('files', files)

        var error_message = ''
        var contestants_upload = files.contestants_upload
        //console.log('contestants_upload:',contestants_upload)
        if (contestants_upload.type !== 'application/json') {
            error_message += ' Please upload contestants in a JSON file (.json).'
        }

        var ballots_upload = files.ballots_upload
        //console.log('ballots_upload:',ballots_upload)

        if (ballots_upload.type !== 'text/csv') {
            error_message += ' Please upload ballot in a CSV file (.csv).'
        }

        // If error message then return to form.
        //console.log('error_message:',error_message)
        if (!error_message == ''){
            var message = error_message
            res.render('load-contest', {
                message: message
            })
        } else {
            // Validate the uploaded contestants JSON file
            var json
            error_message = ''
            var upload_json_name = contestants_upload.name
            var old_path = contestants_upload.path
            var xnew_path = './data/uploads/' + upload_json_name
            //console.log('xnew_path:', xnew_path)
            fs.copyFile(old_path, xnew_path, function (err) {
                if (err) throw err
                var response = validate_upload_json(xnew_path)
                var status = response.status
                var message = response.message
                json = response.json
                if (status === false) {
                    error_message += message
                }

                    // Convert the CSV file to JSON
                error_message = ''
                var upload_csv_name = ballots_upload.name
                var old_path = ballots_upload.path
                var new_path = './data/uploads/' + upload_csv_name

                const csvtojson=require('csvtojson')
                csvtojson()
                .fromFile(old_path)
                .then((csv2jsonObj)=>{
                    //console.log('csv2jsonObj:',csv2jsonObj)
                    var response = validate_upload_csv2jsonObj(csv2jsonObj)
                    var status = response.status
                    var message = response.message
                    var ballots_json = response.ballots_json
                    if (status === false) {
                        error_message += message
                    }
                    if (!error_message == ''){
                        var message = error_message
                        res.render('load-contest', {
                            message: message
                        })
                    } else {
                        res.render('preview-contest', {
                            upload_json_name: upload_json_name,
                            upload_json: json,
                            upload_csv_name: upload_csv_name,
                            upload_csv: csv2jsonObj,
                            ballots_json:ballots_json
                        })    
                    }
                })
            })
        }
    })
})
// Contest Confirmed
router.post('/confirmed', function (req, res) {
    var upload_json_name = req.body.upload_json_name
    var ballots_json = req.body.ballots_json
    //console.log('ballots_json:',ballots_json)
    var ballots_array = ballots_json.split(',');
    //console.log('ballots_array:',ballots_array)
    var upload_file = './data/uploads/' + upload_json_name
    var response = validate_upload_json(upload_file)
    var status = response.status
    var message = response.message
    var json = response.json
    if (status === false) {
        res.render('load-contest', {
            message: message
        })
    } else {
        jsonContest = json.Contest
        jsonCandidates = JSON.stringify(json.Candidates)//convert the Candidates array to a JSON object
        //console.log('jsonCandidates',jsonCandidates)
        jsonBallots = JSON.stringify(ballots_array)

        // Remove ballots
        var folderpath = './data/ballots/'
        clear_folder(folderpath)
        // Remove contest
        var folderpath = './data/contest/'
        // Don't clear the contest folder (unless you wrap in callback). Files in this will will automatically be overwritten
        // Write JSON to contest files
        write_json_file(JSON.stringify(jsonContest), 'contest.json')
        write_json_file(jsonCandidates, 'candidates.json')
        write_json_file(jsonBallots, 'ballots.json')
        write_json_file(JSON.stringify([]), 'ballots_marked.json')
        // Proceed to final 'success' page
        res.render('contest-confirmed', {
            upload_json_name: upload_json_name,
            jsonCandidateList:jsonCandidates,
            jsonContest:jsonContest,
            jsonBallots:jsonBallots
        })
    }
})
module.exports = router

function write_json_file(filedata, filename) {
    fs.writeFile ("data/contest/"+filename, filedata, function(err) {
        if (err) throw err
        // Create duplicate in data/contest_history/timestamp/
        var rawdate = getRawDate();
        var datedir = "data/contest_history/"+rawdate
        if (!fs.existsSync(datedir)){
            fs.mkdirSync(datedir);
        }
        fs.writeFile (datedir+ "/"+filename, filedata, function(err) {
            if (err) throw err
        })
    })
}

function clear_folder(folderpath) {
    fs.readdir(folderpath, (err, files) => {
        //console.log('files', files)
        files.forEach(file => {
            var ext = file.substr(file.lastIndexOf('.') + 1)
            if (ext === 'json') {
                fs.unlinkSync(folderpath+file);
            }
        })
    })
}

function validate_upload_json(filepath) {
    var contents = fs.readFileSync(filepath, 'utf8');
    //console.log('contents', contents)
    var json = JSON.parse(contents);
    //console.log('json', json)

    var response = {}
    response.status = true
    response.message = ''
    response.json = json

    // Check for 'Contest' object
    if(!json.hasOwnProperty('Contest')){
        response.message += ' The selected file is missing the object "Contest". '
        response.status = false
    } 
    // Check contents of 'Contest' object
    else {
        jsonContest = json.Contest
        if(!jsonContest.hasOwnProperty('Description')){
            response.message += ' The selected file is missing the object "Contest.Description". '
            response.status = false
        } 
        if(!jsonContest.hasOwnProperty('Id')){
            response.message += ' The selected file is missing the object "Contest.Id". '
            response.status = false
        } 
    }

    // Check for 'Candidates' object
    if(!json.hasOwnProperty('Candidates')){
        response.message += ' The selected file is missing the object "Candidates". '
        response.status = false
    }
    // Check contents of 'Candidates' object
    else {
        jsonCandidates = json.Candidates
        if (!Array.isArray(jsonCandidates)) {
            response.message += ' The "Candidates" object in the selected file is not an array. '
            response.status = false
        } else {
            for(let jsonCandidate of jsonCandidates) {
                if(!jsonCandidate.hasOwnProperty('Description')){
                    response.message += ' At lease one of the objects in the "Candidates" array of the selected file is missing the object "Description". '
                    response.status = false
                } 
                if(!jsonCandidate.hasOwnProperty('Id')){
                    response.message += ' At lease one of the objects in the "Candidates" array of the selected file is missing the object "Id". '
                    response.status = false
                } 
                if(!jsonCandidate.hasOwnProperty('Type')){
                    response.message += ' At lease one of the objects in the "Candidates" array of the selected file is missing the object "Type". '
                    response.status = false
                } 
            }
        }

    }
    return response
}

function validate_upload_csv2jsonObj(csv2jsonObj) {
    //console.log('validate_upload_csv2jsonObj.csv2jsonObj', csv2jsonObj)

    var status = true

    //var json = JSON.parse(contents);
    //console.log('json', json)
    var ballots_json = []
    //["99808-81-1","99808-81-2","99808-81-4"]

    if (!Array.isArray(csv2jsonObj)) {
        response.message += ' The "csv2jsonObj" object in the converted ballots file is not an array. '
        response.status = false
    } else {
        for(let ballot_obj of csv2jsonObj) {
            //{ 'ballot-id': '99808-81-1', cart: 'A', tray: '1' }
            if(!ballot_obj.hasOwnProperty('BallotId')){
                response.message += ' The selected ballot file is missing the object "BallotId". '
                status = false
            } else {
                let b = ballot_obj.BallotId
                ballots_json.push(b)
            }
        }
    }
    var response = {}
    response.status = status
    response.message = ''
    response.csv = csv2jsonObj
    response.ballots_json = ballots_json

    return response
}

function getRawDate() {
    var date = new Date()
    var moment = require('moment')
    var dt = moment.tz(date, 'America/Los_Angeles')
    dt = dt.format('YYYYMMDDHHmmss')
    return dt
}
