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
    const changePosition = ["body", "eyes", "eyebrows", "nose", "mouth"];
    const changeColor = ["body", "eyes", "eyebrows", "mouth", "hair-fringe", "hair-side", "hair-back", "hair-top", "hair-spike", "clothes"];
    const isMandatory = ["body", "jaw", "eyes", "eyebrows", "nose", "mouth", "hair-fringe", "clothes", "background-color"];

    fs.readdir(filepath, (err, files) => {
      const categories = files.map((file) => { 

        let fileName = file.substr(3).slice(0, -4);

        return (
          {
            id: fileName,
            imageUrl: `http://localhost:3001/assets/categories/${file}`,
            changePosition : changePosition.includes(fileName),
            changeColor : changeColor.includes(fileName),
            isMandatory : isMandatory.includes(fileName),
          }
        )
      });

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
        res.status(404).send('The category selected doesn\'t have any image yet !');
      }
      else {
        const categoryImages = files.map((file) => (
          {
            id: file,
            imageUrl: `http://localhost:3001/assets/${categoryCapitalized}/${file}`,
            category: category.toLocaleLowerCase(),
          }
        ));
        const response = { categoryImages };
        res.status(200).json(response);
      }
    });
});

module.exports = app;