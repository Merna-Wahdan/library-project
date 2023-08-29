const router = require('express').Router()
const Author = require('../models/Author.model')

router.get('/authors', (req, res, next) => {
    Author.find()
    .then(authorsFromDb => {
        const data = {
            authors: authorsFromDb
        }
        res.render('authors/authors-list.hbs', data )
    })
    .catch((e) => {
        console.log("Error getting list of authors from DB", e);
        next(e);
    });
})

module.exports = router;