function discard_all_ballots() {
    let message_body = document.createElement('div')
    $(message_body).addClass('alert alert-danger')
    let message_details = document.createElement('div')
    $('<h2>').text('Are you sure you want to discard all ballots?').appendTo(message_details)
    $('<div>')
        .appendTo(message_details)
    $(message_details).appendTo(message_body)
    bootbox.confirm({
        size: 'large',
        message: message_body,
        buttons: {
            confirm: {
                label: ' Discard all ballots',
                className: 'btn btn-danger fa fa-trash'
            },
            cancel: {
                label: 'Cancel'
            }
        },
        callback: function (result) {
            if (result) {
                $("#discard-all-ballots").submit()
            } else {
                //alert('go back')
            }
        }
    })
}
