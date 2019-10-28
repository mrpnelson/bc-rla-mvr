var express = require('express')
var router = express.Router()
var querystring = require("querystring")

// Export Contest
router.get('/', function (req, res) {
    var message = req.query.message

    var data = {}

    data.contest_name = "Team Mascot"
    data.contest_id = "987654321"

    // data.table = []
    // for (i=0; i <26 ; i++){
    //     var obj = {
    //         id: i,
    //         square: i * i
    //     }
    //     data.table.push(obj)
    // }
    //console.log('data', data)
    data.manual_cvr = []

    var fs = require('fs')
    fs.readdir('./data', (err, files) => {
        //console.log('files', files)
        data.ballot_count = files.length

        files.forEach(file => {
            //console.log(file)
            var ext = file.substr(file.lastIndexOf('.') + 1)
            if (ext === 'json') {
                //console.log(file)
                var file_obj = fs.readFileSync('./data/'+file, 'utf8')
                //var file_obj = JSON.parse(fs.readFileSync('./data/'+file, 'utf8'))
                //console.log(file_obj)
                data.manual_cvr.push(JSON.parse(file_obj))
                //data.manual_cvr.push(file_obj)
            }
        })
        res.render('export-contest', {
            message: message,
            json_content: data
        })
    })

})

module.exports = router
