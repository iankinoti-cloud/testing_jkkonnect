// utils.js — pure utility functions shared across the app and unit tests

function normalizeKey(value) {
  return String(value || '').trim().toLowerCase();
}

function readStorageJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function writeStorageJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const SERVICE_LABEL_MAP = {
  'plumber,electrician': 'Plumbing & Electrical Repair',
  'painter': 'Painting',
  'house cleaner': 'House Cleaning',
  'welder': 'Welding',
  'carpenter': 'Carpentry',
  'carpentry': 'Carpentry',
  'mechanic': 'Mechanics',
  'electronics repair': 'Appliances Repair',
  'tailoring': 'Tailoring',
  'masonry': 'Masonry',
};

function expandSearchTerm(term) {
  const key = normalizeKey(term);
  const aliases = {
    carpenter: ['carpenter', 'carpentry', 'woodwork'],
    carpentry: ['carpentry', 'carpenter', 'woodwork'],
    plumber: ['plumber', 'plumbing'],
    plumbing: ['plumbing', 'plumber'],
    electrician: ['electrician', 'electrical'],
    electrical: ['electrical', 'electrician'],
    mechanic: ['mechanic', 'mechanics', 'motor vehicle mechanic'],
    mechanics: ['mechanics', 'mechanic', 'motor vehicle mechanic'],
    appliances: ['appliances', 'electronics repair'],
    appliance: ['appliance', 'electronics repair'],
    cleaning: ['cleaning', 'house cleaner'],
    cleaner: ['cleaner', 'house cleaner']
  };

  return aliases[key] || [key];
}

// CommonJS export for Node.js (unit tests)
if (typeof module !== 'undefined') {
  module.exports = { normalizeKey, readStorageJson, writeStorageJson, expandSearchTerm, SERVICE_LABEL_MAP };
}