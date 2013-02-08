var us;
var theArray = [];

function joined() {
    $("#unjoined").hide();
    $("#joined").show();
    $("#list").show();
}

function subscribe() {
    $("#sub").click(unsubscribe);
    $("#sub").html("Unsubscribe");
    us.subscribe(null, onUpdate);
}

function unsubscribe() {
    $("#sub").click(subscribe);
    $("#sub").html("Subscribe");
    us.unsubscribe();
}

function createChild() {
    us.createNewToken({
        canWrite: true
    }).done(function(token) {
        $("#childTokenDisplay").html(token);
    }).fail(function(data) {
        $("#childTokenDisplay").html("Failed.");
    });
}

function rebuildList(data)
{
    var items = [];
    $('#syncList').empty();
    $.each(data, function(i, item) {
        items.push('<h2 class="edit" id="' + i + '">' + item + '</h2>');
    });
    $('#syncList').append( items.join('') );

    $('.edit').editable(function(value, settings) { 
        console.log(this.id);
        doModify(this.id, value);
        return(value);
    }, { 
        type    : 'textarea',
        submit  : 'OK'
    });

}


function onUpdate(foo, bar, update) {
    console.log(update);

    if (update.type === "append") {
        theArray.push(update.value);
    }

    if (update.type === "modify") {
        theArray[update.idx] = update.value;
    }

    rebuildList(theArray);
}

function doAppend() {
    var val = $("#newEntry").val();
    $("#newEntry").val("");

    us.sendUpdate({
        type: "append",
        value: val
    });
}

function doModify(idx, value) {
    us.sendUpdate({
        type: "modify",
        idx: idx,
        value: value
    });
}

$(document).ready(function() {

    /* New Update Stream button */
    $("#newUS").click(function() {
        dopamine.updateStream.createNew()
            .done(function(newUs) {
                us = newUs;
                $("#status").html("US created");
                joined();
            });
    });

    $("#joinUS").click(function() {
        var token_value = $("#tokenInput").val();
        console.log(token_value);
        dopamine.updateStream.retrieveFromToken(token_value)
            .done(function(newUs) {
                us = newUs;
                $("#status").html("Joined US");
                joined();
            });
    });

    $("#createChildToken").click(createChild);
    $("#sub").click(subscribe);
    $("#newEntryBtn").click(doAppend);
    
    $("#status").html("Doing Nothing");
});
