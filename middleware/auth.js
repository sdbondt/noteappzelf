const jwt = require('jsonwebtoken');
const Gebruiker = require('../models/gebruiker');

const auth = async (req, res, next) => {
    try {
        
        const token = req.cookies['auth_token'];
        if (!token) {
           return res.redirect('/login')
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Gebruiker.findOne({ _id: decoded._id, 'tokens.token': token });
        
        if (!user) {
           return res.redirect('/login');
        };
        res.locals.isLoggedIn = true;
        req.token = token;
        req.user = user;
        next()
    } catch (e) {
        res.status(401).send({error: 'Please authenticate.' })
    }
};

module.exports = auth;