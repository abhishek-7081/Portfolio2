import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authPath = path.join(__dirname, '..', 'data', 'admin.json');

const defaultAdmin = {
  email: 'admin@portfolio.local',
  password: 'Portfolio@2026'
};

const readAuthFile = async () => {
  try {
    const source = await readFile(authPath, 'utf-8');
    return JSON.parse(source);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
};

export const ensureAdminUser = async () => {
  const current = await readAuthFile();

  if (current?.email && current?.passwordHash) {
    return current;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const email = process.env.ADMIN_EMAIL ?? (!isProduction ? defaultAdmin.email : '');
  const password =
    process.env.ADMIN_PASSWORD ?? (!isProduction ? defaultAdmin.password : '');

  if (!email || !password) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD must be defined before starting the server in production.'
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const record = {
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString()
  };

  await writeFile(authPath, JSON.stringify(record, null, 2));
  return record;
};

export const verifyAdminCredentials = async (email, password) => {
  const current = await ensureAdminUser();

  if (email.toLowerCase() !== current.email) {
    return null;
  }

  const isValid = await bcrypt.compare(password, current.passwordHash);
  return isValid ? { email: current.email } : null;
};
