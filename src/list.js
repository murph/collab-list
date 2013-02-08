/*global console, jQuery, $ */

var us;

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

function onUpdate(foo, bar, update) {
    console.log(update);

    $("#syncList").append("<li>" + update + "</li>");
}

function sendUpdate() {
    var update = $("#newEntry").val();
    $("#newEntry").val("");
    
    us.sendUpdate(update);
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
    $("#newEntryBtn").click(sendUpdate);
    
    $("#status").html("Doing Nothing");
});
