// Rusun Jatim - Proyek Ongoing & Timeline Handler (Pines UI Style)
const API_BASE = '/api';
let currentProyekData = null;

// Initialize Theme
function initProyekTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.contains('dark');
            if (isDark) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }
}

// Load Proyek Details from URL /proyek/:tahun/:slug
async function initProyekDetailPage() {
    initProyekTheme();
    checkProyekLoginState();

    const pathParts = window.location.pathname.split('/').filter(Boolean);
    let tahun = 2026;
    let slug = 'tnialpasuruan';

    if (pathParts.length >= 3 && pathParts[0] === 'proyek') {
        tahun = parseInt(pathParts[1]);
        slug = pathParts[2];
    }

    try {
        const res = await fetch(`${API_BASE}/proyek/${tahun}/${slug}`);
        if (!res.ok) throw new Error('Data proyek tidak ditemukan');
        currentProyekData = await res.json();
        renderProyekDetail(currentProyekData);
    } catch (err) {
        console.error('Error load detail proyek:', err);
        const headerTitle = document.getElementById('proyekNamaHeader');
        if (headerTitle) headerTitle.textContent = `Proyek ${slug.toUpperCase()} (TA ${tahun})`;
        const timelineEl = document.getElementById('timelineList');
        if (timelineEl) timelineEl.innerHTML = `<p style="color:var(--text-muted); padding:1rem;">Belum ada catatan timeline untuk proyek ini.</p>`;
    }
}

function renderProyekDetail(p) {
    const elHeaderNama = document.getElementById('proyekNamaHeader');
    const elHeaderKode = document.getElementById('proyekKodeHeader');
    if (elHeaderNama) elHeaderNama.textContent = p.nama_proyek;
    if (elHeaderKode) elHeaderKode.textContent = `${p.kode_proyek} • Repository Usulan s.d. Pembangunan`;

    const bTahun = document.getElementById('badgeTahun');
    const bFase = document.getElementById('badgeFase');
    const bLokasi = document.getElementById('badgeLokasi');
    if (bTahun) bTahun.textContent = `TA ${p.tahun}`;
    if (bFase) bFase.textContent = `Fase: ${p.status_fase}`;
    if (bLokasi) bLokasi.textContent = p.kabkota || 'Jawa Timur';

    const elNama = document.getElementById('proyekNama');
    const elDeskripsi = document.getElementById('proyekDeskripsi');
    if (elNama) elNama.textContent = p.nama_proyek;
    if (elDeskripsi) elDeskripsi.textContent = p.deskripsi || 'Tidak ada keterangan tambahan.';

    const progres = p.progres_fisik_persen || 0;
    const elProgText = document.getElementById('progresText');
    const elProgBar = document.getElementById('progresBar');
    if (elProgText) elProgText.textContent = `${progres}%`;
    if (elProgBar) elProgBar.style.width = `${progres}%`;

    const elPagu = document.getElementById('infoPagu');
    const elKontraktor = document.getElementById('infoKontraktor');
    const elKonsultan = document.getElementById('infoKonsultan');
    const elLokasi = document.getElementById('infoLokasi');

    if (elPagu) elPagu.textContent = p.pagu_anggaran ? `Rp ${p.pagu_anggaran.toLocaleString('id-ID')}` : '-';
    if (elKontraktor) elKontraktor.textContent = p.kontraktor || '-';
    if (elKonsultan) elKonsultan.textContent = p.konsultan || '-';
    if (elLokasi) elLokasi.textContent = p.lokasi_detail || p.kabkota || '-';

    // Render Vertical Timeline
    const timelineContainer = document.getElementById('timelineList');
    const timelines = p.timelines || [];
    const elTimeCount = document.getElementById('timelineCount');
    if (elTimeCount) elTimeCount.textContent = `${timelines.length} Kejadian`;

    if (timelineContainer) {
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
                        <h4 style="font-size:0.9rem; font-weight:700; margin-bottom:0.25rem;">${item.judul}</h4>
                        <p style="font-size:0.8rem; color:var(--text-body); line-height:1.4;">${item.catatan || ''}</p>
                        ${item.progres_saat_ini !== null ? `<small style="color:var(--primary); font-weight:700; display:block; margin-top:0.35rem;">Progres Fisik: ${item.progres_saat_ini}%</small>` : ''}
                    </div>
                </div>
            `).join('');
        }
    }

    // Render Persuratan
    const suratTbody = document.getElementById('suratTableBody');
    const suratList = p.surat_list || [];
    const elSuratCount = document.getElementById('suratCount');
    if (elSuratCount) elSuratCount.textContent = `${suratList.length} Berkas`;

    if (suratTbody) {
        if (suratList.length === 0) {
            suratTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:1.25rem; color:var(--text-muted);">Belum ada berkas persuratan tersimpan.</td></tr>`;
        } else {
            suratTbody.innerHTML = suratList.map(s => `
                <tr>
                    <td><strong>${s.no_surat}</strong><br><small style="color:var(--text-muted);">${s.tgl_surat}</small></td>
                    <td><strong>${s.jenis_surat}</strong><br><small>${s.perihal}</small></td>
                    <td>${s.pengirim || '-'}</td>
                    <td><span class="badge badge-success">${s.status_disposisi || 'Selesai'}</span></td>
                    <td>
                        ${s.file_path ? `<a href="${s.file_path}" target="_blank" class="btn btn-sm btn-outline">📥 Unduh PDF</a>` : '<span style="color:var(--text-muted); font-size:0.75rem;">-</span>'}
                    </td>
                </tr>
            `).join('');
        }
    }
}

function checkProyekLoginState() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const quickBtn = document.getElementById('quickAddBtn');
    if (quickBtn && token && user) {
        quickBtn.style.display = 'inline-flex';
    }
}

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
        if (btnTime) btnTime.className = 'btn btn-primary btn-sm';
        if (btnSurat) btnSurat.className = 'btn btn-outline btn-sm';
        if (formTime) formTime.style.display = 'block';
        if (formSurat) formSurat.style.display = 'none';
    } else {
        if (btnTime) btnTime.className = 'btn btn-outline btn-sm';
        if (btnSurat) btnSurat.className = 'btn btn-primary btn-sm';
        if (formTime) formTime.style.display = 'none';
        if (formSurat) formSurat.style.display = 'block';
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

// Auto run on DOM ready
document.addEventListener('DOMContentLoaded', initProyekDetailPage);
