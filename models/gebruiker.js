require('dotenv').config();
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const gebruikerSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required:true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    imageUrl: String,
    buffer: {
        type: Buffer,
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }],
}, { timestamps: true });

gebruikerSchema.pre('save', async function(next) {
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next();
});

gebruikerSchema.statics.findByCredentials = async (email, password) => {
    const user = await Gebruiker.findOne({ email });
    if(!user) {
        throw new Error('Unable to login')
    };

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
        throw new Error('Unable to login')
    };
    return user;
};

gebruikerSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {expiresIn: '7 days'} );

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
    
};
gebruikerSchema.virtual('notes', {
    ref: 'Note',
    localField: '_id',
    foreignField: 'owner',
});


const Gebruiker = model('Gebruiker', gebruikerSchema);
module.exports = Gebruiker;