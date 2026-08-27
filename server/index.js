import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'node:path';
import { mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { ensureAdminUser, verifyAdminCredentials } from './lib/authStore.js';
import {
  allowedSections,
  readPortfolio,
  updatePortfolioSection
} from './lib/contentStore.js';
import { isPlainRecord, sanitizeDeep } from './lib/sanitize.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const uploadDir = path.join(__dirname, 'uploads');
const distDir = path.join(projectRoot, 'dist');

const PORT = Number(process.env.PORT ?? 4000);
const JWT_SECRET =
  process.env.JWT_SECRET ??
  (process.env.NODE_ENV === 'production'
    ? ''
    : 'development-only-jwt-secret-change-me');
const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured before starting the server.');
}

const app = express();

const ensureUploadDirectory = async () => {
  await mkdir(uploadDir, { recursive: true });
};

const createToken = (email) =>
  jwt.sign({ email }, JWT_SECRET, {
    expiresIn: '2h'
  });

const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 1000 * 60 * 60 * 2
};

const attachUser = (request, response, next) => {
  const token = request.cookies?.portfolio_token;

  if (!token) {
    request.user = null;
    return next();
  }

  try {
    request.user = jwt.verify(token, JWT_SECRET);
  } catch {
    request.user = null;
  }

  return next();
};

const requireAuth = (request, response, next) => {
  if (!request.user?.email) {
    return response.status(401).json({
      error: 'Authentication required.'
    });
  }

  return next();
};

const storage = multer.diskStorage({
  destination: async (_request, _file, callback) => {
    try {
      await ensureUploadDirectory();
      callback(null, uploadDir);
    } catch (error) {
      callback(error, uploadDir);
    }
  },
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    callback(null, fileName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new Error('Only image uploads are allowed.'));
      return;
    }

    callback(null, true);
  }
});

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS.'));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(attachUser);
app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/portfolio', async (_request, response, next) => {
  try {
    const data = await readPortfolio();
    response.json({ data });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', async (request, response, next) => {
  try {
    const email = String(request.body?.email ?? '').trim();
    const password = String(request.body?.password ?? '');

    if (!email || !password) {
      return response.status(400).json({
        error: 'Email and password are required.'
      });
    }

    const user = await verifyAdminCredentials(email, password);

    if (!user) {
      return response.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    response.cookie('portfolio_token', createToken(user.email), authCookieOptions);
    response.json({
      user
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/logout', (_request, response) => {
  response.clearCookie('portfolio_token', authCookieOptions);
  response.status(204).end();
});

app.get('/api/auth/me', requireAuth, (request, response) => {
  response.json({
    user: {
      email: request.user.email
    }
  });
});

app.put('/api/admin/sections/:sectionKey', requireAuth, async (request, response, next) => {
  try {
    const { sectionKey } = request.params;

    if (!allowedSections.has(sectionKey)) {
      return response.status(404).json({
        error: 'Unknown section.'
      });
    }

    const nextValue = sanitizeDeep(request.body?.value, sectionKey);

    if (
      ['meta', 'about', 'contact'].includes(sectionKey) &&
      !isPlainRecord(nextValue)
    ) {
      return response.status(400).json({
        error: 'Expected an object for this section.'
      });
    }

    if (
      ['skills', 'projects', 'experience', 'achievements', 'services', 'socials'].includes(
        sectionKey
      ) &&
      !Array.isArray(nextValue)
    ) {
      return response.status(400).json({
        error: 'Expected an array for this section.'
      });
    }

    const value = await updatePortfolioSection(sectionKey, nextValue);
    response.json({ data: value });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/uploads', requireAuth, (request, response, next) => {
  upload.single('image')(request, response, (error) => {
    if (error) {
      next(error);
      return;
    }

    if (!request.file) {
      response.status(400).json({
        error: 'No image file was uploaded.'
      });
      return;
    }

    response.status(201).json({
      url: `/uploads/${request.file.filename}`
    });
  });
});

app.use((error, _request, response, _next) => {
  const statusCode = error.statusCode ?? 500;
  response.status(statusCode).json({
    error: error.message || 'Something went wrong on the server.'
  });
});

const hasBuiltFrontend = async () => {
  try {
    await stat(distDir);
    return true;
  } catch {
    return false;
  }
};

const start = async () => {
  await ensureUploadDirectory();
  const adminRecord = await ensureAdminUser();

  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `Admin login ready: ${adminRecord.email} / ${process.env.ADMIN_PASSWORD ?? 'Portfolio@2026'}`
    );
  }

  if (await hasBuiltFrontend()) {
    app.use(express.static(distDir));
    app.use((request, response, next) => {
      if (request.path.startsWith('/api')) {
        next();
        return;
      }

      response.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Portfolio server listening on http://localhost:${PORT}`);
  });
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
