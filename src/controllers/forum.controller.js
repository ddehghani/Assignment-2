const {Server} = require('socket.io')
const {logger} = require('../utils/utils')
const Book = require('../models/book.model')
const formatMessage = require('../utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('../utils/users');

const botName = 'Forum Server';

const setupForum = (server) => {
  try {
    const io = new Server(server) 
    logger.info(`[Forum] service up`)
    io.on('connection', socket => {
      socket.on('joinRoom', async ({ username, room }) => {
        const user = userJoin(socket.id, username, room)
        socket.join(user.room)
    
        // Welcome current user
        socket.emit('message', formatMessage(botName, `Hello, ${user.username}! Welcome to our forum!`))
    
        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message',formatMessage(botName, `${user.username} has joined the chat`))
        
        // Send users and room info
        const book = await Book.findOne({id: user.room}).lean()
        io.to(user.room).emit('roomUsers', {
          room: book.title,
          users: getRoomUsers(user.room)
        })
      })
  
      socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
      })
  
      socket.on('disconnect', async () => {
        const user = userLeave(socket.id)
  
        if (user) {
          io.to(user.room).emit('message',formatMessage(botName, `${user.username} has left the chat`))
    
          // Send users and room info
          const book = await Book.findOne({id: user.room}).lean()
          io.to(user.room).emit('roomUsers', {
            room: book.title,
            users: getRoomUsers(user.room)
          })
        }
      })
    })
  } catch (e) {
    logger.error(`[Forum] ${e.stack}`)
  }
}

const getForumForm = async (req, res) => {
  let {id} = req.query
  const books = await Book.find().lean()
  book = books.find(book => book.id == id)
  if (book)
     book.selected = true
  return res.render('forum',{books})
}

const joinChat = ({body}, res) => {
  const {username, room} = body
  res.render('chat', {username, room})
}

module.exports = {
  setupForum,
  getForumForm,
  joinChat
 }
