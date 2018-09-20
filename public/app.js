$(".saved").on("click", function() {
  
  var id = $(this).attr("data-id");
  $.ajax({
      url: "/save/" + id,
      method: "PUT"
  })
  .done(function() {
      location.reload();
  })
});

$(".unsaved").on("click", function() {
  
  var id = $(this).attr("data-id");
  $.ajax({
      url: "/unsave/" + id,
      method: "PUT"
  })
  .done(function() {
      location.reload();
  })
});
function showModal() {
  $('#myModal').modal();
}


var nb2 = $('.unsaved').length;
$(".numberofsaved").text(nb2);
