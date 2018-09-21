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

  $(".savenote").on("click", function() {
    var id2 = $(this).attr("data-id");
   
      $.ajax({
            method: "POST",
            url: "/notes/save/" + id2,
            data: {
              text: $("#comment"+ id2).val()
            }
          }).done(function(data) {
              // Log the response
              console.log(data);
              location.reload();
              // Empty the notes section
            
          });
    
});



$(".deleteNote").on("click", function() {
    var noteId = $(this).attr("data-note-id");
    var articleId = $(this).attr("data-article-id");

    console.log(noteId);
    $.ajax({
        method: "DELETE",
        url: "/notes/delete/" + noteId  + "/" + articleId
    }).done(function(data) {
        console.log(data);
        location.reload();

          window.location = "/saved"
    })
});