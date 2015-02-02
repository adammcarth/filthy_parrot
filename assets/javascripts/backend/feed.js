$(".timeAgo").timeago();

// Active class first sidebar item on page load
$(".answers li:first").addClass("active");

// Loads a specific set of results (triggered from the sidebar)
$(".answers li").on("click", function() {

  var query = $.ajax({
    url: "/feed/api?load=" + this.id,
    type: "GET"
  });

  query.done(function(submission) {
    if ( submission != undefined && submission != "" ) {
      console.log(submission);
      $(".answers li").removeClass("active");
      this.addClass("active");
    }
  }, this);
});