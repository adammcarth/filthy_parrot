// Define some variables
var window_height = window.innerHeight;
var window_width = window.innerWidth;
var content_height = $("#container").height();
var slack = window_height - content_height;
    
// Center the content if required
if ( window_height > content_height && slack > 50 ) {
  var push = slack / 2;
  $("#container").css({
    'margin-top': push + 'px'
  });
}

// Allow track fields to be focused by clicking on their list numbers as well.
$("#ol_first").click(function() {
  $("#1").focus();
});
$("#ol_second").click(function() {
  $("#2").focus();
});
$("#ol_third").click(function() {
  $("#3").focus();
});

// Show "add track notes" icons when respective fields are focused
$("#1").focus(function() {
  $("#openTrack1Notes").show();
});
$("#1").focusout(function() {
  setTimeout(function() {
    $("#openTrack1Notes").hide();
  }, 100);
});

$("#2").focus(function() {
  $("#openTrack2Notes").show();
});
$("#2").focusout(function() {
  setTimeout(function() {
    $("#openTrack2Notes").hide();
  }, 100);
});

$("#3").focus(function() {
  $("#openTrack3Notes").show();
});
$("#3").focusout(function() {
  setTimeout(function() {
    $("#openTrack3Notes").hide();
  }, 100);
});

// Popup overlays for track notes
$(".msg-icon").magnificPopup({
  type: "inline"
});

// Add track notes to HTML title attribute of list numbers + input (just a UX thing)
$("textarea[name='[trackNotes]1']").focusout(function() {
  $("#1").prop("title", $("textarea[name='[trackNotes]1']").val());
  $("#ol_first").prop("title", $("textarea[name='[trackNotes]1']").val());
});
$("textarea[name='[trackNotes]2']").focusout(function() {
  $("#2").prop("title", $("textarea[name='[trackNotes]2']").val());
  $("#ol_second").prop("title", $("textarea[name='[trackNotes]2']").val());
});
$("textarea[name='[trackNotes]3']").focusout(function() {
  $("#3").prop("title", $("textarea[name='[trackNotes]3']").val());
  $("#ol_third").prop("title", $("textarea[name='[trackNotes]3']").val());
});

// "Save" button in track notes overlay (just closes it)
$(".close_popup").click(function() {
  $.magnificPopup.close();
});

// Allison Gold YouTube video popup
$("#alison-gold-video").magnificPopup({ 
  type: "iframe"
});



///////////////////////////////////////////////////////////////////////
// SUBMITTING VOTES STUFF /////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////


// Turn submit button on/off
setInterval(function() {
  if ( Tracks.get("[tracks]1") && Tracks.get("[tracks]2") && Tracks.get("[tracks]3") && $("#submit").hasClass("disabled") ) {
    $("#submit").removeAttr("disabled");
    $("#submit").removeClass("disabled");
  }

  if ( !Tracks.get("[tracks]1") || !Tracks.get("[tracks]2") || !Tracks.get("[tracks]3") ) {
    if ( !($("#submit").hasClass("disabled")) ) {
      $("#submit").addClass("disabled");
      $("#submit").attr("disabled", "disabled");
    }
  }
}, 100);

$("#submit").click(function() {
  // Check if name is already set. If not, prompt a name submission.
  if ( getParameterByName("n") === undefined || getParameterByName("n") === "" ) {
    var inputted_name = prompt("What's your full name? (For Results Only)");
    if ( inputted_name != undefined && inputted_name != "" && inputted_name != " ") {
      Tracks.add({name: inputted_name});
      Tracks.send();
    }
  } else {
    console.log(Tracks.get());
    Tracks.send();
  }
});