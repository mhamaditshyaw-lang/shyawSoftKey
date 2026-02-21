require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const http = require('http');
const https = require('https');
const url = require('url');

const BASE = process.env.BASE_URL || 'http://localhost:3000';

function simpleFetch(endpoint, opts = {}) {
  return new Promise((resolve, reject) => {
    const fullUrl = BASE + endpoint;
    const parsed = url.parse(fullUrl);
    const lib = parsed.protocol === 'https:' ? https : http;
    const body = opts.body ? JSON.stringify(opts.body) : undefined;
    const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    const requestOptions = {
      method: opts.method || 'GET',
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.path,
      headers,
    };

    const req = lib.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsedBody = null;
        try { parsedBody = data ? JSON.parse(data) : null; } catch (e) { parsedBody = data; }
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, json: async () => parsedBody, raw: data });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function login(username, password) {
  const res = await simpleFetch('/api/auth/login', { method: 'POST', body: { username, password } });
  const body = await res.json();
  if (!res.ok) throw new Error(`Login failed: ${JSON.stringify(body)}`);
  return body.token;
}

async function createMeeting(token, weekNumber, year, meetingDate) {
  const res = await simpleFetch('/api/weekly-meetings', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: { weekNumber, year, meetingDate } });
  const body = await res.json();
  if (!res.ok) throw new Error(`Create meeting failed: ${JSON.stringify(body)}`);
  return body;
}

async function createTask(token, meetingId, task) {
  const res = await simpleFetch(`/api/weekly-meetings/${meetingId}/tasks`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: task });
  const body = await res.json();
  if (!res.ok) throw new Error(`Create task failed: ${JSON.stringify(body)}`);
  return body;
}

(async () => {
  try {
    console.log('Starting weekly meeting task flow test against', BASE);
    const adminUser = process.env.TEST_ADMIN_USER || 'admin';
    const adminPass = process.env.TEST_ADMIN_PASS || 'admin123';

    const token = await login(adminUser, adminPass);
    console.log('Logged in, token length:', token.length);

    const today = new Date();
    const meeting = await createMeeting(token, getWeekNumber(today), today.getFullYear(), today.toISOString());
    console.log('Created meeting:', meeting.id || meeting);

    const task = await createTask(token, meeting.id, {
      departmentName: 'TestDept',
      title: 'Automated test task',
      description: 'Created by automated test',
      priority: 'medium'
    });
    console.log('Created task:', task.id || task);
    console.log('Test succeeded');
    process.exit(0);
  } catch (e) {
    console.error('Test failed:', e.message || e);
    process.exit(1);
  }
})();

function getWeekNumber(d) {
  // Copy date so don't modify original
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay()||7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1)/7);
  return weekNo;
}
