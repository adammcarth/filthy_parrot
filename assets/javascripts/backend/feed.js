$("document").ready(function() {
  // Converts ISO dates inside the ".timeAgo" HTML class to plain english
  $(".timeAgo").timeago();
});

function displaySubmission(id, success_callback) {
  var query = $.ajax({
    url: "/feed/api?load=" + id,
    type: "GET"
  });

  query.done(function(submission) {
    if ( submission != undefined && submission != "" ) {
      // Display the new submission in the content area
      $(".name-heading").html("<center>" + submission["name"] + "</center>");
      $(".scenario").html(submission["scenario"]);
      $("#first").html(submission["track_1"]);
      if ( submission["track_1_notes"] != "" ) { $("#first").append(": <span>" + submission["track_1_notes"] + "</span>"); }
      $("#second").html(submission["track_2"]);
      if ( submission["track_2_notes"] != "" ) { $("#second").append(": <span>" + submission["track_2_notes"] + "</span>"); }
      $("#third").html(submission["track_3"]);
      if ( submission["track_3_notes"] != "" ) { $("#third").append(": <span>" + submission["track_3_notes"] + "</span>"); }
      $(".meta .timeAgo").prop("title", submission["updated_at"]);
      $("#code").prop("href", "/answers/" + submission["id"]);
      $("#code").html(submission["id"]);

      // Finally, deal with side bar classes
      $(".answers li").removeClass("active");
      $("#" + id).addClass("active");

      // All done.
      if ( success_callback ) {
        success_callback();
      }
    }
  });
}

// Loads a specific set of results (triggered from the sidebar)
$(".answers li").on("click", function() {
  displaySubmission(this.id);
});