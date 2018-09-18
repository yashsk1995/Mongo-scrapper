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


function showModal() {
  $('#myModal').modal();
}

