$(".timeAgo").timeago();

// Loads a specific set of results (triggered from the sidebar)
$(".answers li").on("click", function() {
  var query = $.ajax({
    url: "/feed/api?load=" + this.id,
    type: "GET"
  });

  query.done(function(response) {
    if ( response != undefined && response != "" && response != "Internal Server Error" ) {
      var submission = jQuery.parseJSON(response);
      console.log(submission);
    }
  });
});