if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const maptilerClient = require("@maptiler/client");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
maptilerClient.config.fetch = fetch;
maptilerClient.config.apiKey = process.env.MAPTILER_KEY;

const mongoose = require("mongoose");
const axios = require("axios");
const cities = require("./seedCities");
const { descriptors, places } = require("./seedHelpers");
const Campground = require("../models/campground");
// const User = require("../models/user");

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/campGroundApp";
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(dbUrl);
  console.log("MONGO CONNECTION OPEN");
}

// Retrieves random image from Unsplash. Base API: https://api.unsplash.com/
// Use place to filter for image
// client_id is the access key in Unsplash App section
async function seedImg(place) {
  try {
    const config = {
      params: {
        client_id: process.env.UNSPLASH_KEY,
        query: place,
        count: 1,
      },
    };
    const res = await axios.get(
      `https://api.unsplash.com/photos/random?`,
      config
    );
    return res.data[0].urls.regular;
  } catch (error) {
    console.log(error);
    console.log("SOMETHING WENT WRONG!");
  }
}

async function seedLocation(place) {
  try {
    const geoData = await maptilerClient.geocoding.forward(place, { limit: 1 });
    // console.log(geoData);
    // console.log(geoData.features[0].geometry);
    return geoData.features[0].geometry;
  } catch (error) {
    console.log(error);
  }
}

// Randomally inserts 20 camps into the database
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});

  // temp change to 30 to test image api
  for (let i = 0; i < 10; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 30) + 10;
    const samplePlace = sample(places);
    const sampleDescriptors = sample(descriptors);

    const newCampground = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sampleDescriptors} ${samplePlace}`,
      images: [
        {
          url: await seedImg(`${sampleDescriptors} ${samplePlace}`),
        },
      ],
      price: price,
      description: "Placeholder text for now",
      author: "66374a19d529bf6275295af1",
    });
    newCampground.geometry = await seedLocation(newCampground.location);
    await newCampground.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
