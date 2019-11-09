var num_candidates
// ===========================================================
// Page setup functions
// ===========================================================
function populate_ballot_checkboxes(candidates) {
    //console.log('candidates', candidates)
    num_candidates = candidates.length
    add_header_to_ballot(num_candidates)
    var candidate_num = 0
    var candidate_nam = ""
    var candidate_id = 0
    for(let candidate of candidates) {
        //console.log(candidate)
        candidate_num++
        var candidate_nam = candidate.Description
        var candidate_id = candidate.Id
        if (candidate.Image)
            var candidate_img = '/img/candidates/' + candidate.Image
        else
            var candidate_img = '/img/candidates/generic.png'
        add_candidate_to_ballot(num_candidates, candidate_num, candidate_nam, candidate_id, candidate_img)
    }
    
    // var candidate_num = 3
    // var candidate_nam = "Write-in"
    // var candidate_id = 45
    // var candidate_img = "/img/candidates/generic.png"
    // add_candidate_to_ballot(num_candidates, candidate_num, candidate_nam, candidate_id, candidate_img)

}
function add_header_to_ballot(number_of_candidates) {

    let ballot_row = document.createElement('div')
    $(ballot_row).addClass('row')
        .appendTo($("#ballot-container"))
    let spacer = document.createElement('div')
    $(spacer).addClass('col-xs-2')
        .html("&nbsp;")
        .appendTo(ballot_row)
    for (var i = 1; i <= number_of_candidates; i++) {
        let ballot_header = document.createElement('div')
        let ordinal = get_ordinal_suffix_of_integer(i)
        $(ballot_header).addClass('col-xs-1').addClass('text-bold')
            .html(ordinal + " Choice")
            .appendTo(ballot_row)
    }
}
function add_candidate_to_ballot(number_of_candidates, candidate_number, candidate_name, candidate_identifier, candidate_image) {

    let d = document.createElement('div')
    $(d).addClass('row')
        .appendTo($("#ballot-container"))

    let candidate = document.createElement('div')
    $(candidate).addClass('col-xs-2')
        .html("<div class='xsmall_image_container'><span class=' xsmall_image_border'><img class='img-circle' src='"+candidate_image+"' width='40'></span><span class='text-bold'>"+candidate_name+"</span></div>")
        .appendTo(d)
    // $(candidate).addClass('col-xs-2')
    //     .html("<div class='xsmall_image_container'><span class=' xsmall_image_border'><img class='img-circle' src='"+candidate_image+"' width='40'></span><span class='text-bold'>"+candidate_name+"</span>&nbsp;(id:<span class='text-bold'>"+candidate_identifier+"</span>)</div>")
    //     .appendTo(d)
    for (var i = 1; i <= number_of_candidates; i++) {
        let ballot_checkbox = document.createElement('div')
        let ballot_id = "rank"+i+"_can" + candidate_number
        $(ballot_checkbox).addClass('col-xs-1')
            .html("<div class='checkbox-oval'><input type='checkbox' id='"+ballot_id+"' data-can_id='"+candidate_identifier+"' /><label for='"+ballot_id+"'>&nbsp;</label></div>")
            .appendTo(d)
        // $(ballot_checkbox).addClass('col-xs-1')
        //     .html("<div class='checkbox-oval'><input type='checkbox' id='"+ballot_id+"' data-can_id='"+candidate_identifier+"' /><label for='"+ballot_id+"'>&nbsp;</label></div>")
        //     .appendTo(d)
    }
}
function populate_ballot_dropdown(ballot_id_list) {
    //console.log('ballot_id_list', ballot_id_list)
    let dropdown = $('#imprinted_id_dropdown')
    dropdown.empty()
    dropdown.append('<option selected="true" disabled>Choose Imprinted ID</option>')
    dropdown.prop('selectedIndex', 0)

    for(let ballot_id of ballot_id_list) {
        dropdown.append($('<option></option>').attr('value', ballot_id).text(ballot_id))
    }
}

function layout_ballot() {
    $("#reviewer-2").addClass("hidden")
    $("#verified-button").addClass("hidden")
    $("#edit-button").addClass("hidden")
    $("#no-consensus-button").addClass("hidden")
}

// ===========================================================
// UI/UX Workflow Functions
// ===========================================================
function submit_for_verification() {
    // Make sure ballot id is within the set
    var selected_value = $('#imprinted_id').val()
    //console.log('selected_value', selected_value)
    let is_ballot_id_valid = validate_imprinted_id(selected_value)
    //console.log('is_ballot_id_valid', is_ballot_id_valid)

    if (is_ballot_id_valid) {
        prepare_ballot_for_review()
    } else {
        $('#invalidBallotModal').modal('show')
    }
}
function submit_for_verification_with_confirmation() {
    // Make sure ballot id is within the set
    var selected_value = $('#imprinted_id').val()
    //console.log('selected_value', selected_value)
    let is_ballot_id_valid = validate_imprinted_id(selected_value)
    //console.log('is_ballot_id_valid', is_ballot_id_valid)

    if (is_ballot_id_valid) {
        let message_body = document.createElement('div')
        $(message_body).addClass('alert alert-warning')
        let message_details = document.createElement('div')
        let message_h1 = $('<h1>').text('Reviewer #1 - Confirm Submission').appendTo(message_details)
        var message_div = $('<div>')
            .append('TODO SHOW RANKING RESULTS')
            .appendTo(message_details)
        $(message_details).appendTo(message_body)
        bootbox.confirm({
            size: 'large',
            message: message_body,
            buttons: {
                confirm: {
                    label: 'Confirmed. Submit ballot for verification.',
                    className: 'btn-warning'
                },
                cancel: {
                    label: 'Cancel. Go back to ballot.'
                }
            },
            callback: function (result) {
                //console.log('This was logged in the callback: ' + result)
                if (result) {
                    prepare_ballot_for_review()

                    let message_body = document.createElement('div')
                    $(message_body).addClass('alert alert-info')
                    let message_h1 = $('<h1>').text('Reviewer #2').appendTo(message_body)
                    let message_h2 = $('<h2>').text('The ballot is now read-only. Click "Edit Ballot" to make changes.').appendTo(message_body)
                    bootbox.alert({
                        size: 'large',
                        message: message_body
                    })
                } else {
                    //alert('go back')
                }
            }
        })
    } else {
        $('#invalidBallotModal').modal('show')
    }
}
function prepare_ballot_for_review() {
    //$("#reviewer_heading").removeClass("alert-warning")
    //$("#reviewer_heading").addClass("alert-info")

    // Change panel color from warning to info
    $("#ballot-panel").removeClass("panel-warning")
    $("#ballot-panel").addClass("panel-info")

    // Change dropdown color from warning to gray
    $("#ballot-id-container").removeClass("alert-success")
    $("#ballot-id-container").removeClass("alert-danger")
    $("#ballot-id-container").removeClass("alert-warning")
    $("#ballot-id-container").addClass("alert-default")

    // Hide ballot id dropdown
    $("#dropdown-container").removeClass("show")
    $("#dropdown-container").addClass("hidden")

    $("#ballot-container").removeClass("alert-warning")
    $("#ballot-container").addClass("alert-info")

    // Swap visibility of review names
    $("#reviewer-1").addClass("hidden")
    $("#reviewer-2").removeClass("hidden")
    $("#reviewer-2").addClass("show")

    // Swap submit buttons
    $("#submit-button").addClass("hidden")
    $("#verified-button").removeClass("hidden")
    $("#verified-button").addClass("show")

    // Show/hide 'Edit', 'Clear', 'No Consensus' buttons
    $("#reset-button").addClass("hidden")
    $("#edit-button").removeClass("hidden")
    $("#edit-button").addClass("show")
    $("#no-consensus-button").removeClass("hidden")
    $("#no-consensus-button").addClass("show")

    // Make ballot read-only
    disable_ballot()
}
function reset_ballot() {
    //console.log('reset_ballot')
    $('input[type=checkbox]').prop('checked',false)
    $('#ballot-form input[type=checkbox]').attr('checked',false)
    update_json_preview()
}
function edit_ballot() {
    enable_ballot()
    // show reset
    $("#reset-button").removeClass("hidden")
    $("#reset-button").addClass("show")
    // hide self
    $("#edit-button").addClass("hidden")
}
function disable_ballot() {
    $("input:checkbox").attr('disabled', 'disabled')
    $("#imprinted_id").attr('disabled', 'disabled')
    $("#ballot-panel").removeClass("panel-success")
    $("#ballot-panel").removeClass("panel-danger")
    $("#ballot-panel").addClass("panel-default")
    // TODO Disable ballot id dropdown
}
function enable_ballot() {
    // Change ballot colors from info to success
    $("#ballot-panel").removeClass("panel-info")
    $("#ballot-panel").addClass("panel-success")
    $("#ballot-id-container").removeClass("alert-info")
    $("#ballot-id-container").addClass("alert-success")
    $("#ballot-container").removeClass("alert-info")
    $("#ballot-container").addClass("alert-success")

    // Update instructions to end user
    $("#reviewer-2").html("<h1>Reviewer #2 - Revise and verify</h1>")
    
    // Enable ballot-id input and ballot checkboxes
    $("#imprinted_id").removeAttr('disabled')
    $("#dropdown-container").removeClass("hidden")
    $("#dropdown-container").addClass("show")
    $("input:checkbox").removeAttr('disabled')

    // Confirmation popup
    //let message_body = document.createElement('div')
    //$(message_body).addClass('alert alert-success')
    //let message_h1 = $('<h1>').text('Reviewer #2').appendTo(message_body)
    //let message_h2 = $('<h2>').text('The ballot is now editable.').appendTo(message_body)
    //bootbox.alert({
    //    size: 'large',
    //    message: message_body
    //})
}
function submit_ballot() {
    // Make sure ballot id is within the set
    $("#imprinted_id").removeAttr('disabled')
    var selected_value = $('#imprinted_id').val()
    //console.log('selected_value', selected_value)
    let is_ballot_id_valid = validate_imprinted_id(selected_value)
    //console.log('is_ballot_id_valid', is_ballot_id_valid)
    if (is_ballot_id_valid) {
        $("#ballot-form").submit()
    } else {
        $('#invalidBallotModal').modal('show')
    }
}
function submit_ballot_with_confirmation() {
    // Make sure ballot id is within the set
    $("#imprinted_id").removeAttr('disabled')
    var selected_value = $('#imprinted_id').val()
    //console.log('selected_value', selected_value)
    let is_ballot_id_valid = validate_imprinted_id(selected_value)
    //console.log('is_ballot_id_valid', is_ballot_id_valid)
    if (is_ballot_id_valid) {
        let mcvr_json = read_ballot_form()
        $('#ballot_string').val(mcvr_json)
        let counted_json = count_ballot_form()
        $('#ballot_string_calc').text(counted_json)

        let message_body = document.createElement('div')

        var h = $('<h3>').appendTo(message_body)
        $(h).text('Ballot Details')

        $(message_body).addClass('row')
        let d1 = document.createElement('div')
        $(d1).addClass('col-xs-6').appendTo(message_body)
        $(d1).addClass('alert alert-warning')
        var div1 = $('<div>').appendTo(d1)
        var message_h1 = $('<h1>').text('Literal Ballot').appendTo(div1)
        var ul = $('<ul>').appendTo(div1)
        // loop mcvr_json
        var obj = $.parseJSON(mcvr_json)
        var ballot_selections = obj.ballot_selections
        //console.log("obj",obj)
        //console.log("ballot_selections",ballot_selections)
        ballot_selections.forEach(function(entry) {
            //console.log(entry);
            //console.log("object.keys", Object.keys(entry));
            for ( var candidate in entry ) {
                //console.log("candidate", candidate );
                let rank_choice = entry[candidate]
                rank_choice = get_ordinal_suffix_of_integer(rank_choice)
                //console.log("rank_choice", rank_choice );
                li = $('<li>').appendTo(ul)
                span1 = $('<span>').appendTo(li)
                span1.text(rank_choice + ' - ' + candidate )
                var img = $('<img />').attr({
                            'src': '/img/candidates/'+candidate+'.png',
                            'width': 40,
                            'class': 'img-circle'
                        }).appendTo(li)
            }
        });
        let d2 = document.createElement('div')
        $(d2).addClass('col-xs-6').appendTo(message_body)
        $(d2).addClass('alert alert-success')
        var div1 = $('<div>').appendTo(d2)
        var message_h1 = $('<h1>').text('Counted Ballot').appendTo(div1)
        var ul = $('<ul>').appendTo(div1)
        // loop counted_json
        var obj = $.parseJSON(counted_json)
        var ballot_selections = obj.ballot_selections
        //console.log("obj",obj)
        //console.log("ballot_selections",ballot_selections)
        ballot_selections.forEach(function(entry) {
            //console.log(entry);
            //console.log("object.keys", Object.keys(entry));
            for ( var candidate in entry ) {
                //console.log("candidate", candidate );
                let rank_choice = entry[candidate]
                rank_choice = get_ordinal_suffix_of_integer(rank_choice)
                //console.log("rank_choice", rank_choice );
                li = $('<li>').appendTo(ul)
                span1 = $('<span>').appendTo(li)
                span1.text(rank_choice + ' - ' + candidate )
                var img = $('<img />').attr({
                            'src': '/img/candidates/'+candidate+'.png',
                            'width': 40,
                            'class': 'img-circle'
                        }).appendTo(li)
            }
        })
        bootbox.alert({
            size: 'large',
            message: message_body,
            callback: function (result) {
                $("#ballot-form").submit()
            }
        })
    } else {
        $('#invalidBallotModal').modal('show')
    }
}

function display_selection(candidates, ballot_json) {
    let message_body = document.createElement('div')
    let d1 = document.createElement('div')
    $(d1).appendTo(message_body)
    var ul = $('<ul>').appendTo(d1)
    //console.log('ballot_json', ballot_json)
    var obj = $.parseJSON(ballot_json)
    //console.log('obj', obj)
    var ballot_selections = obj.ballot_selections
    //console.log('ballot_selections', ballot_selections)
    ballot_selections.forEach(function(entry) {
        //console.log("entry",entry);
        //console.log("object.keys", Object.keys(entry));
        for ( var selected_candidate in entry ) {
            //console.log("selected_candidate", selected_candidate )
            //console.log("candidates", candidates )
            // Lookup selected_candidate name from the id.
            var selected_name = ''
            var selected_image = 'generic.png'
            for(let can of candidates) {
                //console.log('can',can)
                //console.log('can.Description', can.Description)
                //console.log('can.Id', can.Id)
                if (can.Id.toString() === selected_candidate.toString()){
                    selected_name = can.Description
                    if (can.Image) {
                        selected_image = can.Image
                    }
                }
            }
            let rank_choice = entry[selected_candidate]
            rank_choice = get_ordinal_suffix_of_integer(rank_choice)
            //console.log("rank_choice", rank_choice );
            li = $('<li>').appendTo(ul)
            span1 = $('<span>').appendTo(li)
            span1.text(rank_choice + ' - ' + selected_name )
                $('<img />').attr({
                       'src': '/img/candidates/'+selected_image,
                       'width': 40,
                       'class': 'img-circle'
                }).appendTo(li)
        }
    });
    return message_body
}

// ===========================================================
// Read and process ballot form
// ===========================================================
function update_json_preview() {
    let mcvr_json = read_ballot_form()
    $('#ballot_string').val(mcvr_json)
    let counted_json = count_ballot_form()
    $('#ballot_string_calc').text(counted_json)
}
function read_ballot_form() {
    var json_output = ''
    var manual_cvr = {}
    var ballot_id_json = {}
    var ballot_key = "ballot_id"
    var ballot_value = $("#imprinted_id").val()
    ballot_id_json[ ballot_key ] = ballot_value
    var ballot_selections = []
    let n = num_candidates
    for(var i = 1; i <= n; i++) {
        for(var j = 1; j <= n; j++) {
            let varname = "rank" + i + "_can" + j
            //console.log("varname",varname)
            is_checked = $("#"+varname).is(':checked')
            //console.log(varname + "  is checked:",is_checked)
            if (is_checked){
                var bx = {}
                let candidate_id = $('#'+varname).attr('id')
                //console.log('candidate_id',candidate_id)
                let candidate_data = $('#'+candidate_id).attr('data-can_id')
                //console.log('candidate_data',candidate_data)
                bx[candidate_data] = i
                ballot_selections.push(bx)
            }
        }
    }
    manual_cvr = Object.assign({"ballot_selections": ballot_selections}, manual_cvr)
    manual_cvr = Object.assign({"ballot_id": ballot_value}, manual_cvr)
    let mcvr_json = JSON.stringify(manual_cvr)
    return mcvr_json
}
function count_ballot_form() {
    //console.log("count_ballot_form")
    var json_output = ''
    var manual_cvr = {}
    var ballot_id_json = {}
    var ballot_key = "ballot_id"
    var ballot_value = $("#imprinted_id").val()
    ballot_id_json[ ballot_key ] = ballot_value
    var b1 = {}
    var ballot_selections = []
    var candidates_with_vote = []
    let n = num_candidates
    var flag_have_first_choice = false
    var flag_found_overvote = false
    var flag_ballot_invalid = false
    var rank_counter = 1;
    for(var rank = 1; rank <= n; rank++) {
        var flag_have_nth_choice = false
        var flag_okay_write_nth = false
        for(var candidate = 1; candidate <= n; candidate++) {
            let varname = "rank" + rank + "_can" + candidate
            //console.log("varname",varname)
            is_checked = $("#"+varname).is(':checked')
            //console.log(varname + "  is checked:",is_checked)
            if (is_checked){
                // See if have nth choice yet. If not then there is an overvote
                if (flag_have_nth_choice) {
                    flag_found_overvote = true
                    flag_okay_write_nth = false
                    // If there is an overvote before we have first choice then
                    // the ballot is invalid
                    if (!flag_have_first_choice) {
                        //console.log('First choice overvote. Ballot invalid')
                        flag_ballot_invalid = true
                    }
                } else {
                    let candidate_id = $('#'+varname).attr('id')
                    //console.log('candidate_id:', candidate_id)
                    if (candidate_id != 9999) {// Ignore write-in candidates
                        var candidate_data = $('#'+candidate_id).attr('data-can_id')
                        //console.log('candidate_id',candidate_id)
                        //console.log('candidate_data',candidate_data)
                        // Only include if the candidate has not already been selected.
                        var index = candidates_with_vote.indexOf(candidate_data);
                        //console.log('index', index)
                        if (index == -1) {
                            //Toggle flag to say we have nth choice
                            flag_have_nth_choice = true
                            flag_okay_write_nth = true
                            //var bx = {}
                            //bx[candidate_data] = rank
                            candidates_with_vote.push(candidate_data)
                        }
                    }
                }
            }
        }
        // Only push if we have valid nth choice and no overvote
        if (flag_okay_write_nth && !flag_found_overvote) {
            // Ignore write-in id "9999" for the pilot.
            //console.log('candidate_data', candidate_data)
            if (candidate_data !== "9999") {
                var bx = {}
                bx[candidate_data] = rank_counter
                rank_counter++
                ballot_selections.push(bx)
    
                // If not yet first then toggle first
                if (!flag_have_first_choice) flag_have_first_choice = true
    
            }

        }
    }
    // If ballot is invalid send blank
    if (flag_ballot_invalid) {
        ballot_selections = []
    }
    manual_cvr = Object.assign({"ballot_selections": ballot_selections}, manual_cvr)
    manual_cvr = Object.assign({"ballot_id": ballot_value}, manual_cvr)
    let mcvr_json = JSON.stringify(manual_cvr)
    return mcvr_json
}
function validate_imprinted_id(selected_value) {
    return true
    var found_ballot_id = false
    $.each(ballots_array, function (key, entry) {
        let imprinted_id = entry.imprinted_id
        let imprinted_id_no_dashes = imprinted_id.replace(/-/g, "")
        let selected_value_no_dashes = selected_value.replace(/-/g, "")
        if (imprinted_id_no_dashes === selected_value_no_dashes) {
            found_ballot_id = true
        }
    })
    $("#ballot-id-container").removeClass("alert-success")
    $("#ballot-id-container").removeClass("alert-danger")
    $("#ballot-id-container").removeClass("alert-warning")
    if (found_ballot_id) {
        $("#ballot-id-container").addClass("alert-success")
    }else {
        $("#ballot-id-container").addClass("alert-danger")
    }
    return found_ballot_id
}
// ===========================================================
// Functions tied to listeners
// ===========================================================
function on_change_ballot_dropdown(selected_value) {
    $("#imprinted_id").val(selected_value)
    update_json_preview()
}
