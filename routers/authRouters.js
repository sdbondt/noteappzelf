const express = require('express');
const router = express.Router();
const {getIndex, getLogin, postLogin, getRegister, postRegister, getLogout, postLogout, getMe, getReset, postReset, getResetPage, 
  postResetPage, getImage, postImage, getUserImage} = require('../controllers/authControllers/auth');
const  auth = require('../middleware/auth');
const { check, body } = require('express-validator');

router.get('/', getIndex);

router.get('/register', getRegister);

router.post('/register',
    [
        check('email', 'Email is required')
            .isEmail(),
            check('password', 'Password is requried')
            .isLength({ min: 6 })
            .withMessage('Password length should be at least 6'),
            body('password').custom((value, { req }) => {
                if (value !== req.body.confirmpassword) {
                  throw new Error('Password confirmation does not match password');
                }
            
                // Indicates the success of this synchronous custom validator
                return true;
              }),
    ],
    postRegister);

router.get('/login', getLogin);

router.post('/login', postLogin);

router.get('/logout',auth, getLogout);

router.post('/logout', auth, postLogout)

router.get('/me', auth, getMe);

router.get('/reset', getReset);

router.post('/reset', postReset);

router.get('/reset/:token', getResetPage);

router.post('/resetpassword', postResetPage);

router.get('/image', auth, getImage);

router.post('/image', auth, postImage);

router.get('/userimage', auth, getUserImage);

module.exports = router;