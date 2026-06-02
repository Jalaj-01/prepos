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
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const intelligenceRoutes =
    require(
        './routes/intelligenceRoutes'
    );
const searchRoutes =
    require(
        "./routes/searchRoutes"
    );
const practiceSetRoutes =
    require(
        "./routes/practiceSetRoutes"
    );
const preparationTrackRoutes =
    require(
        "./routes/preparationTrackRoutes"
    );

const b2TestRoutes =
    require(
        "./routes/b2TestRoutes"
    );
const storageRoutes =
    require(
        "./routes/storageRoutes"
    );

const mainsQuestionRoutes =
    require(
        "./routes/mainsQuestionRoutes"
    );

const mainsAttemptRoutes =
    require(
        "./routes/mainsAttemptRoutes"
    );

const mainsAnalyticsRoutes =
    require(
        "./routes/mainsAnalyticsRoutes"
    );
const folderRoutes =
    require(
        "./routes/folderRoutes"
    );

const documentRoutes =
    require(
        "./routes/documentRoutes"
    );
const announcementRoutes =
    require(
        "./routes/announcementRoutes"
    );
const {

    generalLimiter,

    authLimiter,

    uploadLimiter,

    searchLimiter

} = require("./middleware/rateLimiter");
const globalSearchRoutes =
    require(
        "./routes/globalSearchRoutes"
    );
const adminToolsRoutes =
    require(
        "./routes/adminToolsRoutes"
    );

const {
    initCronJobs
} = require("./utils/cronJobs");
const app = express();

// 4. Middleware - FIXED CORS FOR YOUR URL
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "https://prepos-upsc.vercel.app"],
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
app.use('/api/bookmarks',bookmarkRoutes);
app.use(
    '/api/intelligence',
    intelligenceRoutes
);
app.use(
    "/api/search",
    searchRoutes
);
app.use(
    "/api/practice-sets",
    practiceSetRoutes
);
app.use(

    "/api/preparation-track",

    preparationTrackRoutes
);
app.use(
    "/api/b2-test",
    b2TestRoutes
);
app.use(
    "/api/storage",
    storageRoutes
);

app.use(
    "/api/mains/questions",
    mainsQuestionRoutes
);

app.use(
    "/api/mains/attempts",
    mainsAttemptRoutes
);

app.use(
    "/api/mains/analytics",
    mainsAnalyticsRoutes
);
app.use(
    "/api/folders",
    folderRoutes
);

app.use(
    "/api/documents",
    documentRoutes
);
app.use(
    "/api/announcements",
    announcementRoutes
);

app.use(
    "/api/admin-tools",
    adminToolsRoutes
);

// =========================
// RATE LIMITING
// =========================

// General limit on all /api routes

app.use("/api", generalLimiter);

// Strict limit on auth (prevent brute force)

app.use("/api/auth", authLimiter);

// Upload limits

app.use("/api/documents/upload", uploadLimiter);
app.use("/api/documents/bulk-upload", uploadLimiter);

// Search limits

app.use("/api/search", searchLimiter);
app.use("/api/documents/community/browse", searchLimiter);
app.use(
    "/api/global-search",
    globalSearchRoutes
);

// Base Route
app.get('/', (req, res) => {
    res.send('UPSC Prep OS API is running...');
});

// 6. Start Server
const PORT = process.env.PORT || 5000;

// =========================
// INITIALIZE CRON JOBS
// =========================

initCronJobs();
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});