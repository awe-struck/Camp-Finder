const Campground = require("../models/campground");
const ObjectID = require("mongoose").Types.ObjectId;

const { cloudinary } = require("../cloudinary");

const maptilerClient = require("@maptiler/client");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
maptilerClient.config.fetch = fetch;
maptilerClient.config.apiKey = process.env.MAPTILER_KEY;

module.exports.index = async (req, res, next) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    { limit: 1 }
  );

  const newCampground = new Campground(req.body.campground);
  newCampground.geometry = geoData.features[0].geometry;
  newCampground.images = req.files.map((imageFile) => ({
    url: imageFile.path,
    filename: imageFile.filename,
  }));
  newCampground.author = req.user._id;
  await newCampground.save();
  req.flash("success", "Successfully made a new campground");
  res.redirect(`/campgrounds/${newCampground._id}`);
};

module.exports.showCampground = async (req, res, next) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    req.flash("error", "Error, Campground not found! Listing unavailable");
    return res.redirect("/campgrounds");
  }

  const foundCampground = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!foundCampground) {
    req.flash("error", "Error! Campground not found!");
    return res.redirect("/campgrounds");
  }
  console.log(foundCampground);
  console.log(foundCampground.geometry);
  res.render("campgrounds/show", { foundCampground });
};

module.exports.renderEditForm = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find that campground");
    return res.redirect("/campgrounds");
  }

  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(
    id,
    { ...req.body.campground },
    { runValidators: true }
  );

  const imgs = req.files.map((imageFile) => ({
    url: imageFile.path,
    filename: imageFile.name,
  }));

  campground.images.push(...imgs);
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      cloudinary.uploader.destroy(filename);
    }

    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully Updated Campground");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground");
  res.redirect("/campgrounds");
};
// module.exports;
// module.exports;
