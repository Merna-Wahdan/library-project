const router = require('express').Router()

const Book = require('../models/Book.model')
const Author = require('../models/Author.model')

const isLoggedIn = require('../middleware/isLoggedIn')

// GET route to display the form
router.get('/books/create', isLoggedIn, (req, res, next) => {
    Author.find()
    .then(authorsFromDb => {
        const data = {
            authors: authorsFromDb
        }
        res.render('books/book-create.hbs', data )
    })
    .catch((e) => {
        console.log("Error getting list of authors from DB", e);
        next(e);
    });
})

// POST route to save a new book to the database in the books collection
router.post('/books/create', isLoggedIn, (req, res, next) => {

    const newBook = {
        title: req.body.title,
        description: req.body.description,
        author: req.body.author,
        rating: req.body.rating
    }


    Book.create(newBook)
    // .then(bookFromDB => console.log(`New book created: ${bookFromDB.title}`))
    .then(newBook => res.redirect('/books'))
    .catch(error => next(error));
});


router.get('/books/:bookId/edit', isLoggedIn, async (req, res, next) => {
    const {bookId} = req.params

    try{
        const bookDetails = await Book.findById(bookId)
        const authors = await Author.find()

        const data = {
            book: bookDetails,
            author: authors,
        }
        res.render('books/book-edit.hbs', data)
    }

    catch(error){
        next(error)
    }
})

router.post('/books/:bookId/edit', isLoggedIn, (req, res, next) =>{
    const {bookId} = req.params
    const {title, description, author, rating} = req.body


    Book.findByIdAndUpdate(bookId,{title, description, author, rating}, {new: true})
    .populate("author")
    .then(updatedBook => {
        res.redirect(`/books/${updatedBook.id}`)
    })
    .catch(e => next(e))
})


router.post('/books/:bookId/delete', isLoggedIn, (req, res, next) => {
    const {bookId} = req.params

    Book.findByIdAndDelete(bookId)
    .then(() => res.redirect('/books'))
    .catch(e => next(e))
})


    

// GET route to retrieve and display all the books
router.get('/books', (req, res, next) => {
    
    Book.find()
    .populate("author") //ask mongoose to populate document instead of id/ modify the res you got from mongoose
    .then(allTheBooksFromDB => {
        console.log('Retrieved books from DB:', allTheBooksFromDB );

        res.render('books/books-list.hbs', {books: allTheBooksFromDB})
    })
    .catch(error => {
        console.log('Error while getting the books from the DB: ', error);
    })

     // Call the error-middleware to display the error page to the user
    // next(error);
});

router.get('/books/:bookId', (req, res) => {
const { bookId } = req.params

Book.findById(bookId)
.populate("author")
.then(theBook => res.render('books/book-details.hbs', {book: theBook}))
.catch(error => {
    console.log("Error while retrieving book details: ", error);
})
    // next(error);

})

module.exports = router;