var us;
var theArray = [];

$(document).ready(function() {
    $('#listHeader').editable(function(value, settings) { 
        changeName(value);
        return(value);
    }, { 
        type    : 'text',
        submit  : 'OK'
    });

});

function changeName(value) {
    

};

function showLists(data) {
    $("#listList").show();

    var lists = JSON.parse(data);

    for (var i = 0; i < lists.length; i++) {
        var elem = $("<li>" + lists[i].name + "</li>");
        elem.attr("data-key", lists[i].listKey);
        $("#listList ul").append(elem);
        elem.click(joinList);
    }
}

function joinList() {
    var key = $(this).attr("data-key");

    var defRetrieve = $.Deferred();
    var defRetrieve2 = $.Deferred();
    var defNewToken = $.Deferred();

    var tempUs;

    $.post("/joinList/" + key)
        .done(function(data) {
            var token = JSON.parse(data)['token'];
            var name = JSON.parse(data)['name'];
            $("#listHeader").html(name);
            dopamine.updateStream.retrieveFromToken(token)
                .done(function(newUs) {
                    tempUs = newUs;
                    defRetrieve.resolve();
                });
        });

    defRetrieve.done(function() {
        tempUs.createNewToken({canWrite: true})
            .done(function(newToken) {
                dopamine.updateStream.retrieveFromToken(newToken)
                    .done(function(newUs) {
                        us = newUs;
                        defRetrieve2.resolve();
                    });
            });
    });

    defRetrieve2.done(function() {
        console.log("subscribng to final token");
        console.log(us.getMyToken());
        us.subscribe(onUpdate);
        $(".page").hide();
        $("#list").show();
    });
    

}

function getLists() {
    $.get("/listLists", showLists);
}

function joined() {
    $("#unjoined").hide();
    $("#joined").show();
    $("#list").show();
}

function subscribe() {
    $("#sub").off("click");
    $("#sub").click(unsubscribe);
    $("#sub").html("Unsubscribe");
    us.subscribe(onUpdate);
}

function unsubscribe() {
    $("#sub").off("click");
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

    console.log("sending update");

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

    getLists();
    $("#unjoined").show();

    /* New List Button */
    $("#newList").click(function() {
        dopamine.updateStream.createNew()
            .done(function(newUs) {
                us = newUs;

                $.post("/createList", {
                    name: "Some Name For a List",
                    token: us.getMyToken()
                }).done(function() {
                    us.subscribe(onUpdate);
                    joined();
                });
            });
    });

    $("#createChildToken").click(createChild);
    $("#sub").click(subscribe);
    $("#newEntryBtn").click(doAppend);
});
