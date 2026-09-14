// Rusun Jatim - Admin & Input Data Management Handler
const API_BASE = '/api';
const STORAGE_KEY = 'rusun_new_coords';

let allRusunList = [];
let adminFormMap = null;
let formMarker = null;

// Initialize Theme
function initAdminTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        const iconLight = document.querySelector('.icon-light');
        const iconDark = document.querySelector('.icon-dark');
        if (iconLight) iconLight.style.display = 'none';
        if (iconDark) iconDark.style.display = 'inline';
    }
    
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.contains('dark');
            const iconLight = document.querySelector('.icon-light');
            const iconDark = document.querySelector('.icon-dark');
            if (isDark) {
                document.documentElement.classList.remove('dark');
                if (iconLight) iconLight.style.display = 'inline';
                if (iconDark) iconDark.style.display = 'none';
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                if (iconLight) iconLight.style.display = 'none';
                if (iconDark) iconDark.style.display = 'inline';
                localStorage.setItem('theme', 'dark');
            }
        });
    }
}

// Authentication Handlers
async function handleLoginSubmit(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('loginUsername').value;
    const passwordInput = document.getElementById('loginPassword').value;
    const errBox = document.getElementById('loginError');

    const formData = new URLSearchParams();
    formData.append('username', usernameInput);
    formData.append('password', passwordInput);

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Login gagal. Periksa username dan password.');
        }

        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify({
            username: data.username,
            role: data.role,
            nama_lengkap: data.nama_lengkap
        }));

        errBox.style.display = 'none';
        checkAuthState();
    } catch (err) {
        errBox.textContent = err.message;
        errBox.style.display = 'block';
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
}

function checkAuthState() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const loginSec = document.getElementById('loginSection');
    const dashSec = document.getElementById('dashboardSection');
    const userBadge = document.getElementById('userInfoBadge');
    const btnLogout = document.getElementById('btnLogout');
    const userFullName = document.getElementById('userFullName');

    if (token && userStr) {
        const user = JSON.parse(userStr);
        loginSec.style.display = 'none';
        dashSec.style.display = 'block';
        userBadge.style.display = 'inline-flex';
        btnLogout.style.display = 'inline-flex';
        if (userFullName) userFullName.textContent = `${user.nama_lengkap || user.username} (${user.role})`;

        // Load data for tabs
        initAdminDashboard();
    } else {
        loginSec.style.display = 'block';
        dashSec.style.display = 'none';
        userBadge.style.display = 'none';
        btnLogout.style.display = 'none';
    }
}

// Switch Tabs in Admin
function switchAdminTab(tabName) {
    const tabs = ['input', 'proyek', 'master'];
    tabs.forEach(t => {
        const btn = document.getElementById(`tabAdmin${t.charAt(0).toUpperCase() + t.slice(1)}`);
        const view = document.getElementById(`viewAdmin${t.charAt(0).toUpperCase() + t.slice(1)}`);
        if (btn) btn.classList.toggle('active', t === tabName);
        if (view) view.style.display = (t === tabName) ? 'block' : 'none';
    });

    if (tabName === 'input' && adminFormMap) {
        setTimeout(() => adminFormMap.invalidateSize(), 150);
    }
}

// ===== Initializer for Admin Dashboard =====
async function initAdminDashboard() {
    await loadRusunData();
    initAdminFormMap();
    populateRusunSelect();
    loadSavedCoordinates();
    loadAdminProyekList();
    loadMasterRusunTable();
}

// Load 375 Rusun Data
async function loadRusunData() {
    try {
        const res = await fetch('/rusun_data.json?v=' + Date.now());
        if (!res.ok) throw new Error('Gagal memuat file rusun_data.json');
        const json = await res.json();
        allRusunList = json.rusun || [];
    } catch (e) {
        console.warn('Load rusun JSON error:', e);
    }
}

// ===== 1. FORM INPUT KOORDINAT HANDLER =====
function initAdminFormMap() {
    if (adminFormMap) return;
    const mapEl = document.getElementById('formMap');
    if (!mapEl) return;

    adminFormMap = L.map('formMap').setView([-7.5, 112.5], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(adminFormMap);

    adminFormMap.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setMapPin(lat, lng);
        document.getElementById('inputLat').value = lat.toFixed(6);
        document.getElementById('inputLng').value = lng.toFixed(6);
    });

    // Save button event listener
    const saveBtn = document.getElementById('saveCoord');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveAdminCoordinate);
    }

    const exportBtn = document.getElementById('exportUpdatedData');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportUpdatedCoordinates);
    }
}

function setMapPin(lat, lng) {
    if (formMarker) {
        adminFormMap.removeLayer(formMarker);
    }
    formMarker = L.marker([lat, lng]).addTo(adminFormMap);
    adminFormMap.panTo([lat, lng]);
}

function populateRusunSelect() {
    const select = document.getElementById('selectRusun');
    if (!select) return;

    select.innerHTML = '<option value="">-- Pilih Rusun yang Belum Berkoordinat --</option>';

    // Urutkan yang belum berkoordinat di atas
    const missing = allRusunList.filter(r => !r.koordinat || !r.koordinat.lat || !r.koordinat.lng);
    const withCoords = allRusunList.filter(r => r.koordinat && r.koordinat.lat && r.koordinat.lng);

    const groupMissing = document.createElement('optgroup');
    groupMissing.label = `📍 Belum Berkoordinat (${missing.length} Rusun)`;

    missing.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = `[ID: ${r.id}] ${r.nama_rusun} - ${r.kabkota || ''}`;
        groupMissing.appendChild(opt);
    });
    select.appendChild(groupMissing);

    const groupReady = document.createElement('optgroup');
    groupReady.label = `✅ Sudah Berkoordinat (${withCoords.length} Rusun)`;
    withCoords.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = `[ID: ${r.id}] ${r.nama_rusun} - ${r.kabkota || ''}`;
        groupReady.appendChild(opt);
    });
    select.appendChild(groupReady);

    select.addEventListener('change', (e) => {
        const rusunId = parseInt(e.target.value);
        const rusun = allRusunList.find(r => r.id === rusunId);
        const infoBox = document.getElementById('rusunInfo');

        if (rusun) {
            infoBox.style.display = 'block';
            document.getElementById('infoNama').textContent = rusun.nama_rusun;
            document.getElementById('infoAlamat').textContent = rusun.alamat || '-';
            document.getElementById('infoKabkota').textContent = rusun.kabkota || '-';

            if (rusun.koordinat && rusun.koordinat.lat && rusun.koordinat.lng) {
                document.getElementById('inputLat').value = rusun.koordinat.lat;
                document.getElementById('inputLng').value = rusun.koordinat.lng;
                setMapPin(rusun.koordinat.lat, rusun.koordinat.lng);
            } else {
                document.getElementById('inputLat').value = '';
                document.getElementById('inputLng').value = '';
                if (formMarker && adminFormMap) adminFormMap.removeLayer(formMarker);
            }
        } else {
            infoBox.style.display = 'none';
        }
    });
}

async function saveAdminCoordinate() {
    const select = document.getElementById('selectRusun');
    const rusunId = parseInt(select.value);
    const lat = parseFloat(document.getElementById('inputLat').value);
    const lng = parseFloat(document.getElementById('inputLng').value);

    if (!rusunId || isNaN(lat) || isNaN(lng)) {
        alert('Pilih rusun dan tentukan titik koordinat Latitude & Longitude terlebih dahulu!');
        return;
    }

    const rusun = allRusunList.find(r => r.id === rusunId);
    if (!rusun) return;

    // Update in-memory
    rusun.koordinat = {
        lat: lat,
        lng: lng,
        status: 'verified'
    };

    // Update local storage
    let saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    saved = saved.filter(item => item.id !== rusunId);
    saved.push({
        id: rusunId,
        nama_rusun: rusun.nama_rusun,
        kabkota: rusun.kabkota,
        lat: lat,
        lng: lng,
        updated_at: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

    // Try updating to PostgreSQL API directly
    const token = localStorage.getItem('token');
    try {
        await fetch(`${API_BASE}/rusun/${rusunId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                latitude: lat,
                longitude: lng,
                status_koordinat: 'verified'
            })
        });
    } catch (e) {
        console.warn('API update fallback to local:', e);
    }

    alert(`✅ Koordinat untuk "${rusun.nama_rusun}" berhasil disimpan!`);
    loadSavedCoordinates();
}

function loadSavedCoordinates() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const tbody = document.getElementById('savedDataBody');
    if (!tbody) return;

    if (saved.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:1rem;">Belum ada data koordinat baru yang diinput pada sesi ini.</td></tr>`;
        return;
    }

    tbody.innerHTML = saved.map(item => `
        <tr>
            <td><strong>${item.nama_rusun}</strong></td>
            <td>${item.kabkota || '-'}</td>
            <td>${item.lat.toFixed(6)}</td>
            <td>${item.lng.toFixed(6)}</td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="removeSavedCoordinate(${item.id})">🗑️ Hapus</button>
            </td>
        </tr>
    `).join('');
}

window.removeSavedCoordinate = function(id) {
    let saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    saved = saved.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    loadSavedCoordinates();
};

function exportUpdatedCoordinates() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (saved.length === 0) {
        alert('Belum ada data koordinat yang disimpan untuk diexport.');
        return;
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(saved, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `koordinat_rusun_baru_${new Date().toISOString().slice(0,10)}.json`);
    dlAnchor.click();
}

// ===== 2. KELOLA PROYEK ONGOING =====
async function loadAdminProyekList() {
    const tbody = document.getElementById('adminProyekTableBody');
    const countBadge = document.getElementById('adminProyekCount');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/proyek/2026/tnialpasuruan`);
        if (!res.ok) throw new Error('Data proyek belum tersedia.');
        const p = await res.json();
        
        if (countBadge) countBadge.textContent = '1 Proyek';
        tbody.innerHTML = `
            <tr>
                <td>
                    <strong>${p.kode_proyek}</strong><br>
                    <small style="color:var(--text-muted);">TA ${p.tahun}</small>
                </td>
                <td>
                    <strong>${p.nama_proyek}</strong>
                </td>
                <td>${p.lokasi_detail || p.kabkota || '-'}</td>
                <td>
                    <span class="badge badge-warning">${p.status_fase}</span>
                </td>
                <td>
                    <a href="/proyek/${p.tahun}/${p.slug}" target="_blank" class="btn btn-outline btn-sm">
                        ⏳ Buka Timeline & Persuratan
                    </a>
                </td>
            </tr>
        `;
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:var(--text-muted);">Belum ada proyek terdaftar.</td></tr>`;
    }
}

async function handleCreateProyek(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const payload = {
        kode_proyek: document.getElementById('newKodeProyek').value,
        nama_proyek: document.getElementById('newNamaProyek').value,
        tahun: parseInt(document.getElementById('newTahunProyek').value),
        slug: document.getElementById('newSlugProyek').value,
        kabkota: document.getElementById('newKabKotaProyek').value,
        lokasi_detail: document.getElementById('newKabKotaProyek').value,
        status_fase: document.getElementById('newFaseProyek').value,
        deskripsi: document.getElementById('newDeskripsiProyek').value
    };

    try {
        const res = await fetch(`${API_BASE}/proyek/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Gagal membuat proyek baru.');
        }

        alert('✅ Proyek baru berhasil didaftarkan!');
        window.location.href = `/proyek/${payload.tahun}/${payload.slug}`;
    } catch (err) {
        alert('Gagal: ' + err.message);
    }
}

// ===== 3. MASTER RUSUN OVERVIEW =====
function loadMasterRusunTable() {
    const tbody = document.getElementById('adminMasterTableBody');
    if (!tbody) return;

    if (allRusunList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Memuat data...</td></tr>`;
        return;
    }

    tbody.innerHTML = allRusunList.slice(0, 50).map(r => {
        const status = r.koordinat && r.koordinat.lat ? (r.koordinat.status || 'verified') : 'missing';
        let badge = '<span class="badge badge-warning">Belum Ada</span>';
        if (status === 'verified') badge = '<span class="badge badge-success">Terverifikasi</span>';
        else if (status === 'need_validation') badge = '<span class="badge badge-warning">Perlu Validasi</span>';

        return `
            <tr>
                <td>${r.id}</td>
                <td>${r.tahun_anggaran || '-'}</td>
                <td><strong>${r.nama_rusun}</strong></td>
                <td>${r.kabkota || '-'}</td>
                <td>${r.penerima || '-'}</td>
                <td>${badge}</td>
            </tr>
        `;
    }).join('');
}

// Auto init on ready
document.addEventListener('DOMContentLoaded', () => {
    initAdminTheme();
    checkAuthState();
});
