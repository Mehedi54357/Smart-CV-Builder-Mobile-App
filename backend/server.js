const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const dotenv   = require('dotenv');
const connectDB = require('./src/config/db');
const logger   = require('./src/utils/logger');

dotenv.config();
connectDB();

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET','POST','PUT','DELETE','PATCH'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/auth',       require('./src/routes/auth.routes'));
app.use('/api/profile',    require('./src/routes/profile.routes'));
app.use('/api/education',  require('./src/routes/education.routes'));
app.use('/api/experience', require('./src/routes/experience.routes'));
app.use('/api/projects',   require('./src/routes/project.routes'));
app.use('/api/skills',     require('./src/routes/skills.routes'));
app.use('/api/cv',         require('./src/routes/cv.routes'));
app.use('/api/documents',  require('./src/routes/documents.routes'));
app.use('/api/payment',    require('./src/routes/payment.routes'));
app.use('/api/admin',      require('./src/routes/admin.routes'));

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString(), env: process.env.NODE_ENV }));
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, url: req.url, method: req.method });
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => logger.info(`🚀 SmartCV Server running on port ${PORT}`));
}

module.exports = app;
