const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const campground = require("../models/campground");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const cloudinary = require("cloudinary").v2;

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewPage = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.postNewCampground = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  console.log(geoData);
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  console.log(campground);
  req.flash("success", "New campground successfully created.");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.renderCampground = async (req, res, next) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!campground) {
    req.flash("error", "Can not find the Campground.");
    return res.render("/campgrounds", { campground });
  }
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditPage = async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", `Can not find the Campground.`);
    return res.redirect("/campgrounds");
  }

  res.render("campgrounds/edit", { campground });
};

module.exports.postEditPage = async (req, res, next) => {
  const { id } = req.params;
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  req.body.campground.geometry = geoData.body.features[0].geometry;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  campground.images.push(...imgs);
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  console.log(campground);
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);

  // const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
};

module.exports.deleteCampground = async (req, res, next) => {
  const { id } = req.params;
  const deleted = await Campground.findByIdAndDelete(id);
  console.log(`${deleted.title} ${deleted.location}  is deleted.`);
  req.flash("success", `${deleted.title} ${deleted.location}  is deleted.`);
  res.redirect("/campgrounds");
};
