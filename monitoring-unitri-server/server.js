// Monitoring Penghunian Rusun UNITRI — server sederhana (Node.js + Express, data JSON)
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SECRET_FILE = path.join(DATA_DIR, 'secret.key');
const SESSION_HOURS = 12;

fs.mkdirSync(DATA_DIR, { recursive: true });

// ---------- kunci rahasia sesi (dibuat sekali, disimpan di folder data) ----------
let SECRET = process.env.SESSION_SECRET;
if (!SECRET) {
  if (!fs.existsSync(SECRET_FILE)) fs.writeFileSync(SECRET_FILE, crypto.randomBytes(32).toString('hex'));
  SECRET = fs.readFileSync(SECRET_FILE, 'utf8').trim();
}

// ---------- password ----------
function hashPw(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  return salt + ':' + crypto.scryptSync(pw, salt, 64).toString('hex');
}
function checkPw(pw, stored) {
  const [salt, h] = String(stored).split(':');
  if (!salt || !h) return false;
  const a = Buffer.from(h, 'hex'), b = crypto.scryptSync(pw, salt, 64);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ---------- tata letak dari ABD ----------
const SOUTH = {
  1: ['tangga', 'u', 'u', 'R. Serbaguna', 'Lobby', 'R. Pengelola', 'u', 'u', 'tangga'],
  2: ['tangga', 'u', 'u', 'u', 'R. Bersama', 'u', 'u', 'u', 'tangga'],
  3: ['tangga', 'u', 'u', 'u', 'R. Bersama', 'u', 'u', 'u', 'tangga'],
};
function buildUnits() {
  const us = [];
  for (const lt of [1, 2, 3]) {
    let n = 0;
    const add = (row, bay) => {
      n++;
      const dif = lt === 1 && row === 'N' && (bay === 3 || bay === 5);
      us.push({ id: `L${lt}-${String(n).padStart(2, '0')}`, lt, row, bay, tipe: dif ? 'Difabel' : 'Standar', kap: dif ? 2 : 4, kondisi: 'Baik', cat: '' });
    };
    for (let b = 0; b < 9; b++) add('N', b);
    SOUTH[lt].forEach((s, b) => { if (s === 'u') add('S', b); });
  }
  return us;
}
function dummyData() {
  let x = 7; const r = () => (x = (x * 16807) % 2147483647) / 2147483647;
  const A = ['Ayu', 'Bunga', 'Citra', 'Dewi', 'Eka', 'Fitri', 'Gita', 'Hana', 'Intan', 'Jelita', 'Kirana', 'Lestari', 'Maya', 'Nadia', 'Okta', 'Putri', 'Rani', 'Sari', 'Tari', 'Wulan'];
  const B = ['Anggraini', 'Pratiwi', 'Wahyuni', 'Lestari', 'Rahayu', 'Kusuma', 'Permata', 'Safitri', 'Utami', 'Puspita'];
  const units = buildUnits(), res = []; let k = 0;
  units.forEach(u => {
    const p = r();
    if (u.id === 'L3-07' || u.id === 'L2-12') { u.kondisi = 'Rusak'; u.cat = 'Rembesan air di dinding kamar mandi (contoh)'; return; }
    const n = p < .12 ? 0 : p < .35 ? Math.max(1, u.kap - 1 - Math.floor(r() * 2)) : u.kap;
    for (let i = 0; i < n; i++) {
      k++;
      res.push({ id: 'r' + k, unit: u.id, nama: A[Math.floor(r() * A.length)] + ' ' + B[Math.floor(r() * B.length)], nid: 'DUM-' + String(k).padStart(4, '0'),
        masuk: `2025-0${8 + Math.floor(r() * 2)}-${String(1 + Math.floor(r() * 27)).padStart(2, '0')}`, keluar: null });
    }
  });
  return { units, res, nextId: k + 1 };
}
const DEFAULT_USERS = [
  { username: 'admin', password: 'admin123', role: 'admin', nama: 'Admin Balai P3KP Jawa IV' },
  { username: 'pengelola', password: 'unitri123', role: 'pengelola', nama: 'Pengelola Rusun UNITRI' },
  { username: 'pimpinan', password: 'lihat123', role: 'viewer', nama: 'Pimpinan' },
];

// ---------- penyimpanan ----------
let DB;
function save() {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(DB, null, 1));
  fs.renameSync(tmp, DB_FILE);
}
if (fs.existsSync(DB_FILE)) DB = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
else {
  DB = { ...dummyData(), users: DEFAULT_USERS.map(u => ({ username: u.username, role: u.role, nama: u.nama, pw: hashPw(u.password) })),
    log: [{ t: new Date().toISOString(), who: 'Sistem', msg: 'Aplikasi dipasang, data contoh dibuat' }] };
  save();
}
function addLog(user, msg) {
  DB.log.unshift({ t: new Date().toISOString(), who: user.nama, msg });
  if (DB.log.length > 2000) DB.log.length = 2000;
}

// ---------- sesi (token bertanda tangan di cookie) ----------
function sign(data) { return crypto.createHmac('sha256', SECRET).update(data).digest('base64url'); }
function makeToken(username) {
  const data = Buffer.from(JSON.stringify({ u: username, exp: Date.now() + SESSION_HOURS * 3600e3 })).toString('base64url');
  return data + '.' + sign(data);
}
function readToken(tok) {
  if (!tok) return null;
  const [data, sig] = tok.split('.');
  if (!data || !sig) return null;
  const good = sign(data);
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  try { const p = JSON.parse(Buffer.from(data, 'base64url').toString()); return p.exp > Date.now() ? p.u : null; } catch { return null; }
}
function getCookie(req, name) {
  const m = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : null;
}

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '100kb' }));
app.use((req, res, next) => { res.set('X-Content-Type-Options', 'nosniff'); res.set('X-Frame-Options', 'SAMEORIGIN'); next(); });

function auth(req, res, next) {
  const u = readToken(getCookie(req, 'sesi'));
  const user = u && DB.users.find(x => x.username === u);
  if (!user) return res.status(401).json({ error: 'Silakan login' });
  req.user = user; next();
}
const canEdit = u => u.role === 'admin' || u.role === 'pengelola';
const only = (...roles) => (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Tidak punya hak akses' });

// pembatas percobaan login sederhana
const fails = new Map();
const router = express.Router();

router.post('/api/login', (req, res) => {
  const ip = req.ip, f = fails.get(ip) || { n: 0, until: 0 };
  if (f.until > Date.now()) return res.status(429).json({ error: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.' });
  const { username = '', password = '' } = req.body || {};
  const user = DB.users.find(u => u.username === String(username).trim().toLowerCase());
  if (!user || !checkPw(String(password), user.pw)) {
    f.n++; if (f.n >= 5) { f.until = Date.now() + 5 * 60e3; f.n = 0; } fails.set(ip, f);
    return res.status(401).json({ error: 'Username atau password salah' });
  }
  fails.delete(ip);
  res.cookie('sesi', makeToken(user.username), { httpOnly: true, sameSite: 'lax', secure: req.secure, maxAge: SESSION_HOURS * 3600e3, path: '/' });
  res.json({ username: user.username, role: user.role, nama: user.nama });
});
router.post('/api/logout', (req, res) => { res.clearCookie('sesi', { path: '/' }); res.json({ ok: true }); });
router.get('/api/me', auth, (req, res) => res.json({ username: req.user.username, role: req.user.role, nama: req.user.nama }));

router.get('/api/state', auth, (req, res) => {
  const viewer = req.user.role === 'viewer';
  res.json({
    units: DB.units,
    res: viewer ? DB.res.map(p => ({ id: p.id, unit: p.unit, keluar: p.keluar })) : DB.res, // viewer: tanpa data pribadi
    log: viewer ? [] : DB.log.slice(0, 300),
  });
});

const unitOf = id => DB.units.find(u => u.id === id);
const activeIn = uid => DB.res.filter(p => p.unit === uid && !p.keluar).length;
const clean = (s, n) => String(s ?? '').trim().slice(0, n);

router.post('/api/residents', auth, only('admin', 'pengelola'), (req, res) => {
  const u = unitOf(req.body.unit);
  if (!u) return res.status(400).json({ error: 'Unit tidak ditemukan' });
  if (u.kondisi === 'Rusak') return res.status(400).json({ error: 'Unit berstatus rusak' });
  if (activeIn(u.id) >= u.kap) return res.status(400).json({ error: 'Unit sudah penuh' });
  const nama = clean(req.body.nama, 100), nid = clean(req.body.nid, 40), masuk = clean(req.body.masuk, 10);
  if (!nama || !nid || !/^\d{4}-\d{2}-\d{2}$/.test(masuk)) return res.status(400).json({ error: 'Nama, ID, dan tanggal masuk wajib diisi' });
  const p = { id: 'r' + (DB.nextId++), unit: u.id, nama, nid, masuk, keluar: null };
  DB.res.push(p); addLog(req.user, `${nama} masuk ke ${u.id}`); save();
  res.json(p);
});
router.post('/api/residents/:id/keluar', auth, only('admin', 'pengelola'), (req, res) => {
  const p = DB.res.find(x => x.id === req.params.id && !x.keluar);
  if (!p) return res.status(404).json({ error: 'Penghuni tidak ditemukan' });
  p.keluar = new Date().toISOString().slice(0, 10);
  addLog(req.user, `${p.nama} keluar dari ${p.unit}`); save();
  res.json(p);
});
router.put('/api/units/:id', auth, only('admin', 'pengelola'), (req, res) => {
  const u = unitOf(req.params.id);
  if (!u) return res.status(404).json({ error: 'Unit tidak ditemukan' });
  const ch = [];
  if (['Baik', 'Rusak'].includes(req.body.kondisi) && req.body.kondisi !== u.kondisi) { u.kondisi = req.body.kondisi; ch.push('kondisi ' + u.kondisi); }
  if (typeof req.body.cat === 'string' && clean(req.body.cat, 300) !== u.cat) { u.cat = clean(req.body.cat, 300); ch.push('catatan'); }
  if (req.body.kap !== undefined && req.user.role === 'admin') {
    const k = Math.round(+req.body.kap);
    if (k >= 1 && k <= 8 && k !== u.kap) { u.kap = k; ch.push('kapasitas ' + k); }
  }
  if (ch.length) { addLog(req.user, `${u.id}: ${ch.join(', ')} diubah`); save(); }
  res.json(u);
});

// akun
router.get('/api/users', auth, only('admin'), (req, res) => res.json(DB.users.map(u => ({ username: u.username, role: u.role, nama: u.nama }))));
router.put('/api/users/:username/password', auth, (req, res) => {
  const target = DB.users.find(u => u.username === req.params.username);
  if (!target) return res.status(404).json({ error: 'Akun tidak ditemukan' });
  const self = target.username === req.user.username;
  if (!self && req.user.role !== 'admin') return res.status(403).json({ error: 'Tidak punya hak akses' });
  if (self && !checkPw(String(req.body.lama || ''), target.pw)) return res.status(400).json({ error: 'Password lama salah' });
  const baru = String(req.body.baru || '');
  if (baru.length < 6) return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
  target.pw = hashPw(baru);
  addLog(req.user, `Password akun ${target.username} diganti`); save();
  res.json({ ok: true });
});
router.post('/api/reset-dummy', auth, only('admin'), (req, res) => {
  Object.assign(DB, dummyData());
  addLog(req.user, 'Data contoh dibuat ulang'); save();
  res.json({ ok: true });
});
router.post('/api/kosongkan', auth, only('admin'), (req, res) => {
  DB.units = buildUnits(); DB.res = []; DB.nextId = 1;
  addLog(req.user, 'Semua data penghuni dikosongkan (siap isi data asli)'); save();
  res.json({ ok: true });
});

router.use(express.static(path.join(__dirname, 'public')));
router.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Dukung akses dari root (/) maupun subpath (/penghunian/unitri)
app.use('/penghunian/unitri', router);
app.use('/', router);

app.listen(PORT, () => console.log(`Monitoring Rusun UNITRI berjalan di port ${PORT}`));
