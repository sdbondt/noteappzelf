require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const csrfProtection = csrf({ cookie: true });
const authRouter = require('../passportauth/routers/authrouters');
const noteRouter = require('../passportauth/routers/noterouter');

const app = express();
const PORT = process.env.PORT || 5000;
const rootDir = path.dirname(require.main.filename);
const viewsPath = path.join(rootDir, 'views');
const publicPath = path.join(rootDir, 'public');
const imagesPath = path.join(rootDir, 'images');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + '-' + file.originalname)
  }
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const options = {
  storage: fileStorage,
  fileFilter: fileFilter,
}

app.use(express.static(publicPath));
app.use('/images',express.static(imagesPath));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', viewsPath);
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(multer(options).single('image'))
app.get('/', csrfProtection, function(req, res, next) {
    // Pass the Csrf Token
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next()
  });

app.use((req, res, next) => {
  let user = req.user;
  res.locals.isLoggedIn = req.user || null;
  next()
});
app.use('/', csrfProtection, authRouter);
app.use('/notes', csrfProtection, noteRouter);

mongoose.connect(process.env.MONGO_DB, { useUnifiedTopology: true, useNewUrlParser: true })

app.listen(PORT, () => {
    console.log(`App is running on ${PORT}`);
})