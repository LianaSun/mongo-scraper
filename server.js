//Require NPM Packages

var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cherrio = require("cherrio");

//Require Models
var db = require("./models");

//Listening on PORT 3000
var PORT = process.env.PORT || 3000;

//Initialize Express
var app = express();

//Use Morgan Logger for logging all requests made
app.use(logger("dev"));

//Use body-parser to handle all form submissions
app.use(bodyParser.urlencoded({ extended: true}));

//Use express.static as a static directory in the public folder
app.use(express.static("public"));

//Connect to MongoDB
//mongoose.connect("mongodb://localhost/lianas-mongo-scraper")

//If deployed, use deployed DB. If not deployed, use local mongoHeadlines DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

//Set mongoose to leverage built in JS ES6 Promises
//Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

//Routes

//Route to display home page
app.get("/", function(req, res){
    res.render("index");
});

//GET route for scraping yoga journal website
app.get("/scrape", function(req, res){
    //grab body of html with request
    axios.get("https://www.yogajournal.com").then(function(response){
    //load request into cherrio and save to $ as a shorthand selector
    var $ = cherrio.load(response.data);
    
    //grab every h4 in article tag and do this next:
    $("h4.editorial-card-title").each(function(i, element){
    //and save as an empty result obj
    var result = {};

//Add title, summary and href of each link and save as properties
result.title = $(this)
        .children("a")
        .text();
result.summary = $(this)
        .parent()
        .children("a")
        .attr("href");
result.link = $(this)
        .children("a")
        .attr("href");

//create a new article by using the result obj built by scraping website
db.Article.create(result)
        .then(function(dbArticle){
        //view in console
        console.log(dbArticle);
        })
        .catch(function(err){
            //if error occurs, sent to client
        return res.json(err);
        });
    });

//If article is successfully scraped and saved, send message to client
res.send("Scrape Complete");
    });  
});

//Route for getting articles from DB
app.get("/articles", function(req, res){
    //grab documents in the articles collection
db.Article.find({})
.then(function(dbArticle){
    //if articles are found, send back to client
    res.json(dbArticle);
})
.catch(function(err){
    //send error to client, if error occurs
    res.json(err);
    });
});

//Route to update article marked as saved
app.post("/saved:id", function(req, res){
//grab article id from params, find in DB and update saved to true
db.Article.findOneAndUpdate({_id: req.params.id}, {$set: {saved: true}},{new:true})
.then(function(dbArticle){
//If articles are found, send them to client
res.json(dbArticle);
})
.catch(function(err){
//If error occurs, send back to client
res.json(err);
    });
});

//route for grabbing specific article by id and populate with note
app.get("/articles:id", function(req, res){
//Using the id passed into article parameter and prep a query that find matching artcle in db
db.Article.findOne({_id: req.params.id})
//populate all notes associated with article
.populate("note")
.then(function(dbArticle){
//If article matching ID is found, send back to client
res.json(dbArticle);
})
.catch(function(err){
//If error occurs, send back to client
res.json(err);
    });
});

//Route for saving and updating article associated with note
app.post("/articles/:id", function(req, res){
//Create new route and pass req.body to the entry
db.Note.create(req.body)
.then(function(dbNote){
    //if note is successfully created, find article with an _id equal to req.params.id
    //update article to associated with new note
return db.Article.findOneAndUpdate({_id: req.params.id}, {note:db.Note._id}, {new: true})
    })
.then(function(dbArticle){
//If able to successfully update an article, send back to client
res.json(dbArticle);
})
.catch(function(err) {
    //if error occured, send to client
res.json(err);
    });
});

//Route for deleting note
app.get("/note/:id", function(req, res){
//grab article ID from params, find in DB and remove note
db.Article.update({_id: req.params.id}, { $unset: {note:""}})
.then(function(dbNote) {
//If articles are found, send back to client
res.json(dbNote);
console.log("Note has been deleted");
});
});

//Start Server
app.listen(PORT, function(){
    console.log("App running on port" + PORT);
});



