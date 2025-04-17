const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_STRING)
  } catch (err) {
    console.error('error connecting to MONGO_DB', err)
    process.exit(1)
  }
}

module.exports = connectDB