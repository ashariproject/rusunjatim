// Rusun Jatim Frontend Unified JavaScript
const API_BASE = '/api';

// State Global
let mapInstance = null;
let markerClusterGroup = null;
let allRusunData = [];
let filteredRusunData = [];
let currentProyekData = null;

// --- 1. THEME SWITCHER ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        });
    }
}

// --- 2. MAP INITIALIZATION & GIS ---
function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Center Jawa Timur
    mapInstance = L.map('map').setView([-7.7, 112.5], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors | BP3KP Jatim'
    }).addTo(mapInstance);

    markerClusterGroup = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 45
    });
    mapInstance.addLayer(markerClusterGroup);

    fetchRusunMasterData();
    setupMapFilters();
}

async function fetchRusunMasterData() {
    try {
        const res = await fetch(`${API_BASE}/rusun`);
        if (!res.ok) throw new Error('Gagal mengambil data rusun');
        allRusunData = await res.json();
        filteredRusunData = [...allRusunData];

        populateFilterDropdowns(allRusunData);
        updateMapMarkers(filteredRusunData);
        updateSummaryStats(allRusunData);
        renderMasterTable(filteredRusunData);
        loadOngoingProjectsList();
    } catch (err) {
        console.warn('Backend API belum aktif, memuat fallback lokal...', err);
        // Fallback to static JSON if accessed directly on file system
        try {
            const staticRes = await fetch('/rusun_data.json');
            const staticData = await staticRes.json();
            allRusunData = (staticData.rusun || []).map(r => ({
                id: r.id,
                nama_rusun: r.nama_rusun,
                kabkota: r.kabkota,
                alamat: r.alamat,
                penerima: r.penerima,
                tahun_anggaran: r.tahun_anggaran,
                tipe_rusun: r.tipe_rusun,
                jumlah_lantai: r.jumlah_lantai,
                jumlah_unit: r.jumlah_unit,
                latitude: r.koordinat ? r.koordinat.lat : null,
                longitude: r.koordinat ? r.koordinat.lng : null,
                status_koordinat: r.koordinat ? r.koordinat.status : 'missing',
                foto_utama: `images/rusun/${r.id}.jpg`
            }));
            filteredRusunData = [...allRusunData];
            populateFilterDropdowns(allRusunData);
            updateMapMarkers(filteredRusunData);
            updateSummaryStats(allRusunData);
            renderMasterTable(filteredRusunData);
        } catch (e) {
            console.error('Gagal load data:', e);
        }
    }
}

function updateMapMarkers(data) {
    if (!markerClusterGroup) return;
    markerClusterGroup.clearLayers();

    const markers = [];
    data.forEach(r => {
        if (r.latitude && r.longitude) {
            const lat = parseFloat(r.latitude);
            const lng = parseFloat(r.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                const markerColor = r.status_koordinat === 'verified' ? '#10b981' : '#f59e0b';
                
                const customIcon = L.divIcon({
                    className: 'custom-map-pin',
                    html: `<div style="background-color:${markerColor}; width:14px; height:14px; border-radius:50%; border:2px solid white; box-shadow:0 0 4px rgba(0,0,0,0.4);"></div>`,
                    iconSize: [14, 14]
                });

                const marker = L.marker([lat, lng], { icon: customIcon });
                
                const popupContent = `
                    <div style="font-family:'Inter',sans-serif; min-width:240px; font-size:0.875rem;">
                        <h4 style="color:var(--primary); font-size:0.95rem; margin-bottom:0.25rem;">${r.nama_rusun}</h4>
                        <p style="color:#64748b; font-size:0.8rem; margin-bottom:0.5rem;">📍 ${r.kabkota || '-'} (TA ${r.tahun_anggaran || '-'})</p>
                        <div style="font-size:0.8rem; line-height:1.4; margin-bottom:0.75rem;">
                            <strong>Penerima:</strong> ${r.penerima || '-'}<br>
                            <strong>Tipe/Unit:</strong> ${r.tipe_rusun || '-'} / ${r.jumlah_unit || '-'} unit<br>
                            <strong>Alamat:</strong> ${r.alamat || '-'}
                        </div>
                        <div style="display:flex; gap:0.5rem;">
                            <a href="https://maps.google.com/?q=${lat},${lng}" target="_blank" class="btn btn-sm btn-outline" style="text-decoration:none;">🗺️ G-Maps</a>
                            <a href="/proyek/${r.tahun_anggaran || 2026}/rusun-${r.id}" class="btn btn-sm btn-primary" style="text-decoration:none;">📜 Timeline</a>
                        </div>
                    </div>
                `;
                marker.bindPopup(popupContent);
                markers.push(marker);
            }
        }
    });

    markerClusterGroup.addLayers(markers);
}

function populateFilterDropdowns(data) {
    const kabKotaSet = new Set();
    const tahunSet = new Set();

    data.forEach(r => {
        if (r.kabkota) kabKotaSet.add(r.kabkota.trim());
        if (r.tahun_anggaran) tahunSet.add(r.tahun_anggaran);
    });

    const selectKab = document.getElementById('filterKabKota');
    if (selectKab) {
        [...kabKotaSet].sort().forEach(k => {
            const opt = document.createElement('option');
            opt.value = k;
            opt.textContent = k;
            selectKab.appendChild(opt);
        });
    }

    const selectTahun = document.getElementById('filterTahun');
    if (selectTahun) {
        [...tahunSet].sort((a, b) => b - a).forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = `Tahun ${t}`;
            selectTahun.appendChild(opt);
        });
    }
}

function setupMapFilters() {
    const searchInput = document.getElementById('searchInput');
    const filterKab = document.getElementById('filterKabKota');
    const filterTahun = document.getElementById('filterTahun');
    const filterCoord = document.getElementById('filterStatusCoord');

    const applyFilter = () => {
        const s = (searchInput?.value || '').toLowerCase();
        const k = filterKab?.value || '';
        const t = filterTahun?.value || '';
        const c = filterCoord?.value || '';

        filteredRusunData = allRusunData.filter(r => {
            const matchSearch = !s || 
                (r.nama_rusun && r.nama_rusun.toLowerCase().includes(s)) ||
                (r.alamat && r.alamat.toLowerCase().includes(s)) ||
                (r.kabkota && r.kabkota.toLowerCase().includes(s));
            
            const matchKab = !k || (r.kabkota && r.kabkota.trim() === k);
            const matchTahun = !t || (r.tahun_anggaran && String(r.tahun_anggaran) === String(t));
            const matchCoord = !c || (r.status_koordinat === c);

            return matchSearch && matchKab && matchTahun && matchCoord;
        });

        updateMapMarkers(filteredRusunData);
        renderMasterTable(filteredRusunData);
        updateSummaryStats(filteredRusunData);
    };

    searchInput?.addEventListener('input', applyFilter);
    filterKab?.addEventListener('change', applyFilter);
    filterTahun?.addEventListener('change', applyFilter);
    filterCoord?.addEventListener('change', applyFilter);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterKabKota').value = '';
    document.getElementById('filterTahun').value = '';
    document.getElementById('filterStatusCoord').value = '';
    filteredRusunData = [...allRusunData];
    updateMapMarkers(filteredRusunData);
    renderMasterTable(filteredRusunData);
    updateSummaryStats(filteredRusunData);
}

function updateSummaryStats(data) {
    const total = data.length;
    const withCoords = data.filter(r => r.latitude && r.longitude).length;
    const missing = total - withCoords;

    const elTotal = document.getElementById('statTotalRusun');
    const elWith = document.getElementById('statWithCoords');
    const elMiss = document.getElementById('statMissingCoords');

    if (elTotal) elTotal.textContent = total;
    if (elWith) elWith.textContent = withCoords;
    if (elMiss) elMiss.textContent = missing;
}

function renderMasterTable(data) {
    const tbody = document.getElementById('masterTableBody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:1.5rem; color:var(--text-muted);">Tidak ada data yang cocok.</td></tr>`;
        return;
    }

    // Limit to first 100 in table for speed
    const sliceData = data.slice(0, 100);
    tbody.innerHTML = sliceData.map(r => `
        <tr>
            <td><strong>#${r.id}</strong></td>
            <td><strong>${r.nama_rusun}</strong><br><small style="color:var(--text-muted);">${r.alamat || '-'}</small></td>
            <td>${r.kabkota || '-'}</td>
            <td>${r.penerima || '-'}</td>
            <td>${r.tahun_anggaran || '-'}</td>
            <td>${r.tipe_rusun || '-'}<br><small>${r.jumlah_tower ? r.jumlah_tower + ' Tower' : '-'}</small></td>
            <td>${r.jumlah_unit ? r.jumlah_unit + ' Unit' : '-'}<br><small>${r.jumlah_lantai ? r.jumlah_lantai + ' Lt' : '-'}</small></td>
            <td>
                <span class="badge ${r.status_koordinat === 'verified' ? 'badge-success' : (r.status_koordinat === 'unverified' ? 'badge-warning' : 'badge-danger')}">
                    ${r.status_koordinat || 'missing'}
                </span>
            </td>
            <td>
                <a href="/proyek/${r.tahun_anggaran || 2026}/rusun-${r.id}" class="btn btn-sm btn-outline">Timeline</a>
            </td>
        </tr>
    `).join('');
}

// --- 3. ONGOING PROJECTS & TIMELINE PAGE ---
async function loadOngoingProjectsList() {
    const container = document.getElementById('ongoingProjectsList');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/proyek`);
        if (!res.ok) throw new Error('Gagal');
        const list = await res.json();
        
        if (list.length === 0) {
            container.innerHTML = `<p style="color:var(--text-muted); padding:1rem;">Belum ada data proyek ongoing.</p>`;
            return;
        }

        container.innerHTML = list.map(p => `
            <div class="card" style="border-left:4px solid var(--primary); display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                        <span class="badge badge-primary">TA ${p.tahun}</span>
                        <span class="badge badge-info">${p.status_fase}</span>
                    </div>
                    <h3 style="font-size:1.1rem; margin-bottom:0.5rem;">${p.nama_proyek}</h3>
                    <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.75rem;">📍 ${p.kabkota || '-'}</p>
                    <div style="margin-bottom:0.75rem;">
                        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.25rem;">
                            <span>Progres Fisik</span>
                            <strong>${p.progres_fisik_persen || 0}%</strong>
                        </div>
                        <div style="background:#cbd5e1; height:6px; border-radius:3px; overflow:hidden;">
                            <div style="width:${p.progres_fisik_persen || 0}%; height:100%; background:var(--primary);"></div>
                        </div>
                    </div>
                </div>
                <a href="/proyek/${p.tahun}/${p.slug}" class="btn btn-sm btn-primary" style="margin-top:0.75rem; text-align:center; justify-content:center;">
                    📜 Buka Timeline & Persuratan
                </a>
            </div>
        `).join('');
    } catch (e) {
        console.warn('Proyek ongoing load error:', e);
    }
}

async function initProyekDetailPage() {
    initTheme();
    checkLoginState();

    // Parse /proyek/:tahun/:slug from window.location.pathname
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    let tahun = 2026;
    let slug = 'tnialpasuruan';

    if (pathParts.length >= 3 && pathParts[0] === 'proyek') {
        tahun = parseInt(pathParts[1]);
        slug = pathParts[2];
    }

    try {
        const res = await fetch(`${API_BASE}/proyek/${tahun}/${slug}`);
        if (!res.ok) throw new Error('Proyek tidak ditemukan');
        currentProyekData = await res.json();
        renderProyekDetail(currentProyekData);
    } catch (err) {
        console.error('Error load detail proyek:', err);
        document.getElementById('proyekNamaHeader').textContent = `Proyek ${slug.toUpperCase()} (TA ${tahun})`;
        document.getElementById('proyekNama').textContent = `Pembangunan Rumah Susun (${slug})`;
        document.getElementById('timelineList').innerHTML = `<p style="color:var(--text-muted);">Data timeline proyek belum tercatat di database.</p>`;
    }
}

function renderProyekDetail(p) {
    document.getElementById('proyekNamaHeader').textContent = p.nama_proyek;
    document.getElementById('proyekKodeHeader').textContent = `${p.kode_proyek} • Repository Usulan s.d. Pembangunan`;
    
    document.getElementById('badgeTahun').textContent = `TA ${p.tahun}`;
    document.getElementById('badgeFase').textContent = `Fase: ${p.status_fase}`;
    document.getElementById('badgeLokasi').textContent = p.kabkota || 'Jawa Timur';
    
    document.getElementById('proyekNama').textContent = p.nama_proyek;
    document.getElementById('proyekDeskripsi').textContent = p.deskripsi || 'Tidak ada keterangan tambahan.';
    
    const progres = p.progres_fisik_persen || 0;
    document.getElementById('progresText').textContent = `${progres}%`;
    document.getElementById('progresBar').style.width = `${progres}%`;

    document.getElementById('infoPagu').textContent = p.pagu_anggaran ? `Rp ${p.pagu_anggaran.toLocaleString('id-ID')}` : '-';
    document.getElementById('infoKontraktor').textContent = p.kontraktor || '-';
    document.getElementById('infoKonsultan').textContent = p.konsultan || '-';
    document.getElementById('infoLokasi').textContent = p.lokasi_detail || p.kabkota || '-';

    // Render Timeline
    const timelineContainer = document.getElementById('timelineList');
    const timelines = p.timelines || [];
    document.getElementById('timelineCount').textContent = `${timelines.length} Kejadian / Milestone`;

    if (timelines.length === 0) {
        timelineContainer.innerHTML = `<p style="color:var(--text-muted); padding:1rem 0;">Belum ada catatan timeline.</p>`;
    } else {
        timelineContainer.innerHTML = timelines.map(item => `
            <div class="timeline-card">
                <div class="timeline-icon"></div>
                <div class="timeline-box">
                    <div class="timeline-header">
                        <span class="badge badge-info">${item.fase}</span>
                        <span class="timeline-date">📅 ${item.tanggal}</span>
                    </div>
                    <h4 style="font-size:0.95rem; font-weight:700; margin-bottom:0.35rem;">${item.judul}</h4>
                    <p style="font-size:0.875rem; color:var(--text-main); line-height:1.4;">${item.catatan || ''}</p>
                    ${item.progres_saat_ini !== null ? `<small style="color:var(--primary); font-weight:600; display:block; margin-top:0.35rem;">Progres Fisik: ${item.progres_saat_ini}%</small>` : ''}
                </div>
            </div>
        `).join('');
    }

    // Render Persuratan
    const suratTbody = document.getElementById('suratTableBody');
    const suratList = p.surat_list || [];
    document.getElementById('suratCount').textContent = `${suratList.length} Berkas`;

    if (suratList.length === 0) {
        suratTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:var(--text-muted);">Belum ada berkas persuratan tersimpan.</td></tr>`;
    } else {
        suratTbody.innerHTML = suratList.map(s => `
            <tr>
                <td><strong>${s.no_surat}</strong><br><small style="color:var(--text-muted);">${s.tgl_surat}</small></td>
                <td><strong>${s.jenis_surat}</strong><br><small>${s.perihal}</small></td>
                <td>${s.pengirim || '-'}</td>
                <td><span class="badge badge-success">${s.status_disposisi || 'Selesai'}</span></td>
                <td>
                    ${s.file_path ? `<a href="${s.file_path}" target="_blank" class="btn btn-sm btn-outline">📥 Lihat PDF</a>` : '<span style="color:var(--text-muted); font-size:0.8rem;">Tidak ada file</span>'}
                </td>
            </tr>
        `).join('');
    }
}

// --- 4. QUICK MODAL & OPERATOR ACTIONS ---
function openQuickActionModal() {
    const modal = document.getElementById('quickModal');
    if (modal) modal.classList.add('show');
}

function closeQuickActionModal() {
    const modal = document.getElementById('quickModal');
    if (modal) modal.classList.remove('show');
}

function switchQuickForm(type) {
    const btnTime = document.getElementById('tabFormTimeline');
    const btnSurat = document.getElementById('tabFormSurat');
    const formTime = document.getElementById('formAddTimeline');
    const formSurat = document.getElementById('formAddSurat');

    if (type === 'timeline') {
        btnTime.className = 'btn btn-primary btn-sm';
        btnSurat.className = 'btn btn-outline btn-sm';
        formTime.style.display = 'block';
        formSurat.style.display = 'none';
    } else {
        btnTime.className = 'btn btn-outline btn-sm';
        btnSurat.className = 'btn btn-primary btn-sm';
        formTime.style.display = 'none';
        formSurat.style.display = 'block';
    }
}

async function submitTimelineEvent(e) {
    e.preventDefault();
    if (!currentProyekData) return;

    const token = localStorage.getItem('token');
    const payload = {
        proyek_id: currentProyekData.id,
        tanggal: document.getElementById('inputTglTimeline').value,
        fase: document.getElementById('inputFaseTimeline').value,
        judul: document.getElementById('inputJudulTimeline').value,
        progres_saat_ini: parseFloat(document.getElementById('inputProgresTimeline').value) || null,
        catatan: document.getElementById('inputCatatanTimeline').value
    };

    try {
        const res = await fetch(`${API_BASE}/proyek/${currentProyekData.id}/timeline`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Gagal mencatat timeline');
        alert('✅ Catatan timeline berhasil disimpan!');
        closeQuickActionModal();
        window.location.reload();
    } catch (err) {
        alert('Gagal: ' + err.message);
    }
}

async function submitPersuratan(e) {
    e.preventDefault();
    if (!currentProyekData) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('proyek_id', currentProyekData.id);
    formData.append('no_surat', document.getElementById('inputNoSurat').value);
    formData.append('tgl_surat', document.getElementById('inputTglSurat').value);
    formData.append('jenis_surat', document.getElementById('inputJenisSurat').value);
    formData.append('pengirim', document.getElementById('inputPengirimSurat').value);
    formData.append('perihal', document.getElementById('inputPerihalSurat').value);

    const fileInput = document.getElementById('inputFileSurat');
    if (fileInput.files[0]) {
        formData.append('file', fileInput.files[0]);
    }

    try {
        const res = await fetch(`${API_BASE}/persuratan/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!res.ok) throw new Error('Gagal upload surat');
        alert('✅ Berkas persuratan berhasil disimpan!');
        closeQuickActionModal();
        window.location.reload();
    } catch (err) {
        alert('Gagal: ' + err.message);
    }
}

// --- 5. AUTH & ADMIN INTEGRATION ---
function checkLoginState() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const quickBtn = document.getElementById('quickAddBtn');
    const adminNavBtn = document.getElementById('adminNavBtn');

    if (token && user) {
        if (quickBtn) quickBtn.style.display = 'inline-flex';
        if (adminNavBtn) {
            adminNavBtn.textContent = `👤 ${user.nama_lengkap || user.username} (${user.role})`;
            adminNavBtn.href = '/admin.html';
        }
    }
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    const u = document.getElementById('loginUsername').value;
    const p = document.getElementById('loginPassword').value;
    const errDiv = document.getElementById('loginError');

    const form = new URLSearchParams();
    form.append('username', u);
    form.append('password', p);

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: form.toString()
        });

        if (!res.ok) throw new Error('Username atau password tidak sesuai');
        const data = await res.json();
        
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        window.location.href = '/admin.html';
    } catch (err) {
        if (errDiv) {
            errDiv.textContent = err.message;
            errDiv.style.display = 'block';
        }
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin.html';
}

function initAdminPage() {
    initTheme();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const loginSection = document.getElementById('loginSection');
    const dashSection = document.getElementById('dashboardSection');
    const btnLogout = document.getElementById('btnLogout');
    const userStatus = document.getElementById('userLoginStatus');

    if (token && user) {
        loginSection.style.display = 'none';
        dashSection.style.display = 'block';
        if (btnLogout) btnLogout.style.display = 'inline-flex';
        if (userStatus) userStatus.textContent = `Login sebagai: ${user.nama_lengkap || user.username} [${user.role.toUpperCase()}]`;
        loadAdminProyekTable();
    } else {
        loginSection.style.display = 'block';
        dashSection.style.display = 'none';
        if (btnLogout) btnLogout.style.display = 'none';
    }
}

async function loadAdminProyekTable() {
    const tbody = document.getElementById('adminProyekTableBody');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/proyek`);
        const list = await res.json();
        
        tbody.innerHTML = list.map(p => `
            <tr>
                <td><strong>${p.kode_proyek}</strong><br><small>TA ${p.tahun}</small></td>
                <td><strong>${p.nama_proyek}</strong><br><small style="color:var(--text-muted);">${p.slug}</small></td>
                <td>${p.kabkota || '-'}</td>
                <td><span class="badge badge-info">${p.status_fase}</span> (${p.progres_fisik_persen || 0}%)</td>
                <td>
                    <a href="/proyek/${p.tahun}/${p.slug}" class="btn btn-sm btn-primary">Buka</a>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Gagal memuat list proyek</td></tr>`;
    }
}

async function handleCreateProyek(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const payload = {
        kode_proyek: document.getElementById('newKodeProyek').value,
        nama_proyek: document.getElementById('newNamaProyek').value,
        tahun: parseInt(document.getElementById('newTahunProyek').value),
        slug: document.getElementById('newSlugProyek').value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
        kabkota: document.getElementById('newKabKotaProyek').value,
        status_fase: document.getElementById('newFaseProyek').value,
        pagu_anggaran: parseInt(document.getElementById('newPaguProyek').value) || 0,
        deskripsi: document.getElementById('newDeskripsiProyek').value
    };

    try {
        const res = await fetch(`${API_BASE}/proyek`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Gagal membuat proyek baru');
        alert('✅ Proyek baru berhasil dibuat!');
        window.location.href = `/proyek/${payload.tahun}/${payload.slug}`;
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

function switchMainTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');

    const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.textContent.toLowerCase().includes(tabName.toLowerCase()));
    if (activeBtn) activeBtn.classList.add('active');

    const pane = document.getElementById(`tab-${tabName}`);
    if (pane) pane.style.display = 'block';

    if (tabName === 'map' && mapInstance) {
        setTimeout(() => mapInstance.invalidateSize(), 200);
    }
}

// Auto Init on Page Load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    checkLoginState();
    if (document.getElementById('map')) {
        initMap();
    }
});
