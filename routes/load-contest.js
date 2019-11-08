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
        console.log('files', files)
        // If not a JSON file go back via message
        if (files.file_to_upload.type !== 'application/json') {
            var message = 'Please upload a JSON file (.json)'
            res.render('load-contest', {
                message: message
            })
        } else {
            // Halt if not files.file_to_upload.type: 'application/json',
            var oldpath = files.file_to_upload.path
            var newpath = './data/uploads/' + files.file_to_upload.name
            // console.log('oldpath', oldpath)
            // console.log('newpath', newpath)
            fs.copyFile(oldpath, newpath, function (err) {
                if (err) throw err
                // Validate the uploaded JSON file
                var response = validate_upload(newpath)
                var status = response.status
                var message = response.message
                console.log('status:', status)
                if (status === false) {
                    //var message = 'The selected file is not in the correct JSON format. Please fix or upload another JSON file.'
                    res.render('load-contest', {
                        message: message
                    })
                } else {
                    var message = req.body.message
                    res.render('preview-contest', {
                        message: message
                    })    
                }
            })
        }
    })
})

function validate_upload(filepath) {
    //filepathconsole.log('filepath', filepath)
    var contents = fs.readFileSync(filepath, 'utf8');
    //console.log('contents', contents)
    var json = JSON.parse(contents);

    var response = {}
    response.status = true
    response.message = ''

    console.log('json', json)

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

//if (item instanceof JSONArray)

    return response
}

// Contest Confirmed
router.post('/confirmed', function (req, res) {
    var message = req.body.message
    res.render('contest-confirmed', {
        message: message
    })
})

module.exports = router
