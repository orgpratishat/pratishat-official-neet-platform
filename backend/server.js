import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import testRoutes from './routes/tests.js';
import userRoutes from './routes/users.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

app.use(
    cors({
      origin: process.env.CLIENT_BASE_URL,
      methods: ['GET', 'POST', 'DELETE', 'PUT','PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Expires', 'Pragma'],
      credentials: true,
    })
  );
  
  app.use(cookieParser());

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/users', userRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://dev_db_user:preIuI4n0b46cyQN@cluster0.aticxv7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});