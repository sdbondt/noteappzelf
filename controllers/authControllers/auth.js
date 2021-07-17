require('dotenv').config();
const Gebruiker = require('../../models/gebruiker');
const Note = require('../../models/notes');
const { validationResult } = require('express-validator');
const transporter = require('../../middleware/nodemailer');
const crypto = require('crypto');

exports.getIndex = (req, res, next) => {
    res.render('homepage', {
        pageTitle: 'Home',
        csrfToken: req.csrfToken(),       
    })
};

exports.getLogin = (req, res,  next) => {
    res.render('login', {
        pageTitle: 'Login',
        csrfToken: req.csrfToken(),
    })
};

exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await Gebruiker.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        res.cookie('auth_token', token);
        res.locals.isLoggedIn = user;
        res.render('home', {
            pageTitle: 'Home',
            email,
            id: user._id,
            csrfToken: req.csrfToken(),
        });
    } catch(e) {
        console.log('Login error.')
        console.log(e);
        res.send(e)
    }
};

exports.getRegister = (req, res, next) => {
    res.render('register', {
        pageTitle: 'Register',
        csrfToken: req.csrfToken(),
    })
};

exports.postRegister = async (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.send(errors)
    }

 const gebruiker = new Gebruiker({ email, password })
 try {
     await gebruiker.save();
     res.redirect('/login')
 } catch (e) {
     console.log('Register error')
     res.send(e);
 }
};

exports.getLogout = (req, res, next) => {
    res.render('logout', {
        pageTitle: 'Logout',
        csrfToken: req.csrfToken(),
    })
};

exports.postLogout = async(req, res, next) => {
    try {
        req.user.tokens = req.user.tokens.filter(( token ) => {
            return token.token !== req.token;
        });

        await req.user.save();
        res.redirect('/')
    } catch (e) {
        res.status(500).send()
    }
};

exports.getReset = (req, res, next) => {
    res.render('reset', {
        pageTitle: 'Forgot your password?',
        csrfToken: req.csrfToken(),
    })
};

exports.postReset = async (req, res, next) => {
    const { email } = req.body;
    try {
        const token = await crypto.randomBytes(32).toString('hex');
        const user = await Gebruiker.findOne({ email });
        if(!user) {
            return res.send('No such email address is available!');
        };
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        await user.save();
        await transporter.sendMail({
            to: email,
            from: process.env.EMAIL,
            subject: 'Reset request',
            html: `
        <p>Click here to set a new password: <a href="${process.env.HOME_URL}/reset/${token}" >LINK</a>
        `
        });
        res.redirect('/')
    } catch(e) {
        res.send(e)
    }
};

exports.getResetPage = async (req, res, next) => {
    const { token } = req.params;
    const user = await Gebruiker.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}});
    if (!user) {
       res.redirect('/')
    };

    res.render('resetpage', {
        pageTitle: 'Forgot your password?',
        csrfToken: req.csrfToken(),
        passwordToken: token,
        userId: user._id.toString(),
    })
};

exports.postResetPage = async (req, res, next) => {
    const { password, passwordToken, userId } = req.body;
    try {
        const user = await Gebruiker.findOne({ resetToken: passwordToken, _id: userId });
        user.password = password;
        user.resetToken = null;
        user.resetTokenExpiration = null;
        await user.save();
        res.redirect('/')
    } catch (e) {
        res.send(e)
    }
};

exports.getImage = (req, res, next) => {
    res.render('imageupload', {
        pageTitle: 'Upload an image',
        csrfToken: req.csrfToken(),
    })
};

exports.postImage = async (req, res, next) => {
    const image = req.file;
    const imageUrl = image.path;
    const user = req.user;
    user.imageUrl = imageUrl;
    
    try {
        await user.save();
        res.redirect('/')
    } catch (e) {
        res.send(e)
    }
    res.send('yeet')
};

exports.getUserImage = (req, res, next) => {
    const user = req.user;
    res.render('userimage', {
        user,
        pageTitle: 'Watch your image',
        csrfToken: req.csrfToken(),
    })
};

exports.getMe = (req, res, next) => {
    const user = req.user;
    res.render('me', {
        pageTitle: 'This is you!',
        user,
        csrfToken: req.csrfToken(),
    })
};
