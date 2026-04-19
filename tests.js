// JKKonnect unit tests — run with: node tests.js

// ─── Mock browser globals ─────────────────────────────────────────────────────
const _store = {};
global.localStorage = {
  getItem(k)    { return Object.prototype.hasOwnProperty.call(_store, k) ? _store[k] : null; },
  setItem(k, v) { _store[k] = String(v); },
  removeItem(k) { delete _store[k]; },
  clear()       { Object.keys(_store).forEach(k => delete _store[k]); },
};

// ─── Load utils under test ────────────────────────────────────────────────────
const { normalizeKey, readStorageJson, writeStorageJson, expandSearchTerm, SERVICE_LABEL_MAP } = require('./utils.js');

// ─── Minimal test framework ───────────────────────────────────────────────────
const PASS = '\x1b[32mPASS\x1b[0m';
const FAIL = '\x1b[31mFAIL\x1b[0m';

let totalPass = 0, totalFail = 0;

function describe(suiteName, fn) {
  console.log(`\n  ${suiteName}`);
  fn();
}

function it(name, fn) {
  try {
    fn();
    console.log(`    ${PASS}  ${name}`);
    totalPass++;
  } catch (err) {
    console.log(`    ${FAIL}  ${name}`);
    console.log(`          \x1b[90m→ ${err.message}\x1b[0m`);
    totalFail++;
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected)
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected))
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toContain(item) {
      if (!Array.isArray(actual) || !actual.includes(item))
        throw new Error(`Expected array to contain ${JSON.stringify(item)}, got ${JSON.stringify(actual)}`);
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected truthy, got ${JSON.stringify(actual)}`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`Expected falsy, got ${JSON.stringify(actual)}`);
    },
  };
}

// ─── Test suites ──────────────────────────────────────────────────────────────

describe('normalizeKey', () => {
  it('lowercases uppercase strings', () => {
    expect(normalizeKey('HELLO')).toBe('hello');
  });
  it('trims leading and trailing whitespace', () => {
    expect(normalizeKey('  hello  ')).toBe('hello');
  });
  it('handles mixed case and whitespace', () => {
    expect(normalizeKey('  CaRpEnTeR  ')).toBe('carpenter');
  });
  it('returns empty string for null', () => {
    expect(normalizeKey(null)).toBe('');
  });
  it('returns empty string for undefined', () => {
    expect(normalizeKey(undefined)).toBe('');
  });
  it('returns empty string for empty string', () => {
    expect(normalizeKey('')).toBe('');
  });
  it('coerces numbers to string', () => {
    expect(normalizeKey(42)).toBe('42');
  });
});

describe('readStorageJson', () => {
  it('returns fallback when key is absent', () => {
    localStorage.clear();
    expect(readStorageJson('missing_key', [])).toEqual([]);
  });
  it('parses valid JSON from storage', () => {
    localStorage.setItem('test_obj', JSON.stringify({ role: 'fundi' }));
    expect(readStorageJson('test_obj', null)).toEqual({ role: 'fundi' });
  });
  it('returns fallback when stored value is malformed JSON', () => {
    localStorage.setItem('bad_json', '{not valid}');
    expect(readStorageJson('bad_json', 'default')).toBe('default');
  });
  it('returns null fallback when key is absent', () => {
    localStorage.clear();
    expect(readStorageJson('nonexistent', null)).toBe(null);
  });
});

describe('writeStorageJson + readStorageJson round-trip', () => {
  it('stores and retrieves a string value', () => {
    writeStorageJson('rt_string', 'hello');
    expect(readStorageJson('rt_string', null)).toBe('hello');
  });
  it('stores and retrieves an array', () => {
    writeStorageJson('rt_array', [1, 2, 3]);
    expect(readStorageJson('rt_array', null)).toEqual([1, 2, 3]);
  });
  it('stores and retrieves a nested object', () => {
    writeStorageJson('rt_obj', { name: 'Wanjiku', role: 'client' });
    expect(readStorageJson('rt_obj', null)).toEqual({ name: 'Wanjiku', role: 'client' });
  });
});

describe('expandSearchTerm', () => {
  it('returns aliases for "carpenter"', () => {
    const t = expandSearchTerm('carpenter');
    expect(t).toContain('carpenter');
    expect(t).toContain('carpentry');
    expect(t).toContain('woodwork');
  });
  it('returns aliases for "carpentry"', () => {
    const t = expandSearchTerm('carpentry');
    expect(t).toContain('carpenter');
    expect(t).toContain('carpentry');
  });
  it('is case-insensitive (uppercase input)', () => {
    expect(expandSearchTerm('CARPENTER')).toContain('carpenter');
  });
  it('is case-insensitive (mixed case)', () => {
    const t = expandSearchTerm('Plumber');
    expect(t).toContain('plumber');
    expect(t).toContain('plumbing');
  });
  it('returns aliases for "plumbing"', () => {
    expect(expandSearchTerm('plumbing')).toContain('plumber');
  });
  it('returns aliases for "electrician"', () => {
    expect(expandSearchTerm('electrician')).toContain('electrical');
  });
  it('returns aliases for "mechanic"', () => {
    const t = expandSearchTerm('mechanic');
    expect(t).toContain('mechanics');
    expect(t).toContain('motor vehicle mechanic');
  });
  it('returns aliases for "cleaning"', () => {
    expect(expandSearchTerm('cleaning')).toContain('house cleaner');
  });
  it('returns the term itself for unknown words', () => {
    expect(expandSearchTerm('unknownservice')).toEqual(['unknownservice']);
  });
  it('returns the term itself for empty string', () => {
    expect(expandSearchTerm('')).toEqual(['']);
  });
  it('trims whitespace before matching', () => {
    expect(expandSearchTerm('  carpenter  ')).toContain('carpentry');
  });
});

describe('SERVICE_LABEL_MAP', () => {
  it('maps "carpenter" to "Carpentry"', () => {
    expect(SERVICE_LABEL_MAP['carpenter']).toBe('Carpentry');
  });
  it('maps "carpentry" to "Carpentry"', () => {
    expect(SERVICE_LABEL_MAP['carpentry']).toBe('Carpentry');
  });
  it('maps "painter" to "Painting"', () => {
    expect(SERVICE_LABEL_MAP['painter']).toBe('Painting');
  });
  it('maps "masonry" to "Masonry"', () => {
    expect(SERVICE_LABEL_MAP['masonry']).toBe('Masonry');
  });
  it('maps "electronics repair" to "Appliances Repair"', () => {
    expect(SERVICE_LABEL_MAP['electronics repair']).toBe('Appliances Repair');
  });
  it('returns undefined for unknown keys', () => {
    expect(SERVICE_LABEL_MAP['unknown']).toBe(undefined);
  });
});

// ─── Summary ──────────────────────────────────────────────────────────────────
const total = totalPass + totalFail;
console.log('\n' + '─'.repeat(40));
if (totalFail === 0) {
  console.log(`\x1b[32m  All ${total} tests passed.\x1b[0m\n`);
} else {
  console.log(`\x1b[31m  ${totalFail} failed, ${totalPass} passed (${total} total).\x1b[0m\n`);
  process.exit(1);
}
