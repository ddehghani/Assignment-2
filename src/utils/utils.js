const { createLogger, format, transports } = require('winston')

const logger = createLogger({
  level: process.env.DEBUG ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
    format.prettyPrint()
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
})

if (!['production', 'testing'].includes(process.env.NODE_ENV)) {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf(
          ({ level, message, timestamp, ...rest }) =>
            `${timestamp} ${level}: ${message} ${Object.keys(rest).length > 0 ? JSON.stringify(rest) : ''}`
        )
      ),
    })
  )
}

const listRoutes = (routes) => {
  return routes
    .filter((layer) => !!layer.route)
    .map(({ route }) => ({ path: route.path, method: Object.keys(route.methods)[0] }))
    .filter(({ path }) => path !== '/')
    .reverse()
}

const logMiddleware = (req, res, next) => {
  /**
   * Upstream
   */
  logger.debug(`[express] ->req | ${req.method} ${req.url}`)
  next()
  /**
   * Downstream
   */
  logger.debug(`[express] <-res | ${res.statusCode} ${req.url}`)
}

module.exports = {
  logger,
  listRoutes,
  logMiddleware,
}