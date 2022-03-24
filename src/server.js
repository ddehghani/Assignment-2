const mongodb_url = 'mongodb+srv://david:123david@cluster0.hvmuy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

const express = require('express')
const hbs = require('express-handlebars')
const {logger, listRoutes, logMiddleware} = require('./utils')

const server = express()
const port = process.env.port ?? 8889
const userController = require('./controllers/user.controller')
const bookController = require('./controllers/book.controller')

//Connect to Mongodb instance
require('./services/mongo.service')(mongodb_url)

//Templating
server.engine('handlebars', hbs.engine())
server.set('view engine', 'handlebars')
server.set('views', './src/views')

//Middleware
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(express.static('public'))
server.use(logMiddleware)

//user CRUD
server.get('/user/search', userController.search)
server.get('/user/create', (_, res) => res.render('user-create'))
server.post('/user/create', userController.create)
server.get('/user/update', (_, res) => res.render('user-update'))
server.post('/user/update',userController.update)
server.get('/user/delete', (_, res) => res.render('user-delete'))
server.post('/user/delete',userController.delete)

//book CRUD
server.get('/book/search', bookController.search)
server.get('/book/create', (_, res) => res.render('book-create'))
server.post('/book/create', bookController.create)
server.get('/book/update', (_, res) => res.render('book-update'))
server.post('/book/update',bookController.update)
server.get('/book/delete', (_, res) => res.render('book-delete'))
server.post('/book/delete',bookController.delete)

//borrowing functionality
server.get('/user/borrow', (_, res) => res.render('user-borrow'))
server.post('/user/borrow', userController.borrow)
server.get('/user/return', (_, res) => res.render('user-return'))
server.post('/user/return', userController.return)

//home page
server.get('/', (_, res) => res.render('homepage'))

//404 page
server.use((req, res) => res.status(404).render('404'))

//500 page
server.use((err, req, res, next) => res.status(500).render('500'))

server.listen(port, () => logger.info(`[express] listening on 127.0.0.1:${port}`))
module.exports = server