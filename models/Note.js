// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;

// Create the Comment schema
var NoteSchema = new Schema({
  // Just a string
  body: {
    type: String
},
article: {
    type: Schema.Types.ObjectId,
    ref: "Article"
}
});

// Remember, Mongoose will automatically save the ObjectIds of the comments
// These ids are referred to in the Article model

// Create the Comment model with the CommentSchema
var Note = mongoose.model("Note", NoteSchema);

// Export the Comment model
module.exports = Note;