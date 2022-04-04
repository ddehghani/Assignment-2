const {Schema, model} = require('mongoose')
const {logger} = require('../utils/utils')

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true,'username is required'],
    unique: true
  },
  phone: {
    type: String,
    required: [true, 'phone number is required'],
        match: [/\d{3}-\d{3}-\d{4}/, 'invalid phone number. Should be of the form xxx-xxx-xxxx']
  },
  borrowed_books: [{type: Schema.Types.ObjectId, ref: 'Book'}]
})

const User = model('User', UserSchema)
logger.debug('[mongodb] registered User model')
module.exports = User
