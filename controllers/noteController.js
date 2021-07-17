require('dotenv').config();
const Gebruiker = require('../models/gebruiker');
const Note = require('../models/notes');

exports.createNote = (req, res, next) => {
    res.render('createnote', {
        pageTitle: 'Create a note!',
        csrfToken: req.csrfToken(),    
    })
};

exports.postNote = async (req, res, next) => {
    const { title, description } = req.body;
    const note = new Note({
        owner: req.user._id,
        title,
        description,
    })
    try {
        await note.save();
        res.redirect('/me')
    } catch(e) {
        res.send(e)
    }
};

exports.getNotes = async (req, res, next) => {
    let { completed } = req.query;
    let page = +req.query.page || 1;
    const pp = parseInt(process.env.ITEMS_PER_PAGE);
    const skip = pp * page - pp;
    
    let myFilter = {};
    if (completed === 'yes')  {
        myFilter.completed = true;
    };
    if (completed === 'no') {
        myFilter.completed = false;
    };
    try {
        const user = await Gebruiker.findById(req.user._id);
        
        // gewoon om totalnotes kunnen berekenen, eigenlijk inefficient
        const allNotes = await Note.find({owner: user._id});
        const userWithNotes = await user.populate({
            path: 'notes',
            match: myFilter,
            options: {
                skip: parseInt(skip),
                limit: process.env.ITEMS_PER_PAGE,
            }
        }).execPopulate();
        const { notes } = userWithNotes;
        const totalNotes = allNotes.length;
        const lastPage = Math.ceil(totalNotes / pp);
        res.render('notes', {
            notes: notes || [],
            pageTitle: 'My tasks',
            csrfToken : req.csrfToken(),
            currentPage: page,
            hasNextPage: pp * page < totalNotes,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage,

        });
    } catch (e) {
        res.send(e)
    };
    
};

exports.getNote = async (req, res, next) => {
 const { id } = req.params;
 try {
    const note = await Note.findById(id);
    
    res.render('note', {
        note,
        csrfToken: req.csrfToken(),
        pageTitle: note.title,
    })
 } catch (e) {
     res.send(e)
 }
};

exports.deleteNote = async (req, res, next) => {
    const { id } = req.params;
    try {
        await Note.findByIdAndRemove(id);
        res.redirect('/notes/allnotes')
    } catch (e) {
        res.send(e)
    }
};

exports.switchCompleted = async (req, res, next) => {
    const { id } = req.params;
    try {
        const note = await Note.findById(id);
        note.completed = !note.completed;
        await note.save();
        res.redirect(`/notes/${note._id}`)
    } catch (e) {
        res.send(e)
    }
}