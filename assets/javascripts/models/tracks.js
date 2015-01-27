// Basic function to get query string parameters from the URL
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// Enables us to use the person's name in validation messages later...
var callout = $("#callout h1").text();
var name_from_callout = callout.split(",")[0];
if ( name_from_callout != "Oke" ) {
  var validation_name = " " + name_from_callout;
} else {
  var validation_name = "";
}

// Defines the Tracks model [See: https://github.com/adammcarth/instance.js]
var Tracks = new Instance({
  url: "/submit", // URL the fields will submit to
  method: "post", // request method
  before_send: function() {
    $("#track-holder").addClass("defaultCursor");
    $("#track-holder").fadeTo("fast", 0.5);
    $("#submit").attr("disabled", "disabled");
    $(".usr-input").attr("disabled", "disabled");
  },
  success: function(response) {
    if ( /\s/.test(Tracks.get("name")) ) {
      var first_name = Tracks.get("name").split(" ")[0];
    } else {
      var first_name = Tracks.get("name")
    }

    $("#track-holder").css({"opacity": "1"});
    $(".usr-input").css({"color": "#72cc36"});
    $("#track-holder").transition({ x: -2000, delay: 200 }, 700, "ease");
    $("#vector").transition({ scale: 0, delay: 200 }, function() {
      $("#container").html("" +
      "<div id='success_area' style='display: none;'>" +
        "<div class='grid-6'>" +
          "<div id='vector' class='parrot-headphones'></div>" +
          "<div class='clear'></div>" +
        "</div>" +
        "<div class='grid-6' id='judgement'>" +
          "<div id='callout'>" +
            "<h1>Judgement Day is upon us...</h1>" +
            "<p id='tagline'>Thanks " + first_name + ". <a href='/answers/" + jQuery.parseJSON(response).serial + "'>Your songs</a> are being listened to now.</p>" +
          "</div>" +
        "</div>" +
        "<div class='clear'></div>" +
      "</div>");
      var vector_height = $("#vector").actual("height");
      var judgement_height = $("#judgement").actual("height");
      var push = (vector_height - judgement_height) / 2;
      $("#judgement").css({"margin-top": push + "px"});
      $("#success_area").delay(200).fadeIn(1500);
    });
  },
  error: function(response) {
    $("#callout h1").after("<div class='error-box'>Sorry. There was a problem submitting your songs. (#" + response + ")</div>");
    $("#track-holder").removeClass("defaultCursor");
    $("#track-holder").css({"opacity": "1"});
    $("#submit").removeAttr("disabled");
    $(".usr-input").removeAttr("disabled");
  },
  validations: {
    "[tracks]1": {
      max_length: {
        value: 80,
        fail: function() {
          $("#ol_first").addClass("error");
          $("#1").addClass("error");
          $("#first-track").after("<li class='error'>That track title is pretty audacious" + validation_name + "...</li>");
        }
      },

      min_length: {
        value: 5,
        fail: function() {
          $("#ol_first").addClass("error");
          $("#1").addClass("error");
          $("#first-track").after("<li class='error'>That track title is pretty audacious" + validation_name + "...</li>");
        }
      }
    },

    "[tracks]2": {
      max_length: {
        value: 80,
        fail: function() {
          $("#ol_second").addClass("error");
          $("#2").addClass("error");
          $("#second-track").after("<li class='error'>That track title is pretty audacious" + validation_name + "...</li>");
        }
      },

      min_length: {
        value: 5,
        fail: function() {
          $("#ol_second").addClass("error");
          $("#2").addClass("error");
          $("#second-track").after("<li class='error'>That track title is pretty audacious" + validation_name + "...</li>");
        }
      }
    },

    "[tracks]3": {
      max_length: {
        value: 80,
        fail: function() {
          $("#ol_third").addClass("error");
          $("#3").addClass("error");
          $("#third-track").after("<li class='error'>That track title is pretty audacious" + validation_name + "...</li>");
        }
      },

      min_length: {
        value: 5,
        fail: function() {
          $("#ol_third").addClass("error");
          $("#3").addClass("error");
          $("#third-track").after("<li class='error'>That track title is pretty audacious" + validation_name + "...</li>");
        }
      }
    }
  },
  
  before_validation: function() {
    $("#1").removeClass("error");
    $("#2").removeClass("error");
    $("#3").removeClass("error");
    $("#ol_first").removeClass("error");
    $("#ol_second").removeClass("error");
    $("#ol_third").removeClass("error");
    $("li.error").remove();
  }
});

// Add name if it exists in the URL query string.
Tracks.add({name: getParameterByName("n")});

// Add input fields to the tracks model
Tracks.addField([
  "[tracks]1",
  "[tracks]2",
  "[tracks]3",
  "[trackNotes]1",
  "[trackNotes]2",
  "[trackNotes]3"
]);

// Add the scenario to submit queue (so we can see which one they are responding to later on)
Tracks.addElement("tagline");