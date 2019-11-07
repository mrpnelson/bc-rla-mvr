var express = require('express')
var router = express.Router()
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
    var fs = require('fs')
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
            // TODO halt if not files.file_to_upload.type: 'application/json',
            var oldpath = files.file_to_upload.path
            var newpath = './data/uploads/' + files.file_to_upload.name
            // console.log('oldpath', oldpath)
            // console.log('newpath', newpath)
            fs.copyFile(oldpath, newpath, function (err) {
                if (err) throw err
                console.log('File uploaded and copy!')
                var message = req.body.message
                res.render('preview-contest', {
                    message: message
                })
            })
        }
    })
})

// Contest Confirmed
router.post('/confirmed', function (req, res) {
    var message = req.body.message
    res.render('contest-confirmed', {
        message: message
    })
})

module.exports = router
