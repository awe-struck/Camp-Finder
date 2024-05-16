const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");
// const User = require("./user");

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const campgroundSchema = new Schema({
  title: String,
  images: [ImageSchema],
  location: String,
  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  price: Number,
  description: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

//Middleware to delete all associated reviews after deleting campground
campgroundSchema.post("findOneAndDelete", async function (campgroundData) {
  // console.log(campground);
  if (campgroundData) {
    await Review.deleteMany({
      _id: {
        $in: campgroundData.reviews,
      },
    });
  } else {
    console.log("No Reviews to delete");
  }
});

const Campground = mongoose.model("Campground", campgroundSchema);
module.exports = Campground;
