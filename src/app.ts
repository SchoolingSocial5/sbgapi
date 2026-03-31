import express, { Application, RequestHandler } from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { handleError } from './utils/errorHandler'
import blogRoutes from './routes/blogRoutes'
import applicationRoutes from './routes/applicationRoutes'
import companyRoutes from './routes/companyRoutes'
import consumptionRoutes from './routes/consumptionRoutes'
import faqRoutes from './routes/faqRoutes'
import serviceRoutes from './routes/serviceRoutes'
import marketingRoutes from './routes/marketingRoutes'
import strategyRoutes from './routes/strategyRoutes'
import emailRoutes from './routes/emailRoutes'
import equipmentRoutes from './routes/equipmentRoutes'
import visitorRoutes from './routes/visitorRoutes'
import expenseRoutes from './routes/expenseRoutes'
import summaryRoutes from './routes/summaryRoutes'
import notificationRoutes from './routes/notificationRoutes'
import operationRoutes from './routes/operationRoutes'
import productRoutes from './routes/productRoutes'
import reviewRoutes from './routes/reviewRoutes'
import socialRoutes from './routes/socialRoutes'
import salaryRoutes from './routes/salaryRoutes'
import transactionRoutes from './routes/transactionRoutes'
import userRoutes from './routes/users/userRoutes'
// import { geoipMiddleware } from './middlewares/geoipMiddleware'
import { UsersSocket } from './routes/socket/usersSocket'
import { createActivity } from './controllers/activityController'

dotenv.config()

const app: Application = express()
const server = http.createServer(app)

// app.use(geoipMiddleware)

const requestLogger: RequestHandler = (req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url} from ${(req as any).country
    }`
  )
  next()
}

app.use(requestLogger)

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://awiza.netlify.app',
      'https://awizafarm.com',
    ],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'socket-id'],
  })
)

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://awiza.netlify.app',
      'https://awizafarm.com',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})

io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`)

  socket.on('message', async (data) => {
    switch (data.to) {
      case 'users':
        await UsersSocket(data)
        break
      case 'activity':
        await createActivity(data)
        break
      default:
        break
    }
  })

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected.: ${socket.id}`)
  })
})

app.use(bodyParser.json())

app.use('/api/v1/blogs', blogRoutes)
app.use('/api/v1/applications', applicationRoutes)
app.use('/api/v1/company', companyRoutes)
app.use('/api/v1/consumptions', consumptionRoutes)
app.use('/api/v1/marketing', marketingRoutes)
app.use('/api/v1/strategies', strategyRoutes)
app.use('/api/v1/faqs', faqRoutes)
app.use('/api/v1/services', serviceRoutes)
app.use('/api/v1/equipments', equipmentRoutes)
app.use('/api/v1/emails', emailRoutes)
app.use('/api/v1/salaries', salaryRoutes)
app.use('/api/v1/expenses', expenseRoutes)
app.use('/api/v1/notifications', notificationRoutes)
app.use('/api/v1/operations', operationRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/reviews', reviewRoutes)
app.use('/api/v1/transactions', transactionRoutes)
app.use('/api/v1/socials', socialRoutes)
app.use('/api/v1/summary', summaryRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/visitors', visitorRoutes)

app.use((req, res, next) => {
  handleError(res, 404, `Request not found: ${req.method} ${req.originalUrl}`)
  next()
})

export { app, server, io }
