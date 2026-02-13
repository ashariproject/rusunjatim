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
    coordStatus: ['verified', 'need_validation'],
    searchQuery: ''
};

// LocalStorage key for saved coordinates
const STORAGE_KEY = 'rusun_new_coords';

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadData();
        initializeTabs();
        initializeMap();
        initializeFormMap();
        populateFilters();
        updateStatistics();
        renderTable();
        loadMissingCoordinatesForm();
        loadSavedData();
        attachEventListeners();
    } catch (e) {
        console.error(e);
    }
});

// ===== Load Data =====
async function loadData() {
    try {
        const response = await fetch('rusun_data.json?v=2026-02-13-6');
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
        btn.addEventListener('click', () => {
            const targetTabId = btn.dataset.tab;

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

    // Create popup content
    const popupContent = `
        <div class="popup-content">
            <div class="popup-image-container" style="display: none;">
                <img src="images/rusun/${rusun.id}.jpg" 
                     alt="${rusun.nama_rusun}" 
                     class="popup-image"
                     onload="this.parentElement.style.display='block'"
                     onerror="this.src='images/rusun/${rusun.id}.JPG'; this.onerror=null;">
            </div>
            <h3>${rusun.nama_rusun || 'Tidak ada nama'}</h3>
            <div class="popup-row">
                <span class="popup-label">Alamat:</span>
                <span class="popup-value">${rusun.alamat || '-'}</span>
            </div>
            <div class="popup-row">
                <span class="popup-label">Kab/Kota:</span>
                <span class="popup-value">${rusun.kabkota || '-'}</span>
            </div>
            <div class="popup-row">
                <span class="popup-label">Tahun:</span>
                <span class="popup-value">${rusun.tahun_anggaran || '-'}</span>
            </div>
            <div class="popup-row">
                <span class="popup-label">Tipe:</span>
                <span class="popup-value">${rusun.tipe_rusun || '-'}</span>
            </div>
            <div class="popup-row">
                <span class="popup-label">Jumlah Unit:</span>
                <span class="popup-value">${rusun.jumlah_unit || '-'}</span>
            </div>
            <div class="popup-row">
                <span class="popup-label">Kondisi:</span>
                <span class="popup-value">${rusun.kondisi_bangunan || '-'}</span>
            </div>
            <div class="popup-row">
                <span class="popup-label">Koordinat:</span>
                <span class="popup-value">${lat.toFixed(6)}, ${lng.toFixed(6)}</span>
            </div>
            <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" class="btn-link" style="margin-top: 0.5rem;">📍 Lihat di Google Maps</a>
        </div>
    `;

    marker.bindPopup(popupContent, { maxWidth: 300 });

    return marker;
}

// ===== Populate Filters =====
function populateFilters() {
    // Get unique kabkota, tipe, and penerima
    const kabkotaSet = new Set();
    const tipeSet = new Set();
    const penerimaSet = new Set();

    rusunData.forEach(rusun => {
        if (rusun.kabkota) kabkotaSet.add(rusun.kabkota);
        if (rusun.tipe_rusun) tipeSet.add(rusun.tipe_rusun);
        if (rusun.penerima) penerimaSet.add(rusun.penerima);
    });

    // Populate kabkota dropdown
    const kabkotaSelect = document.getElementById('filterKabkota');
    Array.from(kabkotaSet).sort().forEach(kabkota => {
        const option = document.createElement('option');
        option.value = kabkota;
        option.textContent = kabkota;
        kabkotaSelect.appendChild(option);
    });

    // Populate tipe dropdown
    const tipeSelect = document.getElementById('filterTipe');
    Array.from(tipeSet).sort().forEach(tipe => {
        const option = document.createElement('option');
        option.value = tipe;
        option.textContent = tipe;
        tipeSelect.appendChild(option);
    });

    // Populate penerima dropdown
    const penerimaSelect = document.getElementById('filterPenerima');
    Array.from(penerimaSet).sort().forEach(penerima => {
        const option = document.createElement('option');
        option.value = penerima;
        option.textContent = penerima;
        penerimaSelect.appendChild(option);
    });
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

        // Filter by coordinate status
        if (!currentFilters.coordStatus.includes(rusun.koordinat.status)) {
            return false;
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

    const statTotalEl = document.getElementById('statTotal');
    if (statTotalEl) {
        statTotalEl.textContent = rusunData.length;
    }

    document.getElementById('statMBR').textContent = mbr;
    document.getElementById('statPesertaDidik').textContent = pesertaDidik;
    document.getElementById('statPekerja').textContent = pekerjaIndustri;
    document.getElementById('statASNTNIPOLRI').textContent = asnTniPolri;
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
        });
    }

    document.getElementById('filterKabkota').addEventListener('change', (e) => {
        currentFilters.kabkota = e.target.value;
        updateMapMarkers();
    });

    document.getElementById('filterYearMin').addEventListener('change', (e) => {
        currentFilters.yearMin = e.target.value ? parseInt(e.target.value) : null;
        updateMapMarkers();
    });

    document.getElementById('filterYearMax').addEventListener('change', (e) => {
        currentFilters.yearMax = e.target.value ? parseInt(e.target.value) : null;
        updateMapMarkers();
    });

    document.getElementById('filterTipe').addEventListener('change', (e) => {
        currentFilters.tipe = e.target.value;
        updateMapMarkers();
    });

    document.getElementById('filterPenerima').addEventListener('change', (e) => {
        currentFilters.penerima = e.target.value;
        updateMapMarkers();
    });

    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            currentFilters.coordStatus = Array.from(
                document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked')
            ).map(cb => cb.value);
            updateMapMarkers();
        });
    });

    document.getElementById('resetFilters').addEventListener('click', () => {
        currentFilters = {
            kabkota: '',
            yearMin: null,
            yearMax: null,
            tipe: '',
            penerima: '',
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
        document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => {
            cb.checked = cb.value !== 'missing';
        });
        updateMapMarkers();
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
    document.getElementById('saveCoord').addEventListener('click', saveCoordinate);
    document.getElementById('exportUpdatedData').addEventListener('click', exportUpdatedData);

    // Fix map rendering when switching tabs - MOVED TO initializeTabs function to avoid duplicates
}
