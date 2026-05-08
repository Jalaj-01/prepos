const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// 1. Load environment variables
dotenv.config();

// 2. Connect to Database
connectDB();

// 3. Import Routes
const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const taxonomyRoutes = require('./routes/taxonomyRoutes');
const attemptRoutes = require('./routes/attemptRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const bookRoutes = require('./routes/bookRoutes');
const revisionRoutes = require('./routes/revisionRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const visionRoutes = require('./routes/visionRoutes');


const app = express();

// 4. Middleware - FIXED CORS FOR YOUR URL
app.use(cors({
    origin: ["http://localhost:3000", "https://prepos-upsc.vercel.app"],
    credentials: true
}));
app.use(express.json());

// 5. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/taxonomy', taxonomyRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/books', bookRoutes); 
app.use('/api/revisions', revisionRoutes); 
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/vision', visionRoutes);

// Base Route
app.get('/', (req, res) => {
    res.send('UPSC Prep OS API is running...');
});

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});