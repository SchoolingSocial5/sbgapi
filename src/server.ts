import dotenv from 'dotenv'
import { server } from './app'
import connectDB from './database/connection'

dotenv.config()

const PORT = process.env.PORT || 8080
const MONGO_URI =
  process.env.NODE_ENV === 'production'
    ? process.env.MONGO_URI_CLOUD || ''
    : process.env.MONGO_URI_CLOUD || ''

console.log(`Environment: ${process.env.NODE_ENV}`)

connectDB(MONGO_URI).then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  })
})