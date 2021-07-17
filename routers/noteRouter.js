const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createNote, postNote, getNotes, getNote, deleteNote, switchCompleted } = require('../controllers/noteController');

router.get('/createnote', auth, createNote);

router.post('/postnote', auth, postNote);

router.get('/allnotes', auth, getNotes);

router.get('/:id', auth, getNote);

router.post('/delete/:id', deleteNote);

router.post('/:id/completed', switchCompleted)

module.exports = router;