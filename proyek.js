// Rusun Jatim - Handler Kronologis Fleksibel & Persuratan Proyek
const API_BASE = '/api';
let currentProyekData = null;
let allTimelines = [];

// Initialize Theme
function initProyekTheme() {
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

// Load Proyek Details from URL /proyek/:tahun/:slug
async function initProyekDetailPage() {
    initProyekTheme();

    const pathParts = window.location.pathname.split('/').filter(Boolean);
    let tahun = 2026;
    let slug = 'tnialpasuruan';

    if (pathParts.length >= 3 && pathParts[0] === 'proyek') {
        tahun = parseInt(pathParts[1]);
        slug = pathParts[2];
    }

    try {
        const res = await fetch(`${API_BASE}/proyek/${tahun}/${slug}`);
        if (!res.ok) throw new Error('Data proyek belum tersedia.');
        currentProyekData = await res.json();
        renderProyekDetail(currentProyekData);
    } catch (err) {
        console.warn('Load detail proyek:', err.message);
        const headerTitle = document.getElementById('proyekNamaHeader');
        if (headerTitle) headerTitle.textContent = 'Pembangunan Rumah Susun TNI AL Pasuruan';
    }
}

function renderProyekDetail(p) {
    const elHeaderNama = document.getElementById('proyekNamaHeader');
    if (elHeaderNama) elHeaderNama.textContent = p.nama_proyek;

    const elNama = document.getElementById('proyekNama');
    const elDeskripsi = document.getElementById('proyekDeskripsi');
    if (elNama) elNama.textContent = p.nama_proyek;
    if (elDeskripsi) elDeskripsi.textContent = p.deskripsi || 'Pembangunan Rumah Susun untuk Prajurit TNI AL Pasuruan berlokasi di Desa Gejug Jati, Kecamatan Lekok, Kabupaten Pasuruan.';

    const bTahun = document.getElementById('badgeTahun');
    const bFase = document.getElementById('badgeFase');
    if (bTahun) bTahun.textContent = `TA ${p.tahun}`;
    if (bFase) bFase.textContent = `Tahap: ${p.status_fase || 'Pengusulan & Kesiapan Lahan'}`;

    const elLokasi = document.getElementById('infoLokasi');
    if (elLokasi) elLokasi.innerHTML = `📍 ${p.lokasi_detail || 'Desa Gejug Jati, Kecamatan Lekok, Kabupaten Pasuruan'}`;

    // Render Kronologis Berbasis Waktu
    allTimelines = p.timelines || [];
    renderTimelineList(allTimelines);

    // Render Persuratan
    renderSuratList(p.surat_list || []);
}

// Render Timeline dengan Kategori Visual Khusus
function renderTimelineList(timelines) {
    const timelineContainer = document.getElementById('timelineList');
    const elTimeCount = document.getElementById('timelineCount');
    if (elTimeCount) elTimeCount.textContent = `${timelines.length} Kegiatan`;

    if (!timelineContainer) return;

    if (timelines.length === 0) {
        timelineContainer.innerHTML = `
            <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); background: var(--bg-muted); border-radius: var(--radius-sm); border: 1px dashed var(--border-subtle);">
                <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">📭</span>
                <strong style="color: var(--text-heading); font-size: 0.85rem;">Belum ada riwayat kegiatan tercatat</strong>
                <p style="font-size: 0.75rem; margin-top: 0.25rem;">Gunakan tombol <strong>"➕ Catat Kegiatan / Rapat"</strong> di atas untuk mencatat rapat, diskusi, surat, atau pemenuhan dokumen persyaratan.</p>
            </div>
        `;
        return;
    }

    // Urutkan berdasarkan waktu kronologis (terbaru di atas)
    const sorted = [...timelines].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    timelineContainer.innerHTML = sorted.map(item => {
        let badgeColor = 'badge-primary';
        let iconType = '📌';
        const faseLower = (item.fase || '').toLowerCase();

        if (faseLower.includes('rapat') || faseLower.includes('diskusi') || faseLower.includes('pertemuan')) {
            badgeColor = 'badge-info';
            iconType = '🗣️';
        } else if (faseLower.includes('surat masuk')) {
            badgeColor = 'badge-primary';
            iconType = '📩';
        } else if (faseLower.includes('surat keluar')) {
            badgeColor = 'badge-info';
            iconType = '📤';
        } else if (faseLower.includes('syarat') || faseLower.includes('lahan')) {
            badgeColor = 'badge-warning';
            iconType = '📋';
        } else if (faseLower.includes('verifikasi') || faseLower.includes('lapangan')) {
            badgeColor = 'badge-success';
            iconType = '🔍';
        }

        return `
            <div class="timeline-card">
                <div class="timeline-icon"></div>
                <div class="timeline-box">
                    <div class="timeline-header">
                        <span class="badge ${badgeColor}">${iconType} ${item.fase}</span>
                        <span class="timeline-date">🕒 <strong>${item.tanggal}</strong></span>
                    </div>
                    <h4 style="font-size:0.85rem; font-weight:700; color:var(--text-heading); margin-bottom:0.25rem;">${item.judul}</h4>
                    ${item.catatan ? `<p style="font-size:0.775rem; color:var(--text-body); line-height:1.4; margin-top:0.25rem;">${item.catatan}</p>` : ''}
                    ${item.lampiran_url ? `
                        <div style="margin-top:0.4rem;">
                            <a href="${item.lampiran_url}" target="_blank" class="btn btn-outline btn-sm" style="font-size:0.7rem; padding:0.15rem 0.45rem;">
                                📎 Lihat Data Pendukung / Lampiran
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Filter Timeline Kategori
function filterTimeline(kategori, btn) {
    document.querySelectorAll('.filter-time-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    if (kategori === 'all') {
        renderTimelineList(allTimelines);
    } else {
        const filtered = allTimelines.filter(t => (t.fase || '').toLowerCase().includes(kategori.toLowerCase()));
        renderTimelineList(filtered);
    }
}

// Render Persuratan
function renderSuratList(suratList) {
    const suratTbody = document.getElementById('suratTableBody');
    const elSuratCount = document.getElementById('suratCount');
    if (elSuratCount) elSuratCount.textContent = `${suratList.length} Berkas`;

    if (!suratTbody) return;

    if (suratList.length === 0) {
        suratTbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
                    Belum ada dokumen persuratan yang diunggah.
                </td>
            </tr>
        `;
        return;
    }

    suratTbody.innerHTML = suratList.map(s => `
        <tr>
            <td>
                <strong>${s.no_surat}</strong><br>
                <small style="color:var(--text-muted);">📅 ${s.tgl_surat}</small>
            </td>
            <td>
                <span class="badge badge-primary" style="font-size:0.65rem;">${s.jenis_surat}</span><br>
                <span style="font-size:0.75rem;">${s.perihal}</span>
            </td>
            <td><span style="font-size:0.75rem;">${s.pengirim || '-'}</span></td>
            <td>
                ${s.file_path ? `
                    <a href="${s.file_path}" target="_blank" class="btn btn-outline btn-sm" style="font-size:0.7rem; padding:0.15rem 0.45rem;">
                        📥 Unduh PDF
                    </a>
                ` : '<span style="color:var(--text-subtle); font-size:0.75rem;">-</span>'}
            </td>
        </tr>
    `).join('');
}

// Modal Form Controls
function openQuickActionModal(tabType = 'kegiatan') {
    const modal = document.getElementById('quickModal');
    if (modal) {
        modal.classList.add('show');
        switchModalTab(tabType);
        // Default today's date
        const today = new Date().toISOString().split('T')[0];
        const inputTgl = document.getElementById('inputTglKegiatan');
        const inputTglS = document.getElementById('inputTglSurat');
        if (inputTgl && !inputTgl.value) inputTgl.value = today;
        if (inputTglS && !inputTglS.value) inputTglS.value = today;
    }
}

function closeQuickActionModal() {
    const modal = document.getElementById('quickModal');
    if (modal) modal.classList.remove('show');
}

function switchModalTab(tab) {
    const tabKegiatan = document.getElementById('tabBtnKegiatan');
    const tabSurat = document.getElementById('tabBtnSurat');
    const formKegiatan = document.getElementById('formKegiatan');
    const formSurat = document.getElementById('formSurat');
    const modalTitle = document.getElementById('modalTitle');

    if (tab === 'kegiatan') {
        if (tabKegiatan) tabKegiatan.className = 'btn btn-primary btn-sm';
        if (tabSurat) tabSurat.className = 'btn btn-outline btn-sm';
        if (formKegiatan) formKegiatan.style.display = 'block';
        if (formSurat) formSurat.style.display = 'none';
        if (modalTitle) modalTitle.textContent = '➕ Catat Kegiatan / Rapat / Diskusi';
    } else {
        if (tabKegiatan) tabKegiatan.className = 'btn btn-outline btn-sm';
        if (tabSurat) tabSurat.className = 'btn btn-primary btn-sm';
        if (formKegiatan) formKegiatan.style.display = 'none';
        if (formSurat) formSurat.style.display = 'block';
        if (modalTitle) modalTitle.textContent = '📄 Upload Berkas / Surat Masuk-Keluar';
    }
}

// Submit Kegiatan Baru
async function submitKegiatanEvent(e) {
    e.preventDefault();
    if (!currentProyekData) return;

    const token = localStorage.getItem('token');
    const pihak = document.getElementById('inputPihakKegiatan').value;
    const catatan = document.getElementById('inputCatatanKegiatan').value;
    const catatanLengkap = pihak ? `[Pihak Terlibat: ${pihak}]\n${catatan}` : catatan;

    const payload = {
        proyek_id: currentProyekData.id,
        tanggal: document.getElementById('inputTglKegiatan').value,
        fase: document.getElementById('inputKategoriKegiatan').value,
        judul: document.getElementById('inputJudulKegiatan').value,
        catatan: catatanLengkap,
        progres_saat_ini: 0.0
    };

    try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/proyek/${currentProyekData.id}/timeline`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Gagal mencatat kegiatan');
        alert('✅ Riwayat kegiatan berhasil dicatat!');
        closeQuickActionModal();
        initProyekDetailPage();
    } catch (err) {
        alert('Catatan: ' + err.message);
    }
}

// Submit Surat Baru
async function submitSuratEvent(e) {
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
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/persuratan/upload`, {
            method: 'POST',
            headers: headers,
            body: formData
        });

        if (!res.ok) throw new Error('Gagal upload surat');
        alert('✅ Dokumen persuratan berhasil disimpan!');
        closeQuickActionModal();
        initProyekDetailPage();
    } catch (err) {
        alert('Catatan: ' + err.message);
    }
}

document.addEventListener('DOMContentLoaded', initProyekDetailPage);
