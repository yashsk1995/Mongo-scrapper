var nb = $('p.savedlist').length;
$(".numberofsaved").text(nb);

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