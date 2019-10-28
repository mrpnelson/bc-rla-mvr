var express = require('express')
var router = express.Router()
var querystring = require("querystring")

// List Ballots
router.get('/', function (req, res) {
    var message = req.query.message
    var data = {}

    // data.table = []
    // for (i=0; i <26 ; i++){
    //     var obj = {
    //         id: i,
    //         square: i * i
    //     }
    //     data.table.push(obj)
    // }
    //console.log('data', data)
    data.ballot_files = []

    var fs = require('fs')
    fs.readdir('./data', (err, files) => {
        //console.log('files', files)
        files.forEach(file => {
            console.log(file)
            var ext = file.substr(file.lastIndexOf('.') + 1)
            if (ext === 'json') {
                console.log(file)
                var file_obj = fs.readFileSync('./data/'+file, 'utf8')
                //var file_obj = JSON.parse(fs.readFileSync('./data/'+file, 'utf8'))
                console.log(file_obj)
                var obj = {
                    ballot_filename: file,
                    contents: file_obj
                }
                data.ballot_files.push(obj)
            }
        })
        res.render('list-ballots', {
            message: message,
            ballot_count: 6,
            json_content: data
            //json_content: JSON.stringify(data)
        })
    })
})

module.exports = router
