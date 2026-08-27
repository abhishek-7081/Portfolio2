import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const portfolioPath = path.join(__dirname, '..', 'data', 'portfolio.json');

export const allowedSections = new Set([
  'meta',
  'about',
  'skills',
  'projects',
  'experience',
  'achievements',
  'services',
  'socials',
  'contact'
]);

export const readPortfolio = async () => {
  const source = await readFile(portfolioPath, 'utf-8');
  return JSON.parse(source);
};

export const writePortfolio = async (portfolio) => {
  await writeFile(portfolioPath, JSON.stringify(portfolio, null, 2));
  return portfolio;
};

export const updatePortfolioSection = async (section, value) => {
  const current = await readPortfolio();
  current[section] = value;
  await writePortfolio(current);
  return current[section];
};
