// Global variables
let rusunData = [];
let map = null;
let formMap = null;
let markers = [];
let markerClusterGroup = null;
let currentFilters = {
    kabkota: '',
    yearMin: null,
    yearMax: null,
    tipe: '',
    penerima: '', // Ensure this exists
    satker: '', // New filter
    coordStatus: ['verified', 'need_validation', 'missing'],
    searchQuery: ''
};

let charts = {}; // Store chart instances

// LocalStorage key for saved coordinates
const STORAGE_KEY = 'rusun_new_coords';

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', async () => {
    // ===== Initialize Theme =====
    const themeToggle = document.getElementById('themeToggle');
    const iconLight = document.querySelector('.icon-light');
    const iconDark = document.querySelector('.icon-dark');

    function setTheme(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark');
            if (iconLight) iconLight.style.display = 'none';
            if (iconDark) iconDark.style.display = 'inline';
        } else {
            document.documentElement.classList.remove('dark');
            if (iconLight) iconLight.style.display = 'inline';
            if (iconDark) iconDark.style.display = 'none';
        }
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Update Chart.js defaults if object exists
        if (typeof Chart !== 'undefined') {
            Chart.defaults.color = isDark ? '#94a3b8' : '#64748b';
            Chart.defaults.borderColor = isDark ? '#334155' : '#e2e8f0';
            Object.values(charts).forEach(chart => {
                if (chart) chart.update();
            });
        }
    }

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setTheme(true);
    } else {
        setTheme(false);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.contains('dark');
            setTheme(!isDark);
        });
    }

    try {
        // Hanya jalankan jika berada di halaman peta / tabel utama
        if (!document.getElementById('map') && !document.getElementById('dataTable')) {
            return;
        }
        await loadData();

        // 1. Populasi filter dropdown, angka statistik, dan tabel data pertama kali
        populateFilters();
        updateStatistics();
        renderTable();

        // 2. Inisialisasi peta Leaflet, tab, grafik, dan listener
        initializeTabs();
        initializeMap();
        initCharts();
        attachEventListeners();
    } catch (e) {
        console.error('Inisialisasi utama error:', e);
    }
});

// ===== Load Data =====
async function loadData() {
    try {
        const response = await fetch('/rusun_data.json?v=' + Date.now());
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        rusunData = data.rusun;
        console.log(`Data loaded successfully: ${rusunData.length} records found.`);
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Gagal memuat data. ' + error.message);
    }
}

// ===== Tab Navigation =====
// ===== Tab Navigation =====
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetTabId = btn.dataset.tab;
            if (!targetTabId) return; // Abaikan link eksternal seperti admin/proyek

            console.log('Tab clicked:', targetTabId); // Debug logging

            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked
            btn.classList.add('active');
            const targetContent = document.getElementById(targetTabId + 'Tab');
            if (targetContent) {
                targetContent.classList.add('active');
            } else {

            }

            // Invalidate map size when switching to map tab
            if (targetTabId === 'map') {
                setTimeout(() => {
                    if (map) {
                        map.invalidateSize();
                        // Re-render markers to ensure they appear
                        updateMapMarkers();
                    }
                }, 100);
            }

            if (targetTabId === 'form') {
                setTimeout(() => {
                    if (formMap) formMap.invalidateSize();
                }, 100);
            }

            // Update charts when switching to grafis tab
            if (targetTabId === 'grafis') {
                setTimeout(() => {
                    Object.values(charts).forEach(c => {
                        if (c && typeof c.resize === 'function') c.resize();
                    });
                    updateCharts(getFilteredData());
                }, 80);
            }
        });
    });
}

// ===== Initialize Main Map =====
function initializeMap() {
    // Create map centered on East Java
    map = L.map('map').setView([-7.5, 112.5], 8);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Initialize marker cluster group
    markerClusterGroup = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false
    });

    map.addLayer(markerClusterGroup);

    // Add markers
    updateMapMarkers();
}

// ===== Update Map Markers =====
function updateMapMarkers() {
    // Clear existing markers
    markerClusterGroup.clearLayers();
    markers = [];

    // Filter data
    const filteredData = getFilteredData();

    // Add markers for rusun with coordinates
    filteredData.forEach(rusun => {
        if (rusun.koordinat.lat && rusun.koordinat.lng) {
            const marker = createMarker(rusun);
            markers.push(marker);
            markerClusterGroup.addLayer(marker);
        }
    });

    console.log('Markers updated:', markers.length);
}

// Mapping ID Rusun yang memiliki file foto
const KNOWN_RUSUN_PHOTOS = {
    19: "19.jpg", 127: "127.jpg", 138: "138.jpg", 159: "159.jpg", 164: "164.jpg", 199: "199.jpg", 
    206: "206.jpg", 218: "218.jpg", 220: "220.JPG", 238: "238.jpg", 244: "244.jpg", 249: "249.jpeg", 
    251: "251.JPG", 265: "265.jpg", 271: "271.jpg", 272: "272.JPG", 273: "273.jpg", 
    274: "274.jpg", 275: "275.JPG", 277: "277.jpg", 279: "279.jpg", 280: "280.jpg", 
    281: "281.jpg", 289: "289.jpg", 296: "296.jpg", 297: "297.jpg", 314: "314.jpg", 327: "327.jpg", 
    333: "333.jpg", 341: "341.jpg", 342: "342.jpg", 343: "343.jpg", 350: "350.jpg", 
    351: "351.jpg", 352: "352.JPG", 353: "353.JPG", 354: "354.JPG", 355: "355.JPG", 
    357: "357.jpg", 359: "359.jpg", 360: "360.jpg", 363: "363.JPG", 365: "365.jpg", 
    366: "366.jpg", 367: "367.jpg", 368: "368.jpg", 369: "369.jpg", 370: "370.jpg", 
    371: "371.JPG", 372: "372.jpg", 373: "373.JPG", 374: "374.JPG", 375: "375.JPG"
};

// ===== Create Marker =====
function createMarker(rusun) {
    const { lat, lng, status } = rusun.koordinat;

    // Custom icon based on status
    const iconColor = status === 'verified' ? '#10b981' : '#f59e0b';
    const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${iconColor}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    const marker = L.marker([lat, lng], { icon });

    // Deteksi ketersediaan foto secara instan
    const photoFileName = KNOWN_RUSUN_PHOTOS[rusun.id] || (rusun.foto || rusun.foto_utama);

    let photoHtml = '';
    if (photoFileName) {
        photoHtml = `
            <div class="popup-image-container">
                <span class="loading-text" style="color: #94a3b8; font-size: 0.8rem;">Memuat foto...</span>
                <img data-rusun-id="${rusun.id}"
                     data-photo-file="${photoFileName}"
                     alt="${rusun.nama_rusun}" 
                     class="popup-image rusun-photo"
                     style="display: none;">
            </div>
        `;
    } else {
        photoHtml = `
            <div class="popup-image-container empty-photo">
                <span style="font-size: 1.35rem; margin-bottom: 0.2rem; opacity: 0.65;">📷</span>
                <strong>Data Foto belum tersedia</strong>
            </div>
        `;
    }

    // Create popup content
    const popupContent = `
        <div class="popup-content">
            ${photoHtml}
            <div class="popup-details">
                <h3>${rusun.nama_rusun || 'Tidak ada nama'}</h3>
                <table class="popup-table">
                    <tr>
                        <td>Alamat</td>
                        <td>${rusun.alamat || '-'}</td>
                    </tr>
                    <tr>
                        <td>Kab/Kota</td>
                        <td>${rusun.kabkota || '-'}</td>
                    </tr>
                    <tr>
                        <td>Tahun</td>
                        <td>${rusun.tahun_anggaran || '-'}</td>
                    </tr>
                    <tr>
                        <td>Tipe</td>
                        <td>${rusun.tipe_rusun || '-'} (${rusun.jumlah_lantai || '-'} Lantai)</td>
                    </tr>
                    <tr>
                        <td>Jumlah Unit</td>
                        <td>${rusun.jumlah_unit || '-'}</td>
                    </tr>
                    <tr>
                        <td>Kondisi</td>
                        <td>${rusun.kondisi_bangunan || '-'}</td>
                    </tr>
                    <tr>
                        <td>Koordinat</td>
                        <td>${lat.toFixed(6)}, ${lng.toFixed(6)}</td>
                    </tr>
                </table>
                <div class="popup-actions">
                    <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" class="btn-link">📍 Lihat di Google Maps</a>
                    <a href="profile/${rusun.id}.pdf" target="_blank" class="btn-link btn-link-pdf" data-pdf-link style="display:none;">📄 Lihat Profil</a>
                </div>
            </div>
        </div>
    `;

    marker.bindPopup(popupContent, { 
        maxWidth: 320,
        minWidth: 280,
        className: 'rusun-leaflet-popup'
    });

    // Use Leaflet's popupopen event to attach image handlers AFTER DOM is ready
    marker.on('popupopen', function () {
        const popup = marker.getPopup();
        const el = popup.getElement();
        if (!el) return;

        // Show PDF profile button if PDF exists
        const pdfLink = el.querySelector('[data-pdf-link]');
        if (pdfLink) {
            fetch('profile/' + rusun.id + '.pdf', { method: 'HEAD' })
                .then(res => { 
                    if (res.ok) {
                        pdfLink.style.display = 'inline-flex';
                        popup.update();
                    }
                })
                .catch(() => { });
        }

        const img = el.querySelector('.rusun-photo');
        if (img) {
            const photoFile = img.dataset.photoFile;
            const loader = img.parentElement.querySelector('.loading-text');

            img.onload = function () {
                img.style.display = 'block';
                if (loader) loader.style.display = 'none';
                popup.update();
            };

            img.onerror = function () {
                img.style.display = 'none';
                img.parentElement.classList.add('empty-photo');
                img.parentElement.innerHTML = '<span style="font-size: 1.35rem; margin-bottom: 0.2rem; opacity: 0.65;">📷</span><strong>Data Foto belum tersedia</strong>';
                popup.update();
            };

            // Load exact image
            img.src = 'images/rusun/' + photoFile;
        }
    });

    return marker;
}

// ===== Populate Filters =====
function populateFilters() {
    // Get unique kabkota, tipe, penerima, and satker
    const kabkotaSet = new Set();
    const tipeSet = new Set();
    const penerimaSet = new Set();
    const satkerSet = new Set();

    rusunData.forEach(rusun => {
        if (rusun.kabkota) kabkotaSet.add(rusun.kabkota);
        if (rusun.tipe_rusun) tipeSet.add(rusun.tipe_rusun);
        if (rusun.penerima) penerimaSet.add(rusun.penerima);
        if (rusun.asset_satker) satkerSet.add(rusun.asset_satker);
    });

    // Populate kabkota dropdown
    const kabkotaSelect = document.getElementById('filterKabkota');
    if (kabkotaSelect) {
        kabkotaSelect.innerHTML = '<option value="">Semua Kabupaten/Kota</option>';
        Array.from(kabkotaSet).sort().forEach(kabkota => {
            const option = document.createElement('option');
            option.value = kabkota;
            option.textContent = kabkota;
            kabkotaSelect.appendChild(option);
        });
    }

    // Populate tipe dropdown
    const tipeSelect = document.getElementById('filterTipe');
    if (tipeSelect) {
        tipeSelect.innerHTML = '<option value="">Semua Tipe</option>';
        Array.from(tipeSet).sort().forEach(tipe => {
            const option = document.createElement('option');
            option.value = tipe;
            option.textContent = tipe;
            tipeSelect.appendChild(option);
        });
    }

    // Populate penerima dropdown
    const penerimaSelect = document.getElementById('filterPenerima');
    if (penerimaSelect) {
        penerimaSelect.innerHTML = '<option value="">Semua Kategori</option>';
        Array.from(penerimaSet).sort().forEach(penerima => {
            const option = document.createElement('option');
            option.value = penerima;
            option.textContent = penerima;
            penerimaSelect.appendChild(option);
        });
    }

    // Populate satker dropdown
    const satkerSelect = document.getElementById('filterSatker');
    if (satkerSelect) {
        satkerSelect.innerHTML = '<option value="">Semua Satker</option>';
        Array.from(satkerSet).sort().forEach(satker => {
            const option = document.createElement('option');
            option.value = satker;
            option.textContent = satker;
            satkerSelect.appendChild(option);
        });
    }
}



// ===== Get Filtered Data =====
function getFilteredData() {
    return rusunData.filter(rusun => {
        // Filter by search query
        if (currentFilters.searchQuery) {
            const query = currentFilters.searchQuery.toLowerCase();
            const matchesSearch = (
                (rusun.nama_rusun && rusun.nama_rusun.toLowerCase().includes(query)) ||
                (rusun.alamat && rusun.alamat.toLowerCase().includes(query)) ||
                (rusun.kabkota && rusun.kabkota.toLowerCase().includes(query))
            );
            if (!matchesSearch) return false;
        }

        // Filter by kabkota
        if (currentFilters.kabkota && rusun.kabkota !== currentFilters.kabkota) {
            return false;
        }

        // Filter by year
        if (currentFilters.yearMin && rusun.tahun_anggaran < currentFilters.yearMin) {
            return false;
        }
        if (currentFilters.yearMax && rusun.tahun_anggaran > currentFilters.yearMax) {
            return false;
        }

        // Filter by tipe
        if (currentFilters.tipe && rusun.tipe_rusun !== currentFilters.tipe) {
            return false;
        }

        // Filter by penerima
        if (currentFilters.penerima && rusun.penerima !== currentFilters.penerima) {
            return false;
        }

        // Filter by satker
        if (currentFilters.satker && rusun.asset_satker !== currentFilters.satker) {
            return false;
        }

        // Filter by coordinate status if checkboxes exist
        const hasCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]').length > 0;
        if (hasCheckboxes) {
            const hasCoords = rusun.koordinat && rusun.koordinat.lat && rusun.koordinat.lng;
            let status = 'missing';
            if (hasCoords) {
                status = rusun.koordinat.status || 'verified';
            }
            if (!currentFilters.coordStatus.includes(status)) {
                return false;
            }
        }

        return true;
    });
}

// ===== Update Statistics =====
// ===== Update Statistics =====
function updateStatistics() {
    // Count by recipient category from penerima field
    let mbr = 0;
    let pesertaDidik = 0;
    let pekerjaIndustri = 0;
    let asnTniPolri = 0;

    rusunData.forEach((rusun) => {
        const penerima = String(rusun.penerima || '').trim();

        // Categorize based on penerima value
        if (penerima === 'MBR') {
            mbr++;
        } else if (penerima.includes('Peserta Didik')) {
            pesertaDidik++;
        } else if (penerima === 'Pekerja Industri') {
            pekerjaIndustri++;
        } else if (penerima === 'TNI' || penerima === 'POLRI' || penerima.includes('ASN')) {
            asnTniPolri++;
        } else {
            // Default to MBR if unknown or empty, but log it if needed
            if (penerima) console.log('Uncategorized penerima:', penerima);
            mbr++;
        }
    });

    const setElemText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setElemText('statTotal', rusunData.length);
    setElemText('statMBR', mbr);
    setElemText('statPesertaDidik', pesertaDidik);
    setElemText('statPekerja', pekerjaIndustri);
    setElemText('statASNTNIPOLRI', asnTniPolri);

    // Update Satker Legend
    updateSatkerLegend();
}

// ===== Update Satker Legend =====
function updateSatkerLegend() {
    const legendContainer = document.getElementById('satker-legend');
    if (!legendContainer) return;

    // Count satker from *filtered* data or *all* data? 
    // Usually legend reflects current view, but request said "jumlah masing-masing aset satker", implies total or filtered.
    // Let's use rusunData (total) to match the request context of "info penting" usually meaning global stats.
    // But if filters are active, map markers change. 
    // Let's use *filtered* data to be consistent with the map.
    // Wait, existing stats (MBR etc) use rusunData (global). 
    // Let's use visible data (filteredData) if we want it to react to filters, or rusunData if global.
    // Given it's a "Legend", it usually describes what's on the map.
    // However, the user asked for "jumlah masing-masing", often implying a summary.
    // Let's stick to global stats for now as it seems to be general info, 
    // OR matches the logic of `updateStatistics` which uses `rusunData`.

    // Actually, `updateMapMarkers` calls `getFilteredData`. 
    // `updateStatistics` is called once at init. 

    // Let's calculate based on `rusunData` to show total asset distribution.

    const satkerCounts = {};
    rusunData.forEach(r => {
        const satker = r.asset_satker || 'Tidak Diketahui';
        satkerCounts[satker] = (satkerCounts[satker] || 0) + 1;
    });

    legendContainer.innerHTML = '';

    Object.entries(satkerCounts)
        .sort((a, b) => b[1] - a[1]) // Sort by count desc
        .forEach(([satker, count]) => {
            const item = document.createElement('div');
            item.className = 'satker-item';
            item.innerHTML = `
                <span>${satker}</span>
                <span class="satker-count">${count}</span>
            `;
            legendContainer.appendChild(item);
        });
}


// ===== Render Table =====
let currentPage = 1;
const rowsPerPage = 50;
let tableData = [];
let searchQuery = '';

function renderTable() {
    tableData = rusunData.filter(rusun => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            (rusun.nama_rusun && rusun.nama_rusun.toLowerCase().includes(query)) ||
            (rusun.alamat && rusun.alamat.toLowerCase().includes(query)) ||
            (rusun.kabkota && rusun.kabkota.toLowerCase().includes(query))
        );
    });

    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = tableData.slice(start, end);

    if (pageData.length === 0) {
        console.log('WARNING: No data to render for this page.');
    }

    pageData.forEach((rusun, index) => {
        const row = document.createElement('tr');
        if (!rusun.koordinat || !rusun.koordinat.lat || !rusun.koordinat.lng) {
            row.classList.add('no-coords');
        }

        const lat = rusun.koordinat?.lat;
        const lng = rusun.koordinat?.lng;

        const coordText = lat && lng
            ? `${lat.toFixed(6)}, ${lng.toFixed(6)}`
            : 'Belum ada';

        const actionBtn = lat && lng
            ? `<a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" class="btn-link">📍 Maps</a>`
            : '<span style="color: #ef4444;">Belum ada</span>';

        row.innerHTML = `
            <td>${rusun.id}</td>
            <td>${rusun.tahun_anggaran || '-'}</td>
            <td>${rusun.nama_rusun || '-'}</td>
            <td>${rusun.alamat || '-'}</td>
            <td>${rusun.kabkota || '-'}</td>
            <td>${coordText}</td>
            <td>${rusun.tipe_rusun || '-'}</td>
            <td>${rusun.penerima || '-'}</td>
            <td>${rusun.jumlah_unit || '-'}</td>
            <td>${rusun.kondisi_bangunan || '-'}</td>
            <td>${actionBtn}</td>
        `;

        tbody.appendChild(row);
    });

    renderPagination();
}

// ===== Render Pagination =====
function renderPagination() {
    const totalPages = Math.ceil(tableData.length / rowsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-btn';
        btn.textContent = i;
        if (i === currentPage) btn.classList.add('active');
        btn.addEventListener('click', () => {
            currentPage = i;
            renderTable();
        });
        pagination.appendChild(btn);
    }
}

// ===== Initialize Form Map =====
function initializeFormMap() {
    formMap = L.map('formMap').setView([-7.5, 112.5], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(formMap);

    let tempMarker = null;

    formMap.on('click', (e) => {
        const { lat, lng } = e.latlng;

        // Remove previous marker
        if (tempMarker) {
            formMap.removeLayer(tempMarker);
        }

        // Add new marker
        tempMarker = L.marker([lat, lng]).addTo(formMap);

        // Update input fields
        document.getElementById('inputLat').value = lat.toFixed(6);
        document.getElementById('inputLng').value = lng.toFixed(6);
    });
}

// ===== Load Missing Coordinates Form =====
function loadMissingCoordinatesForm() {
    const select = document.getElementById('selectRusun');
    const missingRusun = rusunData.filter(r => !r.koordinat.lat || !r.koordinat.lng);

    missingRusun.forEach(rusun => {
        const option = document.createElement('option');
        option.value = rusun.id;
        option.textContent = `${rusun.nama_rusun || 'Tanpa nama'} - ${rusun.kabkota || ''}`;
        select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
        const rusunId = parseInt(e.target.value);
        const rusun = rusunData.find(r => r.id === rusunId);

        if (rusun) {
            document.getElementById('rusunInfo').style.display = 'block';
            document.getElementById('infoNama').textContent = rusun.nama_rusun || '-';
            document.getElementById('infoAlamat').textContent = rusun.alamat || '-';
            document.getElementById('infoKabkota').textContent = rusun.kabkota || '-';
        }
    });
}

// ===== Save Coordinate =====
function saveCoordinate() {
    const rusunId = parseInt(document.getElementById('selectRusun').value);
    const lat = parseFloat(document.getElementById('inputLat').value);
    const lng = parseFloat(document.getElementById('inputLng').value);

    if (!rusunId || !lat || !lng) {
        alert('Pilih rusun dan isi koordinat dengan benar!');
        return;
    }

    const rusun = rusunData.find(r => r.id === rusunId);
    if (!rusun) {
        alert('Rusun tidak ditemukan!');
        return;
    }

    // Get existing saved data
    let savedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    // Check if already exists
    const existingIndex = savedData.findIndex(d => d.id === rusunId);
    if (existingIndex >= 0) {
        savedData[existingIndex] = { id: rusunId, lat, lng, nama: rusun.nama_rusun, kabkota: rusun.kabkota };
    } else {
        savedData.push({ id: rusunId, lat, lng, nama: rusun.nama_rusun, kabkota: rusun.kabkota });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));

    alert('Koordinat berhasil disimpan!');
    loadSavedData();

    // Reset form
    document.getElementById('selectRusun').value = '';
    document.getElementById('inputLat').value = '';
    document.getElementById('inputLng').value = '';
    document.getElementById('rusunInfo').style.display = 'none';
}

// ===== Load Saved Data =====
function loadSavedData() {
    const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const tbody = document.getElementById('savedDataBody');
    tbody.innerHTML = '';

    if (savedData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #6b7280;">Belum ada data yang disimpan</td></tr>';
        return;
    }

    savedData.forEach((data, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.nama || '-'}</td>
            <td>${data.kabkota || '-'}</td>
            <td>${data.lat.toFixed(6)}</td>
            <td>${data.lng.toFixed(6)}</td>
            <td><button class="btn-link" onclick="deleteSavedData(${index})" style="background: #ef4444;">🗑️ Hapus</button></td>
        `;
        tbody.appendChild(row);
    });
}

// ===== Delete Saved Data =====
function deleteSavedData(index) {
    let savedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    savedData.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
    loadSavedData();
}

// ===== Export Updated Data =====
function exportUpdatedData() {
    const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    if (savedData.length === 0) {
        alert('Tidak ada data baru untuk di-export!');
        return;
    }

    const dataStr = JSON.stringify(savedData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rusun_koordinat_baru_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// ===== Export to Excel =====
function exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(rusunData.map(r => ({
        'No': r.id,
        'Tahun Anggaran': r.tahun_anggaran,
        'Nama Paket': r.nama_paket,
        'Nama Rusun': r.nama_rusun,
        'Alamat': r.alamat,
        'Kab/Kota': r.kabkota,
        'Latitude': r.koordinat.lat,
        'Longitude': r.koordinat.lng,
        'Status Koordinat': r.koordinat.status,
        'Tipe Rusun': r.tipe_rusun,
        'Penerima': r.penerima,
        'Varian': r.varian,
        'Jumlah Lantai': r.jumlah_lantai,
        'Jumlah Tower': r.jumlah_tower,
        'Jumlah Unit': r.jumlah_unit,
        'Kapasitas Hunian': r.kapasitas_hunian,
        'Kondisi Bangunan': r.kondisi_bangunan,
        'Status Lahan': r.status_lahan,
        'Asset Satker': r.asset_satker
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Rusun');
    XLSX.writeFile(wb, `database_rusun_jatim_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// ===== Attach Event Listeners =====
function attachEventListeners() {
    // Filter listeners
    const mapSearchInput = document.getElementById('mapSearch');
    if (mapSearchInput) {
        mapSearchInput.addEventListener('input', (e) => {
            currentFilters.searchQuery = e.target.value;
            updateMapMarkers();
            setTimeout(() => updateCharts(getFilteredData()), 100);
        });
    }

    document.getElementById('filterKabkota').addEventListener('change', (e) => {
        currentFilters.kabkota = e.target.value;
        updateMapMarkers();
        updateCharts(getFilteredData());
    });

    document.getElementById('filterYearMin').addEventListener('change', (e) => {
        currentFilters.yearMin = e.target.value ? parseInt(e.target.value) : null;
        updateMapMarkers();
        updateCharts(getFilteredData());
    });

    document.getElementById('filterYearMax').addEventListener('change', (e) => {
        currentFilters.yearMax = e.target.value ? parseInt(e.target.value) : null;
        updateMapMarkers();
        updateCharts(getFilteredData());
    });

    document.getElementById('filterTipe').addEventListener('change', (e) => {
        currentFilters.tipe = e.target.value;
        updateMapMarkers();
        updateCharts(getFilteredData());
    });

    document.getElementById('filterPenerima').addEventListener('change', (e) => {
        currentFilters.penerima = e.target.value;
        updateMapMarkers();
        updateCharts(getFilteredData());
    });

    const filterSatker = document.getElementById('filterSatker');
    if (filterSatker) {
        filterSatker.addEventListener('change', (e) => {
            currentFilters.satker = e.target.value;
            updateMapMarkers();
            renderTable();
            updateCharts(getFilteredData());
        });
    }

    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            currentFilters.coordStatus = Array.from(
                document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked')
            ).map(cb => cb.value);
            updateMapMarkers();
            updateCharts(getFilteredData());
        });
    });

    document.getElementById('resetFilters').addEventListener('click', () => {
        currentFilters = {
            kabkota: '',
            yearMin: null,
            yearMax: null,
            tipe: '',
            penerima: '',
            satker: '',
            coordStatus: ['verified', 'need_validation'],
            searchQuery: ''
        };
        const mapSearchInput = document.getElementById('mapSearch');
        if (mapSearchInput) mapSearchInput.value = '';

        document.getElementById('filterKabkota').value = '';
        document.getElementById('filterYearMin').value = '';
        document.getElementById('filterYearMax').value = '';
        document.getElementById('filterTipe').value = '';
        document.getElementById('filterPenerima').value = '';
        if (document.getElementById('filterSatker')) document.getElementById('filterSatker').value = '';

        document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => {
            cb.checked = cb.value !== 'missing';
        });
        updateMapMarkers();
        renderTable();
        updateCharts(rusunData);
    });

    // Table search
    document.getElementById('searchTable').addEventListener('input', (e) => {
        searchQuery = e.target.value;
        currentPage = 1;
        renderTable();
    });

    // Export Excel
    document.getElementById('exportExcel').addEventListener('click', exportToExcel);

    // Form listeners
    const btnSaveCoord = document.getElementById('saveCoord');
    if (btnSaveCoord) btnSaveCoord.addEventListener('click', saveCoordinate);
    const btnExportUpdatedData = document.getElementById('exportUpdatedData');
    if (btnExportUpdatedData) btnExportUpdatedData.addEventListener('click', exportUpdatedData);

    // Fix map rendering when switching tabs - MOVED TO initializeTabs function to avoid duplicates
}

// ===== Initialize Charts (Professional & Proportional) =====
function initCharts() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded');
        return;
    }

    const defaultFont = { family: "'Plus Jakarta Sans', 'Inter', sans-serif", size: 10 };
    const gridColor = 'rgba(148, 163, 184, 0.12)';

    try {
        // 1. Chart Tahun Anggaran (Vertical Bar)
        if (document.getElementById('chartTahun')) {
            charts.tahun = new Chart(document.getElementById('chartTahun'), {
                type: 'bar',
                data: { labels: [], datasets: [{ label: 'Jumlah Rusun Terbangun', data: [], backgroundColor: '#0284c7', borderRadius: 4, barPercentage: 0.75 }] },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', cornerRadius: 6, padding: 8 }
                    },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: defaultFont, maxRotation: 45 } },
                        y: { grid: { color: gridColor }, ticks: { font: defaultFont, precision: 0 } }
                    }
                }
            });
        }

        // 2. Chart Komposisi Tipe Rusun (Doughnut)
        if (document.getElementById('chartTipe')) {
            charts.tipe = new Chart(document.getElementById('chartTipe'), {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: ['#0284c7', '#059669', '#d97706', '#8b5cf6', '#e11d48', '#0891b2', '#64748b', '#ec4899', '#f97316', '#14b8a6'],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '62%',
                    plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 10, padding: 6, font: defaultFont } },
                        tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', cornerRadius: 6, padding: 8 }
                    }
                }
            });
        }

        // 3. Chart Asset Satker (Horizontal Bar)
        if (document.getElementById('chartSatker')) {
            charts.satker = new Chart(document.getElementById('chartSatker'), {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Jumlah Aset Rusun',
                        data: [],
                        backgroundColor: ['#059669', '#0284c7', '#6366f1', '#d97706'],
                        borderRadius: 4,
                        barPercentage: 0.65
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', cornerRadius: 6, padding: 8 }
                    },
                    scales: {
                        x: { grid: { color: gridColor }, ticks: { font: defaultFont, precision: 0 } },
                        y: { grid: { display: false }, ticks: { font: defaultFont } }
                    }
                }
            });
        }

        // 4. Chart Kondisi Bangunan (Doughnut)
        if (document.getElementById('chartKondisi')) {
            charts.kondisi = new Chart(document.getElementById('chartKondisi'), {
                type: 'doughnut',
                data: {
                    labels: ['Baik', 'Rusak Ringan', 'Rusak Sedang'],
                    datasets: [{
                        data: [],
                        backgroundColor: ['#059669', '#f59e0b', '#e11d48'],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '62%',
                    plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 10, padding: 6, font: defaultFont } },
                        tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', cornerRadius: 6, padding: 8 }
                    }
                }
            });
        }

        updateCharts(rusunData);
    } catch (e) {
        console.error('Error initializing charts:', e);
    }
}

// ===== Update Charts (Sync Data & KPI Metrics) =====
function updateCharts(data) {
    if (!data || data.length === 0) return;

    // 1. Update KPI Infografis Highlights
    const totalRusun = data.length;
    let totalUnitHunian = 0;
    let pesertaDidikCount = 0;
    let kondisiBaikCount = 0;

    data.forEach(r => {
        const units = parseInt(r.jumlah_unit);
        if (!isNaN(units)) totalUnitHunian += units;

        const penerima = String(r.penerima || '');
        if (penerima.includes('Peserta Didik')) pesertaDidikCount++;

        const kondisi = String(r.kondisi_bangunan || '').toUpperCase();
        if (kondisi === 'BAIK') kondisiBaikCount++;
    });

    const setElem = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setElem('kpiTotalRusun', totalRusun.toLocaleString('id-ID'));
    setElem('kpiTotalUnit', totalUnitHunian.toLocaleString('id-ID'));
    setElem('kpiPesertaDidik', pesertaDidikCount.toLocaleString('id-ID'));
    const pctBaik = totalRusun > 0 ? ((kondisiBaikCount / totalRusun) * 100).toFixed(1) + '%' : '0%';
    setElem('kpiKondisiBaik', pctBaik);

    // Helper to count frequencies
    const countBy = (arr, key) => {
        return arr.reduce((acc, curr) => {
            const val = curr[key] || 'Lainnya';
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {});
    };

    // 2. Update Chart Tahun Anggaran
    if (charts.tahun) {
        const normalizedData = data.map(item => {
            let year = item.tahun_anggaran;
            if (year && typeof year === 'string' && year.includes('Stimulus 2009')) {
                return { ...item, tahun_anggaran: '2009' };
            }
            return item;
        });

        const tahunCounts = countBy(normalizedData, 'tahun_anggaran');
        const sortedYears = Object.entries(tahunCounts).sort((a, b) => {
            const yA = parseInt(a[0]);
            const yB = parseInt(b[0]);
            if (isNaN(yA)) return 1;
            if (isNaN(yB)) return -1;
            return yA - yB;
        });

        charts.tahun.data.labels = sortedYears.map(([y]) => y);
        charts.tahun.data.datasets[0].data = sortedYears.map(([, count]) => count);
        charts.tahun.update();
    }

    // 3. Update Chart Tipe Rusun
    if (charts.tipe) {
        const tipeCounts = countBy(data, 'tipe_rusun');
        const sortedTipe = Object.entries(tipeCounts).sort(([, a], [, b]) => b - a).slice(0, 8);
        charts.tipe.data.labels = sortedTipe.map(([t]) => t);
        charts.tipe.data.datasets[0].data = sortedTipe.map(([, count]) => count);
        charts.tipe.update();
    }

    // 4. Update Chart Satker
    if (charts.satker) {
        const satkerCounts = countBy(data, 'asset_satker');
        const sortedSatker = Object.entries(satkerCounts).sort(([, a], [, b]) => b - a);
        charts.satker.data.labels = sortedSatker.map(([s]) => s);
        charts.satker.data.datasets[0].data = sortedSatker.map(([, count]) => count);
        charts.satker.update();
    }

    // 5. Update Chart Kondisi Bangunan
    if (charts.kondisi) {
        let baik = 0, ringan = 0, sedang = 0;
        data.forEach(r => {
            const k = String(r.kondisi_bangunan || '').toUpperCase();
            if (k === 'BAIK') baik++;
            else if (k.includes('RINGAN')) ringan++;
            else if (k.includes('SEDANG')) sedang++;
            else baik++;
        });

        charts.kondisi.data.labels = ['Baik', 'Rusak Ringan', 'Rusak Sedang'];
        charts.kondisi.data.datasets[0].data = [baik, ringan, sedang];
        charts.kondisi.update();
    }
}
