const express = require('express');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  next();
});

app.use(express.static('public'));
app.use(bodyParser.json());

const changePosition = ["eyes", "eyebrows", "nose", "mouth", "hair-spike", "face-accessories", "face-details"];
const changeColor = ["body", "eyes", "eyebrows", "mouth", "hair-fringe", "hair-side", "hair-main", "hair-back", "hair-top", "hair-spike", "clothes", "clothes-accessories", "face-accessories", "hair-accessories"];
const isMandatory = ["body", "jaw", "eyes", "ears", "eyebrows", "nose", "mouth", "clothes", "background-color"];
const filepath = "./public/assets/";


app.get('/api/categories', (req, res, next) => {
    const categoriesThumbnailsPath = filepath + "categories";

    fs.readdir(categoriesThumbnailsPath, (err, files) => {
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
    const category = req.params.category;
    const categoryCapitalized = category.charAt(0).toUpperCase() + category.slice(1);
    const categoryFilepath = filepath + categoryCapitalized;

    fs.readdir(categoryFilepath, (err, files) => {
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

app.get('/api/random', async (req, res, next) => {
  const avatar = await getRandomAvatar();
  res.status(200).send(avatar);
});


const getRandomItemFromCategory = (filepath, category) => {
  
  const result = new Promise((resolve, reject) => fs.readdir(filepath + category, (err, images) => {
    if (err) {
        reject(err);
    }
    if (!images.length) {
      resolve();
    }
    const randomItem = images[Math.floor(Math.random() * images.length)];
    resolve({
      id: randomItem,
      imageUrl: `http://localhost:3001/assets/${category}/${randomItem}`,
      category: category.toLowerCase(),
    });
  }))

  return result;
};

const getRandomAvatar = () => {
  return new Promise((resolve, reject) => {

      fs.readdir(filepath, async (err, folders) => {
          if (err) {
              reject(new Error("Cannot read folder"));
          }

          const optionalCategories = [];
          const promiseArray = [];
          
          folders.forEach(folder => {
            if (folder !== 'categories' && isMandatory.includes(folder.toLowerCase()) || folder === 'Hair-main') {
              promiseArray.push(
                getRandomItemFromCategory(filepath, folder)
              )
            } else {
              if (folder !== 'categories') {
                optionalCategories.push(folder);
              }
            }
          });

          const optionalItems = getRandomOptionalItems(optionalCategories);
          promiseArray.push(...optionalItems);

          const results = await Promise.all(promiseArray);
          resolve(results.filter((result) => result !== undefined));
      });
  });
};

const getRandomOptionalItems = (optionalCategories) => {

  const shuffleArray = optionalCategories.sort(() => 0.5 - Math.random() );
  const randomOptionalCategories = shuffleArray.slice(0, 5);
  const results = [];

  randomOptionalCategories.forEach((category) => {
    results.push(
      getRandomItemFromCategory(filepath, category)
    )
  })

  return results;
}



module.exports = app;