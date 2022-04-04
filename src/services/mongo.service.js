const mongoose = require('mongoose')
const {logger} = require('../utils/utils')

module.exports = (url) => {
  if (!url) {
    logger.error('No mongodb connection url provided')
  }
  /**
   * Override default mongodb connection string from environment
   * i.e. `MONGODB_URL=mongodb://root... npm start`
   */
  if (process.env.MONGODB_URL) {
    url = process.env.MONGODB_URL
  }

  mongoose
    .connect(url)
    .then((db) => {
      logger.info(`[mongodb] connected to ${url.split('@')[1]} in state=${db.connection.readyState}`)
    })
    .catch((err) => {
      if (err.stack.startsWith('MongoServerError: Authentication failed')) {
        logger.error('[mongodb] invalid database credentials', { mongodb_url: url })
      } else {
        logger.error(`[mongodb] ${err.stack}`)
      }
    })
}
