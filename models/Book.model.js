const {Schema, model } = require("mongoose");

const bookSchema = new Schema(
  {
    title: String,
    description: String,
    rating: Number,
    author: {
      type: Schema.Types.ObjectId, //here i am gonna store an object Id
      ref: "Author",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Book", bookSchema);
