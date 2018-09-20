var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");

var exphbs = require("express-handlebars");
var app = express();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 5000;

// Initialize Express

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));
var axios = require("axios");


// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/mongoHeadlines", { useNewUrlParser: true });
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI,{ useNewUrlParser : true});
// Routes
app.get("/", function (req, res) {

  db.Article.find({})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      var hbObject = {
        articles: dbArticle
      }
      console.log(hbObject);
      res.render('index', hbObject);
    }
    )
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
})


app.get("/saved", function (req, res) {

  db.Article.find({ saved: true }).populate("notes").then(function (dbArticle) {
    // If we were able to successfully find Articles, send them back to the client
    var hbObject = {
      articles: dbArticle
    }
    console.log(hbObject);
    res.render('saved', hbObject);
  }
  )
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
})
// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with request


  axios.get("https://www.nytimes.com/search?query=articles").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("div.Item-wrapper--2ba8L").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.headline = $(this)
        .children("a")
        .text();
      result.url = $(this)
        .children("a")
        .attr("href");
      result.summury = $(element).find("p.Item-summary--3nKWX").text().trim();
      //  $(this)
      // .children("p.Item-summary--3nKWX")
      // .text();

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          // console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });
    // If we were able to successfully scrape and save an Article, send a message to the client
    // res.send("Scrape Complete");


  });
});

app.put("/save/:id", function (req, res) {
  db.Article.update({ _id: req.params.id }, { saved: true })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});
app.put("/unsave/:id", function (req, res) {
  db.Article.update({ _id: req.params.id }, { saved: false })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});


// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/notes/save/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  var notenew = {
    body: req.body.text,
    article: req.params.id
  }
  db.Note.create(notenew)
    .then(function (dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { "notes": dbNote } }, { new: true });
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);

    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


app.delete("/notes/delete/:note_id/:article_id", function(req, res) {
  // Use the note id to find and delete it
  db.Note.findOneAndRemove({ "_id": req.params.note_id }, function(err) {
    // Log any errors
    if (err) {
      console.log(err);
      res.send(err);
    }
    else {
      db.Article.findOneAndUpdate({ "_id": req.params.article_id }, {$pull: {"notes": req.params.note_id}})
       // Execute the above query
        .exec(function(err) {
          // Log any errors
          if (err) {
            console.log(err);
            res.send(err);
          }
          else {
            // Or send the note to the browser
            res.send("Note Deleted");
          }
        });
    }
  });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
