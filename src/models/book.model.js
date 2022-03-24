const {Schema, model} = require('mongoose')
const {logger} = require('../utils')

const BookSchema = new Schema({
  id: {
    type: Number,
    unique: true,
    required: [true, 'id is required']
  },
  title: {
    type: String,
    required: [true, 'title is required'],
    unique: true
  },
  inventory_count: {
    type: Number,
    default: 1,
    min: [0, 'inventory_count can not be negative']
  }
})

const Book = model('Book', BookSchema)
logger.debug('[mongodb] registered Book model')
module.exports = Book
