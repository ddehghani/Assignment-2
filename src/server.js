const mongodb_url = ''

const express = require('express')
const hbs = require('express-handlebars')
const http = require('http')
const {logger, listRoutes, logMiddleware} = require('./utils/utils')

const app = express()
const server = http.createServer(app)
const port = process.env.port ?? 8889
const forumController = require('./controllers/forum.controller')
const userController = require('./controllers/user.controller')
const bookController = require('./controllers/book.controller')

//Connect to Mongodb instance
require('./services/mongo.service')(mongodb_url)

//Templating
app.engine('handlebars', hbs.engine())
app.set('view engine', 'handlebars')
app.set('views', './src/views')

//Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(logMiddleware)

//Setup the forum service
forumController.setupForum(server)
app.get('/forum', forumController.getForumForm)
app.post('/forum', forumController.joinChat)

//user CRUD
app.get('/user/search', userController.search)
app.get('/user/create', (_, res) => res.render('user-create'))
app.post('/user/create', userController.create)
app.get('/user/update', (_, res) => res.render('user-update'))
app.post('/user/update',userController.update)
app.get('/user/delete', (_, res) => res.render('user-delete'))
app.post('/user/delete',userController.delete)

//book CRUD
app.get('/book/search', bookController.search)
app.get('/book/create', (_, res) => res.render('book-create'))
app.post('/book/create', bookController.create)
app.get('/book/update', (_, res) => res.render('book-update'))
app.post('/book/update',bookController.update)
app.get('/book/delete', (_, res) => res.render('book-delete'))
app.post('/book/delete',bookController.delete)

//borrowing functionality
app.get('/user/borrow', (_, res) => res.render('user-borrow'))
app.post('/user/borrow', userController.borrow)
app.get('/user/return', (_, res) => res.render('user-return'))
app.post('/user/return', userController.return)

//home page
app.get('/', (_, res) => res.render('homepage'))

//404 page
app.use((req, res) => res.status(404).render('404'))

//500 page
app.use((err, req, res, next) => res.status(500).render('500'))

server.listen(port, () => logger.info(`Server listening on localhost:${port}`))
module.exports = app
