const express = require('express');
const fs = require('fs')
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  next();
});

app.use(express.static('public'));

app.get('/api/categories', (req, res, next) => {
    const filepath = "./public/assets/categories";
    fs.readdir(filepath, (err, files) => {
      const categories = files.map((file) => (
        {
          id: file,
          imageUrl: `http://localhost:3001/assets/categories/${file}`,
        }
      ));
      const response = {
        categories,
      }
      res.status(200).json(response);
    });
});

app.get('/api/items/:category', (req, res, next) => {
    let category = req.params.category;
    let categoryCapitalized = category.charAt(0).toUpperCase() + category.slice(1);
    const filepath = `./public/assets/${categoryCapitalized}`;

    fs.readdir(filepath, (err, files) => {
      if (err) {
        console.log(err);
      }
      else {
        const categoryImages = files.map((file) => (
          {
            id: file,
            imageUrl: `http://localhost:3001/assets/${categoryCapitalized}/${file}`,
          }
        ));
        const response = { categoryImages };
        res.status(200).json(response);
      }
    });
});

// const response = {
//   items: [body1, body2, body3, body4, body5]
// }

module.exports = app;