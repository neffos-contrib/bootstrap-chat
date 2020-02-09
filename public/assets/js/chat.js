const neffos = require('neffos.js');

function handleError(reason) {
    console.log(reason);
    window.alert(reason);
}

var conn;

async function initializeWebsocket() {
    try {
        const client = await neffos.dial('/ws', {
            chat: { // "chat" namespace.
                message: function (nsConn, msg) { // "message" event.
                    // pseudo-logic.
                    // Replace "Other" with your own sign-in & username & avatar option.
                    appendMessage('Other', msg.Body);
                }
            }
        });

        conn = await client.connect("chat");
    } catch (err) {
        handleError(err);
    }
}

initializeWebsocket();

$(".messages").animate({
    scrollTop: $(document).height()
}, "fast");

$("#profile-img").click(function () {
    $("#status-options").toggleClass("active");
});

$(".expand-button").click(function () {
    $("#profile").toggleClass("expanded");
    $("#contacts").toggleClass("expanded");
});

$("#status-options ul li").click(function () {
    $("#profile-img").removeClass();
    $("#status-online").removeClass("active");
    $("#status-away").removeClass("active");
    $("#status-busy").removeClass("active");
    $("#status-offline").removeClass("active");
    $(this).addClass("active");

    if ($("#status-online").hasClass("active")) {
        $("#profile-img").addClass("online");
    } else if ($("#status-away").hasClass("active")) {
        $("#profile-img").addClass("away");
    } else if ($("#status-busy").hasClass("active")) {
        $("#profile-img").addClass("busy");
    } else if ($("#status-offline").hasClass("active")) {
        $("#profile-img").addClass("offline");
    } else {
        $("#profile-img").removeClass();
    };

    $("#status-options").removeClass("active");
});

var docHeight = $(document).height();

function appendMessage(username, message) {
    if ($.trim(message) == '') {
        return false;
    }

    // pseudo-logic. Add your own logic.
    className = "sent"
    if (username != 'You') {
        className = "replies"
    }

    $('<li class="'+className+'"><img src="/assets/images/avatars/' + username + '.png" alt="" /><p>' + message +
        '</p></li>').appendTo($('.messages ul'));
    $('.message-input input').val(null);
    $('.contact.active .preview').html('<span>' + username + ': </span>' + message);
    $(".messages").animate({scrollTop: docHeight + 95}, "fast");
    docHeight += 95;
}

function newMessage() {
    message = $(".message-input input").val();
    appendMessage('You', message);
    conn.emit("message", message);
};

$('.submit').click(function () {
    newMessage();
});

$(window).on('keydown', function (e) {
    if (e.which == 13) {
        newMessage();
        return false;
    }
});