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
        // If not a JSON file go back via message
        if (files.file_to_upload.type !== 'application/json') {
            var message = 'Please upload a JSON file (.json)'
            res.render('load-contest', {
                message: message
            })
        } else {
            var upload_name = files.file_to_upload.name
            var old_path = files.file_to_upload.path
            var new_path = './data/uploads/' + upload_name
            fs.copyFile(old_path, new_path, function (err) {
                if (err) throw err
                // Validate the uploaded JSON file
                var response = validate_upload(new_path)
                var status = response.status
                var message = response.message
                var json = response.json
                if (status === false) {
                    res.render('load-contest', {
                        message: message
                    })
                } else {
                    res.render('preview-contest', {
                        upload_name: upload_name,
                        upload_json: json
                    })    
                }
            })
        }
    })
})
// Contest Confirmed
router.post('/confirmed', function (req, res) {
    var upload_name = req.body.upload_name
    var upload_file = './data/uploads/' + upload_name
    var response = validate_upload(upload_file)
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

        // TODO: Read ballot ID list from CSV file and save as JSON file
        //arrayBallots.push('Save as JSON file')
        //var ballot_id_list = {}
        arrayBallots = []
        arrayBallotDetails = []
        for (i=1; i <=8 ; i++){
            let imprinted_id = "99808-81-"+i
            let obj = {
                imprinted_id:imprinted_id,
                cart:"ABC",
                tray:"XYZ"
            }
            arrayBallots.push(imprinted_id)
            arrayBallotDetails.push(obj)
        }
        jsonBallots = JSON.stringify(arrayBallots)
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
            upload_name: upload_name,
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

function validate_upload(filepath) {
    //filepathconsole.log('filepath', filepath)
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

function getRawDate() {
    var date = new Date()
    var moment = require('moment')
    var dt = moment.tz(date, 'America/Los_Angeles')
    dt = dt.format('YYYYMMDDHHmmss')
    return dt
}
