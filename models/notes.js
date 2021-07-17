const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const noteSchema = new Schema(
    {
        description: {
            type: String,
            required: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Gebruiker',
        }
    }, {
        timestamps: true,
    }
)

const Note = model('Note', noteSchema);

module.exports = Note;