// Grab the articles as a json
$.getJSON("/articles", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
  
      // Display the article details information on the page
      $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].summary + "<br />" + "https://www.audubon.org" + data[i].link + "</p>");
      $("#articles").append("<button data-id='" + data[i]._id + "' id='savearticle'>Save Article</button>");
    }
  });
  
  //When the #scrape button is pressed
  $("#scrape").on("click", function() {
    // Make an AJAX GET request to scrape the website
    $.ajax({
      type: "GET",
      dataType: "json",
      url: "/scrape",
      success: function(response) {
        $("#articles").empty();
      }
    });
  });
  
  // When you click the #savearticle button
  $(document).on("click", "#savearticle", function() {
    // Grab the id associated with the article from the save button
    var thisId = $(this).attr("data-id");
  
    // Run a POST request to access that saved id
    $.ajax({
      method: "POST",
      url: "/saved/" + thisId,
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
      });
  });
  
  // button click redirect to saved page
  $("#gotosaved").on("click", function (event) {
  
    window.location.href = "/saved.html";
  
  });
  
  // Grab the saved articles as a JSON
  $.getJSON("/saved", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
  
      // Display the article details information on the page
      $("#savedarticles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].summary + "<br />" + "https://www.audubon.org" + data[i].link + "</p>");
    }
  });
  
  // This will be the note display code
  $(document).on("click", "p", function() {
    // Empty the notes from the note section
    $("#details").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
  
    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // With that done, add the note information to the page
      .then(function(data) {
        console.log(data);
        // The title of the article
        $("#details").append("<h3>" + data.title + "</h3>");
        // An input to enter a new title
        $("#details").append("<input id='titleinput' name='title' >");
        // A textarea to add a new note body
        $("#details").append("<textarea id='bodyinput' name='body'></textarea>");
        // A button to submit a new note, with the id of the article saved to it
        $("#details").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
        // A button to delete a note, with the id of the article saved to it
        $("#details").append("<button data-id='" + data._id + "' id='deletenote'>Delete Note</button>");
  
        // If there's a note in the article
        if (data.note) {
          // Place the title of the note in the title input
          $("#titleinput").val(data.note.title);
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
        }
      });
  });
  
  // When you click the #savenote button
  $(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
  
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes").empty();
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
  
  // When you click the #deletenote button
  $(document).on("click", "#deletenote", function() {
    // Grab the id associated with the article from the delete button
    var thisId = $(this).attr("data-id");
  
    // Run a POST request to access that article id
    $.ajax({
      method: "GET",
      url: "/note/" + thisId,
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
      });
  });
  
  // button click redirect to main page
  $("#gotohome").on("click", function (event) {
  
    window.location.href = "/";
  
  });