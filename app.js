const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  next();
});

app.get('/api/categories', (req, res, next) => {
  // console.log("SEPARATIOOOOOON");
  
/*   const response = {
    categories: [
      {
        id: 1,
        name: "Body",
        imageURL: "https://www.earthrangers.com/public/content/wildwire/RedFoxFeaturedImage-1.jpg",
      },
      {
        id: 2,
        name: "Jaw",
        imageURL: "https://www.earthrangers.com/public/content/wildwire/RedFoxFeaturedImage-1.jpg",
      },
    ],
  }; */

  res.status(200).json(response);
});

module.exports = app;