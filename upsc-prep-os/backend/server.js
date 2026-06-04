const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// =========================
// 1. ENVIRONMENT VARIABLES
// =========================

dotenv.config();

// =========================
// 2. DATABASE CONNECTION
// =========================

connectDB();

// =========================
// 3. IMPORT ROUTES
// =========================

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
const intelligenceRoutes = require('./routes/intelligenceRoutes');
const searchRoutes = require("./routes/searchRoutes");
const practiceSetRoutes = require("./routes/practiceSetRoutes");
const preparationTrackRoutes = require("./routes/preparationTrackRoutes");

const b2TestRoutes = require("./routes/b2TestRoutes");
const storageRoutes = require("./routes/storageRoutes");

const mainsQuestionRoutes = require("./routes/mainsQuestionRoutes");
const mainsAttemptRoutes = require("./routes/mainsAttemptRoutes");
const mainsAnalyticsRoutes = require("./routes/mainsAnalyticsRoutes");

const folderRoutes = require("./routes/folderRoutes");
const documentRoutes = require("./routes/documentRoutes");

const announcementRoutes = require("./routes/announcementRoutes");
const globalSearchRoutes = require("./routes/globalSearchRoutes");
const adminToolsRoutes = require("./routes/adminToolsRoutes");
const contactRoutes = require("./routes/contactRoutes");

// NEW — Phase 5: Sticky Notes + Day Planner
const stickyNoteRoutes = require("./routes/stickyNoteRoutes");
const taskRoutes = require("./routes/taskRoutes");

// =========================
// 4. IMPORT MIDDLEWARE & UTILS
// =========================

const {

    generalLimiter,

    authLimiter,

    uploadLimiter,

    searchLimiter

} = require("./middleware/rateLimiter");

const {
    initCronJobs
} = require("./utils/cronJobs");

// =========================
// 5. CREATE APP
// =========================

const app = express();

// =========================
// 6. GLOBAL MIDDLEWARE
// =========================

app.use(cors({

    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://prepos-upsc.vercel.app"
    ],

    credentials: true
}));

app.use(express.json());

// =========================
// 7. RATE LIMITING
// (MUST come BEFORE routes)
// =========================

app.use("/api", generalLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/documents/upload", uploadLimiter);
app.use("/api/documents/bulk-upload", uploadLimiter);
app.use("/api/sticky-notes/upload-image", uploadLimiter);
app.use("/api/search", searchLimiter);
app.use("/api/documents/community/browse", searchLimiter);

// =========================
// 8. API ROUTES
// =========================

// AUTH & USER
app.use('/api/auth', authRoutes);

// PRELIMS QUESTIONS
app.use('/api/questions', questionRoutes);
app.use('/api/taxonomy', taxonomyRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/intelligence', intelligenceRoutes);

// PRACTICE & REVISION
app.use("/api/practice-sets", practiceSetRoutes);
app.use("/api/preparation-track", preparationTrackRoutes);
app.use('/api/revisions', revisionRoutes);

// MAINS
app.use("/api/mains/questions", mainsQuestionRoutes);
app.use("/api/mains/attempts", mainsAttemptRoutes);
app.use("/api/mains/analytics", mainsAnalyticsRoutes);

// VAULT + COMMUNITY
app.use("/api/folders", folderRoutes);
app.use("/api/documents", documentRoutes);

// STORAGE & UPLOADS
app.use("/api/b2-test", b2TestRoutes);
app.use("/api/storage", storageRoutes);

// SEARCH
app.use("/api/search", searchRoutes);
app.use("/api/global-search", globalSearchRoutes);

// ENGAGEMENT
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/vision', visionRoutes);
app.use('/api/books', bookRoutes);

// ADMIN & TOOLS
app.use("/api/announcements", announcementRoutes);
app.use("/api/admin-tools", adminToolsRoutes);

// PUBLIC
app.use("/api/contact", contactRoutes);

// NEW — Phase 5: Sticky Notes + Day Planner
app.use("/api/sticky-notes", stickyNoteRoutes);
app.use("/api/tasks", taskRoutes);

// syllabus
app.use("/api/syllabus", require("./routes/syllabusRoutes"));

app.use("/api/admin/users", require("./routes/adminUserRoutes"));

app.use("/api/feedback", require("./routes/feedbackRoutes"));

// =========================
// 9. BASE ROUTE
// =========================

app.get('/', (req, res) => {

    res.send('UPSC Prep OS API is running...');
});

// =========================
// 10. INITIALIZE CRON JOBS
// =========================

initCronJobs();

// =========================
// 11. START SERVER
// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`🚀 Server running on port ${PORT}`);
});