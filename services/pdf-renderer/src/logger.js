import winston from 'winston'

const isProduction = process.env.NODE_ENV === 'production'

// Configuration logger Winston
export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    isProduction
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
  ),
  transports: [
    new winston.transports.Console(),
    // En production, on pourrait ajouter des transports vers des services externes
    ...(isProduction ? [
      new winston.transports.File({ 
        filename: '/tmp/pdf-service-error.log', 
        level: 'error' 
      }),
      new winston.transports.File({ 
        filename: '/tmp/pdf-service.log' 
      })
    ] : [])
  ]
})

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack })
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise })
  process.exit(1)
})
