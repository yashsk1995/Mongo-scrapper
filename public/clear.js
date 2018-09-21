$(".clearData").on("click",function(){
    $.ajax({
        method: "DELETE",
        url: "/dropdb"
    }).done(function(data) {
        console.log(data);
        location.reload();

          window.location = "/"
    })
})