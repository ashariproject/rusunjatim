// Rusun Jatim - Handler Kronologis Fleksibel & Persuratan Proyek
const API_BASE = '/api';
let currentProyekData = null;
let allTimelines = [];
let allSuratList = [];

// Fallback Data Riil 44 Kronologis & Dokumen Rusun TNI AL Pasuruan (Status: 16 September 2026)
const DEFAULT_TNI_AL_DATA = [
  {
    "no": 1,
    "tanggal": "2026-02-20",
    "fase": "Rapat",
    "judul": "Pertemuan Menteri PKP dengan Kepala Staf Angkatan Laut (KSAL) di Jakarta",
    "nomor_dokumen": null,
    "keterangan": "Pertemuan Menteri PKP dengan Kepala Staf Angkatan Laut (KSAL) di Jakarta dalam rangka pembahasan rencana bantuan perumahan dan pembangunan rumah susun bagi prajurit TNI AL.",
    "bukti_dukung": "20-02-2026_Pertemuan Menteri PKP dengan Kepala Staf Angkatan Laut (KSAL) di Jakarta",
    "keywords": "Rapat, Notulen, Pertemuan, Usulan, Pimpinan, KSAL, Menteri PKP",
    "jenis_surat": "Notulen Rapat",
    "pengirim": "Kementerian PKP & Mabes TNI AL",
    "perihal": "Pertemuan Awal Menteri PKP dengan KSAL Terkait Rencana Pembangunan Rusun TNI AL",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgD4Cvk0ZRRyTKFWOhuiAnO4AbtzP65Az5So96za_d5rItU?e=UnUeZt"
  },
  {
    "no": 2,
    "tanggal": "2026-02-22",
    "fase": "Peninjauan",
    "judul": "Kementerian PKP bersama TNI AL Melaksanakan Peninjauan Lahan Rencana Pembangunan Rusun TNI AL Kab. Pasuruan",
    "nomor_dokumen": null,
    "keterangan": "Peninjauan lahan rencana pembangunan rumah susun TNI AL di Kab. Pasuruan, Jawa Timur. Dilaksanakan oleh:\n1. Direktur Jenderal Perumahan Perkotaan;\n2. Direktur Pembangunan Perumahan Perkotaan;\n3. Staf Ahli Menteri PKP Bidang Sistem Pembiayaan Pencegahan Korupsi dan Pemberdayaan Masyarakat;\n4. Staf Khusus Menteri PKP Bidang Internal dan Penjadwalan;\n5. Staf Khusus Menteri PKP bidang Perbankan dan Pembiayaan Kementerian PKP;\n6. Sekretaris Direktorat Jenderal Perumahan Perkotaan;\n7. Direktur Pembangunan Perumahan Perkotaan;\n8. Plt. Kepala Balai Pelaksana Penyediaan Perumahan dan Kawasan Permukiman Jawa IV;\n9. Kepala Satuan Kerja Perumahan dan Kawasan Permukiman;\n10. PPK Rumah Susun dan Rumah Khusus; dan\n11. Perwakilan TNI AL: Kepala Staf Angkatan Laut (KSAL) dan Komando Daerah Angkatan Laut (Kodaeral) V Surabaya.",
    "bukti_dukung": "22-02-2026_Kementerian PKP bersama TNI AL melaksanakan peninjauan lahan rencana pembangunan rumah susun TNI AL Kab. Pasuruan, Provinsi Jawa Timur",
    "keywords": "Peninjauan Lapangan, Lahan, Survei, Notulen, Kunjungan Kerja, TNI AL, Kodaeral V",
    "jenis_surat": "Laporan Peninjauan",
    "pengirim": "Tim Gabungan Kementerian PKP & TNI AL",
    "perihal": "Peninjauan Lahan Bersama Lokasi Rencana Pembangunan Rusun TNI AL Kab. Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgCI-Au_hhrbRp74-SJvbu00Afi0GRUVLLv2z9V0mzJlFuA?e=1fWNAg"
  },
  {
    "no": 3,
    "tanggal": "2026-02-25",
    "fase": "Rapat",
    "judul": "Rapat Pembahasan Hasil Peninjauan Lahan dan Kesiapan Dokumen Usulan Pembangunan Rusun TNI AL Pasuruan",
    "nomor_dokumen": "UM0102/DK.05/46/2026",
    "keterangan": "Rapat koordinasi melalui Zoom Meeting berdasarkan Undangan No. UM0102/DK.05/46/2026 tanggal 24 Februari 2026.\nHasil Pembahasan:\n1. Kondisi lahan siap bangun dengan luas lahan yang memenuhi persyaratan minimal, perlu dilaksanakan pembersihan lahan dan peninggian lahan 50-80 cm;\n2. Direktorat Jenderal Perumahan Perkotaan menyampaikan perihal pemenuhan administrasi usulan bantuan pembangunan rumah susun sesuai Peraturan Menteri Nomor 10 tahun 2025;\n3. TNI AL menyampaikan dokumen usulan yang disiapkan KSAL adalah permohonan bantuan usulan pembangunan rumah susun dan surat kesediaan menerima bangunan, untuk persyaratan lain diakomodir Kodaeral V Surabaya;\n4. PLN ULP Grati menyampaikan ketersediaan gardu terdekat 2 titik, siap melaksanakan survey dan pemasangan gardu baru (estimasi 20-40 hari kalender);\n5. Dinas Tata Ruang Kab. Pasuruan menyampaikan status Rencana Tata Ruang Wilayah (RTRW) pada lokasi usulan pembangunan.",
    "bukti_dukung": "25-02-2026_Rapat Pembahasan Hasil Peninjauan Lahan dan Kesiapan Dokumen Usulan Pembangunan Rumah Susun TNI AL Kabupaten Pasuruan serta koordinasi dengan Pemerintah Kabupaten Pasuruan melalui zoom meeting",
    "keywords": "Rapat, Notulen, Undangan, Persyaratan, Lahan, Kesiapan Lahan, PLN, RTRW, Pemkab Pasuruan",
    "jenis_surat": "Notulen Rapat / Undangan",
    "pengirim": "Ditjen Perumahan Perkotaan",
    "perihal": "Pembahasan Hasil Peninjauan Lahan dan Kesiapan Dokumen Usulan Rusun TNI AL Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgB2dXAKmznKRI8eUoEhIdRyASwGXTzcQATaBr4RZQrVNWE?e=IDS25Y"
  },
  {
    "no": 4,
    "tanggal": "2026-03-06",
    "fase": "DIPA",
    "judul": "Instruksi Penyusunan Dokumen Pendukung DIPA (KAK dan RAB) Rumah Susun TNI AL Kab. Pasuruan",
    "nomor_dokumen": "Instruksi Kasubdit Wilayah II (6 Maret 2026)",
    "keterangan": "Instruksi penyusunan dokumen pendukung DIPA (KAK dan RAB) Rumah Susun TNI AL Kab. Pasuruan dengan rincian:\n1. Total anggaran TA. 2026-2027: Rp47.995.000.000,00\n2. Opsi Komposisi 15% (2026) - 85% (2027):\n   - Perencanaan 2026: Rp150.000.000,00\n   - Fisik 2026: Rp6.980.850.000,00 | Fisik 2027: Rp41.014.150.000,00\n   - MK 2026: Rp294.600.000,00 | MK 2027: Rp1.669.400.000,00\n   - Wasdal 2026: Rp93.150.000,00 | Wasdal 2027: Rp527.850.000,00\n   - Mebel 2027: Rp2.306.000.000,00\n   - Total 2026: Rp6.980.850.000,00 | Total 2027: Rp41.014.150.000,00\n3. Opsi Komposisi 30% (2026) - 70% (2027):\n   - Perencanaan 2026: Rp150.000.000,00\n   - Fisik 2026: Rp12.886.200.000,00 | Fisik 2027: Rp30.067.800.000,00\n   - MK 2026: Rp589.200.000,00 | MK 2027: Rp1.374.800.000,00\n   - Wasdal 2026: Rp186.300.000,00 | Wasdal 2027: Rp434.700.000,00\n   - Mebel 2027: Rp2.306.000.000,00\n   - Total 2026: Rp13.811.700.000,00 | Total 2027: Rp34.183.300.000,00\nInstruksi disampaikan oleh Kasubdit Wilayah II, Dit. Pembangunan Perumahan Perkotaan kepada PPK Rusun Rusus.",
    "bukti_dukung": "6-03-2026_Instruksi penyusunan dokumen pendukung DIPA (KAK dan RAB) Rumah Susun TNI AL Kabupaten Pasuruan",
    "keywords": "Anggaran, DIPA, KAK, RAB, Instruksi, Disposisi, Perencanaan",
    "jenis_surat": "Instruksi Anggaran",
    "pengirim": "Kasubdit Wilayah II Dit. Pembangunan Perumahan Perkotaan",
    "perihal": "Instruksi Penyusunan KAK dan RAB Dokumen Pendukung DIPA Rusun TNI AL Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgB7By2j3-6JQrLiCpGyOfEmAV3kDh95nB-oGQcVG7EAIpw?e=3OezC6"
  },
  {
    "no": 5,
    "tanggal": "2026-03-16",
    "fase": "DIPA",
    "judul": "Perintah Penyusunan Dokumen Pendukung DIPA (KAK, RAB) Penyelenggaraan Rusun TNI AL Pasuruan",
    "nomor_dokumen": "Disposisi Ditjen Pembangunan Perumahan Perkotaan (16 Maret 2026)",
    "keterangan": "Perintah penyusunan dokumen pendukung DIPA (KAK, RAB) Direktorat Jenderal Pembangunan Perumahan Perkotaan dengan rincian:\n1. Perencanaan/DED: Rp250.000.000,00\n2. Fisik 2026: Rp8.310.000.000,00\n3. Fisik 2027: Rp33.240.000.000,00\n4. MK 2026: Rp374.200.000,00\n5. MK 2027: Rp1.496.800.000,00\n6. Meubelair: Rp2.206.000.000,00\n7. Wasdal 2026: Rp104.720.000,00\n8. Wasdal 2027: Rp418.880.000,00\nDisampaikan melalui Whatsapp resmi kepada PPK Rumah Susun dan Rumah Khusus.",
    "bukti_dukung": "16-03-2026_Perintah penyusunan dokumen pendukung DIPA (KAK, RAB) Direktorat Jenderal Pembangunan Perumahan Perkotaan, Penyelenggaraan Rumah Susun TNI AL Kabupaten Pasuruan",
    "keywords": "Anggaran, DIPA, KAK, RAB, Perintah, Disposisi, DED, Fisik",
    "jenis_surat": "Perintah DIPA",
    "pengirim": "Direktorat Pembangunan Perumahan Perkotaan",
    "perihal": "Penyusunan Dokumen Pendukung DIPA Penyelenggaraan Rusun TNI AL Kab. Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgA4vhmpcug7Q6BjIJiS2ufPAXEQ1Sf3-aWjl0FjoqpHtc0?e=I1H0gs"
  },
  {
    "no": 6,
    "tanggal": "2026-03-26",
    "fase": "Persyaratan",
    "judul": "Penyampaian Timeline Rencana Pelaksanaan Pembangunan Rumah Susun TNI AL Kab. Pasuruan",
    "nomor_dokumen": "Laporan PPK Rusun Rusus (26 Maret 2026)",
    "keterangan": "Penyampaian timeline rencana pelaksanaan Pembangunan Rumah Susun TNI AL Kabupaten Pasuruan oleh PPK Rumah Susun dan Rumah Khusus kepada Kepala Satuan Kerja Perumahan dan Kawasan Permukiman Provinsi Jawa Timur.",
    "bukti_dukung": "26-03-2026_Penyampaian timeline rencana pelaksanaan Pembangunan Rumah Susun TNI AL Kabupaten Pasuruan",
    "keywords": "Timeline, Laporan, Surat, Notulen, Rencana Kerja, PPK, Satker",
    "jenis_surat": "Laporan Timeline",
    "pengirim": "PPK Rumah Susun dan Rumah Khusus",
    "perihal": "Penyampaian Timeline Rencana Pelaksanaan Pembangunan Rusun TNI AL Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgAxRgvPT0N_RKrY09TW_rmXAY7Eom1azs-u_OscAYaSBXE?e=CbQN9G"
  },
  {
    "no": 7,
    "tanggal": "2026-03-26",
    "fase": "Persyaratan",
    "judul": "Justifikasi Teknis Kegiatan Pembangunan Rusun TNI AL Pasuruan Multi Years Contract (MYC) TA. 2026-2027",
    "nomor_dokumen": "RU0801-Bp9/203/B/2026",
    "keterangan": "Justifikasi teknis menjelaskan ketersediaan anggaran berdasarkan Satuan Tiga RKAKL DIPA Satuan Kerja Perumahan dan Kawasan Permukiman Provinsi Jawa Timur, Direktorat Jenderal Perumahan Perkotaan untuk pelaksanaan secara Kontrak Tahun Jamak (MYC) TA. 2026-2027.",
    "bukti_dukung": "26-03-2026_Justifikasi Teknis Kegiatan Pembangunan Rumah Susun TNI AL Kabupaten Pasuruan Multi Years Contract (MYC) TA. 2026-2027",
    "keywords": "Surat, Justifikasi Teknis, MYC, Anggaran, DIPA, Dokumen Teknis, Multi Years",
    "jenis_surat": "Justifikasi Teknis",
    "pengirim": "Satuan Kerja PKP Jawa Timur",
    "perihal": "Justifikasi Teknis Pembangunan Rumah Susun TNI AL Pasuruan Multi Years Contract (MYC)",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgAW-yIJzPZFTaZXVoF_OVz0AUGwclK8R_As3AbTq3DZT6U?e=62gJCC"
  },
  {
    "no": 8,
    "tanggal": "2026-03-31",
    "fase": "Rapat",
    "judul": "Koordinasi BP3KP Jawa IV dengan Kodaeral V Surabaya Pembahasan Pemenuhan Dokumen Usulan Rusun",
    "nomor_dokumen": "BA Koordinasi (31 Maret 2026)",
    "keterangan": "Rapat koordinasi dihadiri oleh Kepala Dinas Fasilitas Pangkalan Komando Daerah Angkatan Laut (Kodaeral) V Surabaya beserta jajaran, Kepala Seksi Pelaksanaan Wilayah II, Kepala Satuan Kerja Perumahan dan Kawasan Permukiman Provinsi Jawa Timur, PPK Rumah Susun dan Rumah Khusus.",
    "bukti_dukung": "31-03-2026_Koordinasi antara Balai Pelaksana Penyediaan Perumahan dan Kawasan Permukiman Provinsi Jawa Timur dengan Komando Daerah Angkatan Laut (Kodaeral) V Surabaya dengan pembahasan pemenuhan dokumen usulan pembangunan Rumah Susun TNI AL Kabupaten Pasuruan",
    "keywords": "Rapat, Notulen, Koordinasi, Dokumen Usulan, Kodaeral V, Persyaratan, BP3KP",
    "jenis_surat": "Notulen Koordinasi",
    "pengirim": "BP3KP Jawa IV & Kodaeral V Surabaya",
    "perihal": "Koordinasi Pembahasan Pemenuhan Dokumen Usulan Pembangunan Rusun TNI AL Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgDeqcKsNh5-RZBzEBdNRaLnAdqbvE7DNenA0kZ3-nupCiE?e=rdQiNO"
  },
  {
    "no": 9,
    "tanggal": "2026-04-15",
    "fase": "Rapat",
    "judul": "Undangan Rapat Pembahasan Tindak Lanjut Pembangunan Rusun di Lingkungan Kemhan/TNI",
    "nomor_dokumen": "Undangan Ditjen Kuathan Kemhan (15 April 2026)",
    "keterangan": "Direktur Fasilitas dan Jasa Direktorat Jenderal Kekuatan Pertahanan, Kementerian Pertahanan, mengundang Kementerian PKP untuk mengadakan rapat guna membahas tindak lanjut pembangunan rumah susun di lingkungan Kementerian Pertahanan/TNI.",
    "bukti_dukung": "15-04-2026_Direktur Fasilitas dan Jasa Direktorat Jenderal Kekuatan Pertahanan, Kementerian Pertahanan, mengundang Kementerian PKP untuk mengadakan rapat guna membahas tindak lanjut pembangunan rumah susun di lingkungan Kementerian Pertahanan TNI",
    "keywords": "Surat, Undangan, Rapat, Notulen, Kemhan, TNI, Kuathan, Tindak Lanjut",
    "jenis_surat": "Undangan Rapat",
    "pengirim": "Direktur Fasilitas dan Jasa Ditjen Kuathan Kemhan",
    "perihal": "Undangan Rapat Tindak Lanjut Pembangunan Rusun di Lingkungan Kemhan/TNI",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgDcFTWLh2RhSY8gx7AjD9naAbXR4IoBnMB0fPCDq_i14jA?e=kruwkn"
  },
  {
    "no": 10,
    "tanggal": "2026-04-22",
    "fase": "DIPA",
    "judul": "Penyesuaian Komposisi Anggaran MYC dengan Ketersediaan Anggaran Ditjen Kawasan Permukiman DJKP",
    "nomor_dokumen": "Nota Dinas Penyesuaian MYC (22 April 2026)",
    "keterangan": "Penyesuaian komposisi anggaran Multi Years Contract (MYC) dengan ketersediaan anggaran Direktorat Penyiapan Lahan dan Prasarana, Sarana, dan Utilitas Umum Kawasan Permukiman DJKP.",
    "bukti_dukung": "22-04-2026_Penyesuaian komposisi anggaran MYC dengan ketersediaan anggaran Direktorat Penyiapan Lahan dan Prasarana, Sarana, dan Utilitas Umum Kawasan Permukiman DJKP",
    "keywords": "Anggaran, MYC, DIPA, DJKP, Nota Dinas, Penyesuaian Anggaran",
    "jenis_surat": "Nota Dinas Anggaran",
    "pengirim": "Direktorat Penyiapan Lahan dan PSU Kawasan Permukiman",
    "perihal": "Penyesuaian Komposisi Anggaran MYC DJKP Pembangunan Rusun TNI AL Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgCqZRd4d9GEQr-jito5w6RMAQgbyba1zDQA6bu8HN_-9GQ?e=vZ2C8f"
  },
  {
    "no": 11,
    "tanggal": "2026-04-27",
    "fase": "Rapat",
    "judul": "Rapat Koordinasi Persiapan Pembangunan Rusun pada Ditjen Kawasan Permukiman TA. 2026-2027",
    "nomor_dokumen": "UM0102/Dp.03/05/B/2025",
    "keterangan": "Berdasarkan Undangan Direktur Penyiapan Lahan dan PSU nomor UM0102/Dp.03/05/B/2025 tanggal 24 April 2026. Peserta: Direktur Pembangunan Perumahan Perkotaan, Kasubdit Perencanaan Teknis, Kasubdit Wilayah II, Kasubdit PSU Kawasan Permukiman, Kabalai BP3KP Jawa IV.\nHasil Pembahasan:\n- Kekurangan dokumen pendukung kelengkapan anggaran berupa Rekomtek dan SPTJM Kepala Balai;\n- Pelaksanaan Pembangunan Rusun dikoordinasikan dan dianggarkan pada Ditjen Kawasan Permukiman, namun pengawasan teknisnya dilaksanakan oleh Ditjen Perumahan Perkotaan, sehingga sebelum memulai pelaksanaan harus tersusun regulasi yang jelas tentang pembagian kewenangan;\n- Tipologi rumah susun Wisma Arunika 36 / 4 lantai belum ada pada etalase e-katalog.",
    "bukti_dukung": "27-04-2026_Rapat Koordinasi Persiapan Pembangunan Rumah Susun pada Direktorat Jenderal Kawasan Permukiman TA. 2026-2027",
    "keywords": "Rapat, Notulen, Undangan, Rekomtek, SPTJM, E-Katalog, Regulasi, Wisma Arunika",
    "jenis_surat": "Notulen Rapat",
    "pengirim": "Direktur Penyiapan Lahan dan PSU Ditjen Kawasan Permukiman",
    "perihal": "Rapat Koordinasi Persiapan Pembangunan Rusun pada Ditjen Kawasan Permukiman",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgCetkLnlaC-Qr0-lSxd2JYpAcKiy2KIZaldI4wqO1rvhGQ?e=STEitr"
  },
  {
    "no": 12,
    "tanggal": "2026-04-27",
    "fase": "Peninjauan",
    "judul": "Peninjauan Usulan Lahan Rusun TNI AL Kompleks Tony Soekaton Morokrembangan Surabaya",
    "nomor_dokumen": "Laporan Peninjauan Lapangan (27 April 2026)",
    "keterangan": "Peninjauan oleh Kepala BP3KP Jawa IV, Kasi Wilayah II, Kasatker PKP, PPK Rusun Rusus bersama Kodaeral V di Kompleks Tony Soekaton, Kel. Morokrembangan, Surabaya.\nHasil Kunjungan Lapangan:\n1. Lahan belum siap bangun, perlu pematangan lahan berupa pengurugan dan pemadatan setinggi +/- 50 cm;\n2. Lahan kosong perlu pembersihan sampah, pohon, dan tanaman perdu eksisting;\n3. Terdapat SPBU di sisi Selatan lahan, wajib berjarak minimal 12 meter dari tangki penyimpanan sesuai aturan untuk mengurangi risiko radiasi panas kebakaran;\n4. Terdapat 2 opsi arah orientasi bangunan: menghadap sisi Timur atau sisi Utara lahan.",
    "bukti_dukung": "27-04-2026_Peninjauan usulan lahan pembangunan rumah susun TNI AL oleh Kodaeral V Surabaya di lokasi Kompleks Tony Soekaton, Kel. Morokrembangan, Kec. Krembangan, Kota Surabaya",
    "keywords": "Peninjauan Lapangan, Lahan, Notulen, Kodaeral V, Survei, Morokrembangan, SPBU",
    "jenis_surat": "Laporan Peninjauan",
    "pengirim": "Tim BP3KP Jawa IV & Kodaeral V",
    "perihal": "Peninjauan Lapangan Lokasi Rusun TNI AL Kompleks Tony Soekaton Surabaya",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgBKfsqxGc5oT5YA6m9uV-8pAajugwU0hiXZU5VFlZ7Vsew?e=nX2glh"
  },
  {
    "no": 13,
    "tanggal": "2026-05-03",
    "fase": "Rapat",
    "judul": "Video Conference Kunjungan Kerja Menteri PKP dengan Perwakilan TNI AL Terkait Kesiapan Usulan Lahan",
    "nomor_dokumen": "Notulen Vidcon (3 Mei 2026)",
    "keterangan": "Dihadiri oleh: Dit. Penyiapan Lahan & PSU Kawasan Permukiman, Dit. Pengembangan Kawasan Permukiman, Kadisfaslan Kodaeral V Surabaya, Kadis Perkim Kab. Surabaya, Kadis SDACKTR Kab. Pasuruan, Kadis PMPTSP Kab. Pasuruan, Kasi Pelaksanaan Wilayah II, PPK Rumah Susun dan Rumah Khusus.",
    "bukti_dukung": "3-05-2026_Video Conference Kunjungan Kerja Menteri PKP dengan perwakilan TNI AL terkait kesiapan usulan lahan pembangunan rumah susun TNI AL",
    "keywords": "Rapat, Notulen, Vidcon, Menteri PKP, Kesiapan Lahan, Kunjungan Kerja, TNI AL, Pasuruan",
    "jenis_surat": "Notulen Vidcon",
    "pengirim": "Kementerian Perumahan dan Kawasan Permukiman",
    "perihal": "Vidcon Kunjungan Kerja Menteri PKP Bersama TNI AL Terkait Kesiapan Lahan Rusun",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgBkVa6zns_oR4e_w0FHf7OvASEv201n0O4hK8wLTpaTcSI?e=udmBSz"
  },
  {
    "no": 14,
    "tanggal": "2026-05-11",
    "fase": "SK Penetapan",
    "judul": "SK Pengangkatan KPA/KPB dan Pejabat Perbendaharaan Lainnya pada Satker Kementerian PKP",
    "nomor_dokumen": "52/KPTS/Dp/2026, 21/KPTS/Dk/2026, 71/KPTS/Dd/2026",
    "keterangan": "Keputusan Dirjen Kawasan Permukiman No. 52/KPTS/Dp/2026, Dirjen Perumahan Perkotaan No. 21/KPTS/Dk/2026, dan Dirjen Perumahan Perdesaan No. 71/KPTS/Dd/2026 tanggal 11 Mei 2026 tentang SK PPK Rumah Susun dan Rumah Khusus deliniasi wilayah Pesisir (SP DIPA-146.03.1.691457/2026), Perkotaan (SP DIPA-146.05.1.691565/2026), dan Perdesaan (SP DIPA-146.04.1.691511/2026).",
    "bukti_dukung": "11-05-2026_Surat Keputusan Pengangkatan Kuasa Pengguna Anggaran Kuasa Pengguna Barang dan Pejabat Perbendaharaan Lainnya pada Satuan Kerja di Kementerian Perumahan dan Kawasan Permukiman",
    "keywords": "SK, Penetapan, Surat Keputusan, DIPA, KPA, PPK, Pejabat Perbendaharaan, Satker",
    "jenis_surat": "Surat Keputusan (SK)",
    "pengirim": "Menteri PKP / Dirjen Teknis",
    "perihal": "Pengangkatan KPA, KPB, PPK, dan Pejabat Perbendaharaan Satker Kementerian PKP",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgBKYyGZ6gvqTKd4bupz3FKaAUkdpTOQnXkgzYBo_C0emnM?e=0MAV0E"
  },
  {
    "no": 15,
    "tanggal": "2026-05-25",
    "fase": "Surat Masuk",
    "judul": "Permohonan Pembangunan Rumah Susun dari Asisten Logistik KSAL",
    "nomor_dokumen": "B/442-09/27/15/Set",
    "keterangan": "Surat Permohonan Pembangunan Rumah Susun dari A.n. Kepala Staf Angkatan Laut Asisten Logistik disertai lampiran surat pernyataan kesanggupan penerima pembangunan.",
    "bukti_dukung": "25-05-2026_Permohonan Pembangunan Rumah Susun",
    "keywords": "Surat, Permohonan, Usulan, TNI AL, KSAL, Aslog, Persyaratan, Surat Masuk",
    "jenis_surat": "Surat Permohonan Usulan",
    "pengirim": "A.n. KSAL - Asisten Logistik",
    "perihal": "Permohonan Bantuan Pembangunan Rumah Susun TNI AL Kab. Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgC_34cCc-qOT6wcu4764iiFASLZT5YGnShFHN9Utodk6Y0?e=ni6607"
  },
  {
    "no": 16,
    "tanggal": "2026-05-29",
    "fase": "Surat Masuk",
    "judul": "Surat Jawaban Bupati Pasuruan melalui Sekda Terkait Permohonan Dukungan Rusun di Grati Pasuruan",
    "nomor_dokumen": "000.7.2/204/013/2026",
    "keterangan": "Jawaban atas Permohonan Surat Pernyataan Dukungan Pembangunan Rumah Susun TNI AL di Grati Kabupaten Pasuruan. Pemda Kabupaten Pasuruan menyatakan tidak memiliki kewenangan mengeluarkan Surat Pernyataan Dukungan berdasarkan surat Koarmada TNI AL No. B/53-04/18/50 Kodaeral V tanggal 31 Desember 2025 perihal Larangan terhadap segala bentuk kegiatan, pembangunan ataupun penerbitan di lahan BMN Grati.",
    "bukti_dukung": "29-05-2026_Surat Jawaban Bupati Pasuruan melalui Sekretaris Daerah",
    "keywords": "Surat, Surat Jawaban, Bupati Pasuruan, Sekda, Persyaratan, Lahan Grati, Surat Masuk",
    "jenis_surat": "Surat Jawaban / Tanggapan",
    "pengirim": "Bupati Pasuruan d.h. Sekretaris Daerah",
    "perihal": "Tanggapan atas Permohonan Dukungan Pembangunan Rusun TNI AL di Grati Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgCzsJdQ1edvR5JSkWhxKmh9Ae3v9bbwpjHALDbcmXrNmqI?e=ONvuaH"
  },
  {
    "no": 17,
    "tanggal": "2026-05-29",
    "fase": "Surat Keluar",
    "judul": "ND Direktur Penyiapan Lahan PSU KP Permohonan Arahan Dispensasi Kontrak",
    "nomor_dokumen": "109/ND/Dp.03/2026",
    "keterangan": "Permohonan Arahan terkait Dispensasi Pelaksanaan Kontrak Kegiatan Pembangunan Rumah Susun Kejati Sulsel dan Rumah Susun TNI AL Pasuruan dengan mempertimbangkan penyelesaian administrasi.",
    "bukti_dukung": "29-05-2026_ND Direktur Penyiapan Lahan PSU KP Permohonan Arahan Dispensasi Kontrak",
    "keywords": "Nota Dinas, Surat, Dispensasi Kontrak, Arahan, DJKP, Kontrak, Surat Keluar",
    "jenis_surat": "Nota Dinas",
    "pengirim": "Direktur Penyiapan Lahan dan PSU Kawasan Permukiman",
    "perihal": "Permohonan Arahan Terkait Dispensasi Pelaksanaan Kontrak Kegiatan Pembangunan Rusun",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgCCSoMUzcGAR6ULlChucQnOAT4GtnTQWtwc8I5RMFdmJRs?e=i9a6bK"
  },
  {
    "no": 18,
    "tanggal": "2026-06-03",
    "fase": "Rapat",
    "judul": "Undangan Audiensi dan Koordinasi Pemenuhan RC Rusun TNI AL dengan Bupati Pasuruan",
    "nomor_dokumen": "UM01.02/DP.03/136/B/2026",
    "keterangan": "Audiensi dan Koordinasi dengan Bupati Pasuruan dalam rangka pemenuhan Readiness Criteria (RC) usulan Pembangunan Rumah Susun TNI AL Kab. Pasuruan oleh Direktur Penyiapan Lahan PSU.",
    "bukti_dukung": "3-06-2026_Undangan Audiensi Pemenuhan RC oleh Direktur Penyiapan Lahan PSU",
    "keywords": "Surat, Undangan, Rapat, Audiensi, Readiness Criteria, Bupati Pasuruan, Notulen",
    "jenis_surat": "Undangan Audiensi",
    "pengirim": "Direktur Penyiapan Lahan dan PSU",
    "perihal": "Audiensi Pemenuhan Readiness Criteria Usulan Rusun TNI AL dengan Bupati Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgBBKAEOzLqZR4vdiuQnLC0PAc_jeAFJPN9QaJoaPoDtNHk?e=AkD0Yg"
  },
  {
    "no": 19,
    "tanggal": "2026-06-03",
    "fase": "Surat Masuk",
    "judul": "Surat Konfirmasi Kodaeral TNI AL V Terkait Dukungan Bupati di Aset BMN Grati Pasuruan",
    "nomor_dokumen": "B/98-09/20/11/Kodaeral V",
    "keterangan": "Konfirmasi terkait larangan terhadap segala bentuk kegiatan/penerbitan surat di aset tanah BMN TNI AL Grati Pasuruan, memohon dapat diterbitkan Surat Pernyataan Dukungan dari Bupati untuk pembangunan Rumah Susun prajurit TNI AL sesuai format Permen PKP No. 10/2025.",
    "bukti_dukung": "3-06-2026_Surat Konfirmasi Kodaeral",
    "keywords": "Surat, Konfirmasi, Kodaeral V, BMN, Lahan Grati, Bupati Pasuruan, Persyaratan, Surat Masuk",
    "jenis_surat": "Surat Konfirmasi",
    "pengirim": "Komandan Kodaeral V Surabaya",
    "perihal": "Konfirmasi Terkait Dukungan Bupati di Aset Tanah BMN TNI AL Grati Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgBwtXmWeRZyT6rUAo3XHW1cAcEX_TJMRG7rYxLihiXm_tY?e=rPAvfl"
  },
  {
    "no": 20,
    "tanggal": "2026-06-08",
    "fase": "Persyaratan",
    "judul": "Hasil Verifikasi Administrasi Usulan Bantuan Rusun TNI AL Pasuruan (Lolos Vertek: 79.17%)",
    "nomor_dokumen": "BA-Verifikasi/2026-06-08",
    "keterangan": "Usulan bantuan pembangunan Rumah Susun TNI AL Kab. Pasuruan dinyatakan lolos ke tahap Verifikasi Teknis (Vertek) dengan perolehan skor 79.17%.",
    "bukti_dukung": "8-06-2026_Lolos vertek",
    "keywords": "Verifikasi, BA Verifikasi, Vertek, Skor, Persyaratan, Lolos Verifikasi, Berita Acara",
    "jenis_surat": "Berita Acara Verifikasi",
    "pengirim": "Tim Verifikasi Usulan Bantuan Rusun",
    "perihal": "Hasil Verifikasi Administrasi Usulan Bantuan Rusun TNI AL Pasuruan (Skor 79.17%)",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgBnDdvEZ6nPSbaYKRuSJa_AAcUVyQbNlY8C83cxt2K1fLs?e=qeDJO0"
  },
  {
    "no": 21,
    "tanggal": "2026-06-12",
    "fase": "Surat Masuk",
    "judul": "Surat Perintah Perencanaan Pembangunan Rusun TNI AL Pasuruan (Dirjen KP ke Kabalai BP3KP IV)",
    "nomor_dokumen": "RU.08.01/Dp/404/B/2026",
    "keterangan": "Surat Perintah Perencanaan Pembangunan Rumah Susun TNI AL Kab. Pasuruan dari Direktur Jenderal Kawasan Permukiman kepada Kepala BP3KP Jawa IV.",
    "bukti_dukung": "SPP Perencanaan Rusun TNI AL Kab Pasuruan Dirjen KP ke Kepala BP3KP Jawa IV.pdf",
    "keywords": "Surat, SPP, Perintah Perencanaan, Dirjen KP, Kabalai, DED, Surat Masuk",
    "jenis_surat": "Surat Perintah Perencanaan",
    "pengirim": "Direktur Jenderal Kawasan Permukiman",
    "perihal": "Perintah Perencanaan Pembangunan Rumah Susun TNI AL Kabupaten Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:b:/g/personal/satker_jatim_pkp_go_id/IQD7l1GGwihgRJKLlQALUJTqAZIO-NcAaLREKUwx_5xOB3w?e=GoAAFs"
  },
  {
    "no": 22,
    "tanggal": "2026-06-15",
    "fase": "Surat Keluar",
    "judul": "Surat Perintah Perencanaan Pembangunan Rusun TNI AL Pasuruan (Kabalai BP3KP IV ke Kasatker)",
    "nomor_dokumen": "CK0301-Bp9/938/B/2026",
    "keterangan": "Surat Perintah Perencanaan Pembangunan Rumah Susun TNI AL Kab. Pasuruan dari Kepala BP3KP Jawa IV kepada Kasatker PKP Jawa IV.",
    "bukti_dukung": "SPP Kabalai Perencanaan Pembangunan Rumah Susun TNI AL.pdf",
    "keywords": "Surat, SPP, Perintah Perencanaan, Kabalai, Kasatker, DED, Surat Keluar",
    "jenis_surat": "Surat Perintah Perencanaan",
    "pengirim": "Kepala BP3KP Jawa IV",
    "perihal": "Perintah Perencanaan Pembangunan Rumah Susun TNI AL Kab. Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:b:/g/personal/satker_jatim_pkp_go_id/IQDshyc6mde-Q6ScoulTpsbxARqRJojU5a8PnvBX6W82EQc?e=UyiB0E"
  },
  {
    "no": 23,
    "tanggal": "2026-06-15",
    "fase": "Surat Masuk",
    "judul": "Surat Permohonan Bantuan Pembangunan Rusun untuk TNI AL dari Menhan RI",
    "nomor_dokumen": "B/1605/KTH.02.00.0201.11/DJKUAT",
    "keterangan": "Surat Permohonan Bantuan Pembangunan Rumah Susun (Rusun) TNI AL oleh a.n. Menteri Pertahanan RI, Direktur Jenderal Kekuatan Pertahanan kepada Menteri Perumahan dan Kawasan Permukiman.",
    "bukti_dukung": "15-06-2026_Surat Permohonan Bantuan Pembangunan Rumah Susun (Rusun) untuk TNI AL",
    "keywords": "Surat, Permohonan, Usulan, Menhan, Dirjen Kuathan, Menteri PKP, Surat Masuk",
    "jenis_surat": "Surat Permohonan Usulan",
    "pengirim": "A.n. Menteri Pertahanan RI - Dirjen Kuathan",
    "perihal": "Permohonan Bantuan Pembangunan Rumah Susun TNI AL kepada Menteri PKP",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgDYB0_5k8wxRZTe_zumSkWpAW5dSEpnS9skDibwW0tjMr8?e=7dABk1"
  },
  {
    "no": 24,
    "tanggal": "2026-06-17",
    "fase": "Surat Keluar",
    "judul": "Surat Perintah Perencanaan Pembangunan Rusun TNI AL Pasuruan (Kasatker ke PPK Rusun Rusus)",
    "nomor_dokumen": "CK0301-Bp9.1/64/B/2026",
    "keterangan": "Surat Perintah Perencanaan Pembangunan Rumah Susun TNI AL Kab. Pasuruan dari Kasatker PKP Jawa IV kepada PPK Rusun Rusus.",
    "bukti_dukung": "SPP Kasatker ke PPK.pdf",
    "keywords": "Surat, SPP, Perintah Perencanaan, Kasatker, PPK, DED, Surat Keluar",
    "jenis_surat": "Surat Perintah Perencanaan",
    "pengirim": "Kasatker PKP Provinsi Jawa Timur",
    "perihal": "Perintah Perencanaan Pembangunan Rumah Susun TNI AL Kab. Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:b:/g/personal/satker_jatim_pkp_go_id/IQA48uMc3wq-TpA0BTmEVl-SAUaFkhONt_4G_CvVmykPmAw?e=3ZKisq"
  },
  {
    "no": 25,
    "tanggal": "2026-06-26",
    "fase": "DIPA",
    "judul": "ND Persetujuan Kontrak Tahun Jamak (MYC) Pembangunan Rumah Susun di Ditjen Kawasan Permukiman",
    "nomor_dokumen": "03/ND/M/2026",
    "keterangan": "Nota Dinas Menteri terkait persetujuan Kontrak Tahun Jamak (Multi Years Contract / KTJ) Pembangunan Rumah Susun di lingkungan Direktorat Jenderal Kawasan Permukiman.",
    "bukti_dukung": "ND Menteri Persetujuan KTJ DJKP.pdf",
    "keywords": "Nota Dinas, Surat, Persetujuan KTJ, MYC, Menteri PKP, Anggaran, Kontrak Tahun Jamak",
    "jenis_surat": "Nota Dinas Persetujuan KTJ",
    "pengirim": "Menteri Perumahan dan Kawasan Permukiman",
    "perihal": "Persetujuan Kontrak Tahun Jamak (MYC) Pembangunan Rusun Ditjen Kawasan Permukiman",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:b:/g/personal/satker_jatim_pkp_go_id/IQAH9jwgIiH8Qbq2IZBRwfVTASe8RjZ3OnuCOv3HEZmhiVc?e=pIOT2G"
  },
  {
    "no": 26,
    "tanggal": "2026-06-30",
    "fase": "Pengadaan",
    "judul": "Kontrak Penyelidikan Tanah (Sonbor) dan Reviu DED Rusun TNI AL Pasuruan",
    "nomor_dokumen": "SPK Reviu DED: 003/PK/Bp9.1.1/2026",
    "keterangan": "Surat Perintah Kerja (SPK) dan Dokumen Kontrak Penyelidikan Tanah (Sondir/Boring) serta Reviu Detail Engineering Design (DED) Rumah Susun TNI AL Pasuruan.",
    "bukti_dukung": "30-06-2026_Dokumen Kontrak Penyelidikan Tanah dan Reviu DED",
    "keywords": "Kontrak, SPK, Sonbor, DED, Dokumen Teknis, Penyelidikan Tanah, Pengadaan",
    "jenis_surat": "Kontrak / SPK",
    "pengirim": "PPK Rumah Susun dan Rumah Khusus",
    "perihal": "Kontrak Pekerjaan Penyelidikan Tanah (Sondir/Boring) dan Reviu DED Rusun TNI AL",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgD8AmuIgB--R6WGAO4PEFo1AUn2eUBSNWJZ9h8hsof_tbw?e=Cd74Pw"
  },
  {
    "no": 27,
    "tanggal": "2026-07-06",
    "fase": "Surat Masuk",
    "judul": "Surat Perintah Pelaksanaan Pembangunan Rusun TNI AL Pasuruan (Direktur PSU ke Kabalai)",
    "nomor_dokumen": "RU.07.01/Dp.03/176.B.2026",
    "keterangan": "Surat Perintah Pelaksanaan Pembangunan Rumah Susun TNI AL Kabupaten Pasuruan dari Direktur Penyiapan Lahan dan Prasarana, Sarana, dan Utilitas Umum Kawasan Permukiman kepada Kepala BP3KP Jawa IV.",
    "bukti_dukung": "6-07-2026_Surat Perintah Pelaksanaan Pembangunan Rumah Susun TNI AL Kabupaten Pasuruan",
    "keywords": "Surat, Perintah Pelaksanaan, SPP Fisik, DJKP, Pelaksanaan, Surat Masuk",
    "jenis_surat": "Surat Perintah Pelaksanaan",
    "pengirim": "Direktur Penyiapan Lahan dan PSU Kawasan Permukiman",
    "perihal": "Perintah Pelaksanaan Pembangunan Rumah Susun TNI AL Kabupaten Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgCxKQT0amOKQbGGEd1Z46axAa2Hfm2AsVanKoUScOfGEvs?e=V8de3b"
  },
  {
    "no": 28,
    "tanggal": "2026-07-15",
    "fase": "Surat Keluar",
    "judul": "Surat Permohonan Keterangan Status Tanah Lahan Rusun TNI AL ke Kantah ATR/BPN Pasuruan",
    "nomor_dokumen": "RU0801-Bp9/1359/B/2026",
    "keterangan": "Surat Permohonan Keterangan Status Tanah Lahan Rusun TNI AL Kabupaten Pasuruan oleh Kepala Balai Pelaksana Penyediaan Perumahan dan Kawasan Permukiman Jawa IV kepada Kepala Kantor Pertanahan Kabupaten Pasuruan (ATR/BPN).",
    "bukti_dukung": "15-06-2026_Surat Permohonan Keterangan Status Tanah Lahan Rusun TNI AL Kabupaten Pasuruan",
    "keywords": "Surat, Permohonan, BPN, Status Tanah, Lahan, ATR/BPN, Persyaratan, Surat Keluar",
    "jenis_surat": "Surat Permohonan Keterangan",
    "pengirim": "Kepala BP3KP Jawa IV",
    "perihal": "Permohonan Keterangan Status Tanah Lahan Rusun TNI AL Kabupaten Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgAYMxRwR6MTQ5TJ9pYcrfFpAb9QJDWQPrfo_SBG-aBa4o8?e=PrWwkn"
  },
  {
    "no": 29,
    "tanggal": "2026-07-16",
    "fase": "Surat Keluar",
    "judul": "Surat Permohonan Keterangan Aman dari Rawan Bencana ke BPBD Kab. Pasuruan",
    "nomor_dokumen": "RU0801-Bp9/1366/B/2026",
    "keterangan": "Surat Permohonan Keterangan Aman dari Rawan Bencana pada Lokasi Rusun TNI AL Kabupaten Pasuruan oleh Kepala Balai Pelaksana Penyediaan Perumahan dan Kawasan Permukiman Jawa IV kepada Kepala BPBD Kabupaten Pasuruan.",
    "bukti_dukung": "16-07-2026_Surat Permohonan Keterangan Aman dari Rawan Bencana pada Lokasi Rusun TNI AL Kabupaten Pasuruan",
    "keywords": "Surat, Permohonan, BPBD, Rawan Bencana, Kesiapan Lahan, Persyaratan, Surat Keluar",
    "jenis_surat": "Surat Permohonan Keterangan",
    "pengirim": "Kepala BP3KP Jawa IV",
    "perihal": "Permohonan Keterangan Aman dari Rawan Bencana Lokasi Rusun TNI AL Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgCDgTQV5k8TSbRV2tFAEwBSARd_v-3lxm1C9mv84GJQAyk?e=Et6RyM"
  },
  {
    "no": 30,
    "tanggal": "2026-07-16",
    "fase": "Surat Keluar",
    "judul": "Surat Permohonan Keterangan Peil Banjir Lokasi Rusun TNI AL ke Dinas SDA Pasuruan",
    "nomor_dokumen": "RU0801-Bp9/1367/B/2026",
    "keterangan": "Surat Permohonan Keterangan Peil Banjir pada Lokasi Rusun TNI AL Kabupaten Pasuruan oleh Kepala Balai Pelaksana Penyediaan Perumahan dan Kawasan Permukiman Jawa IV kepada Kepala Dinas Sumber Daya Air, Bina Marga dan Bina Konstruksi Kabupaten Pasuruan.",
    "bukti_dukung": "16-07-2026_Surat Permohonan Keterangan Peil Banjir pada Lokasi Rusun TNI AL Kabupaten Pasuruan",
    "keywords": "Surat, Permohonan, Peil Banjir, Dinas SDA, Drainase, Persyaratan, Surat Keluar",
    "jenis_surat": "Surat Permohonan Keterangan",
    "pengirim": "Kepala BP3KP Jawa IV",
    "perihal": "Permohonan Keterangan Peil Banjir pada Lokasi Rusun TNI AL Kabupaten Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgDbrwpFcyNpToZ4mrb08AlNAdz6a30RJiI3koJrN13j5hk?e=F8nDmv"
  },
  {
    "no": 31,
    "tanggal": "2026-07-17",
    "fase": "Surat Masuk",
    "judul": "Surat Jawaban Keterangan Status Tanah Lahan Rusun TNI AL dari Kantor Pertanahan Pasuruan",
    "nomor_dokumen": "HP.02.03/1624/35/14/VII/2026",
    "keterangan": "Surat Jawaban Permohonan Keterangan Status Tanah Lahan Rusun TNI AL Kabupaten Pasuruan oleh Kepala Kantor Pertanahan Kabupaten Pasuruan kepada Kepala Balai Pelaksana Penyediaan Perumahan dan Kawasan Permukiman Jawa IV.",
    "bukti_dukung": "17-07-2026_Surat Jawaban Permohonan Keterangan Status Tanah Lahan Rusun TNI AL",
    "keywords": "Surat, Surat Jawaban, BPN, Status Tanah, ATR/BPN, Persyaratan, Lahan, Surat Masuk",
    "jenis_surat": "Surat Jawaban Keterangan",
    "pengirim": "Kepala Kantor Pertanahan Kabupaten Pasuruan",
    "perihal": "Surat Jawaban Keterangan Status Tanah Lahan Pembangunan Rusun TNI AL",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgAmvfBgSnrVQ4maFLu411SgAU1kfBBp4OMx_k4p3erorl8?e=6DOq6l"
  },
  {
    "no": 32,
    "tanggal": "2026-07-17",
    "fase": "Surat Keluar",
    "judul": "ND Surat Tanggapan SPP Fisik Rusun TNI AL Pasuruan (Kabalai ke Direktur Lapsu)",
    "nomor_dokumen": "103/ND/Bp9/2026",
    "keterangan": "Nota dinas Kepala Balai Pelaksana Penyediaan Perumahan dan Kawasan Permukiman Jawa IV kepada Direktur Penyiapan Lahan dan PSU Kawasan Permukiman terkait penyampaian progres penyiapan konstruksi Rumah Susun TNI AL Kabupaten Pasuruan.",
    "bukti_dukung": "1707.103 ND Surat Tanggapan SPP fisik Rusun TNI AL.pdf",
    "keywords": "Nota Dinas, Surat, Tanggapan SPP, Progres Konstruksi, Kabalai, Lapsu, Surat Keluar",
    "jenis_surat": "Nota Dinas Tanggapan",
    "pengirim": "Kepala BP3KP Jawa IV",
    "perihal": "Tanggapan SPP Fisik dan Penyampaian Progres Penyiapan Konstruksi Rusun TNI AL",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:b:/g/personal/satker_jatim_pkp_go_id/IQBrCObcC0FDS7CwkCQKiiK4ARzbamouZ_MoTOGFEaFTUSY?e=SWzKQ9"
  },
  {
    "no": 33,
    "tanggal": "2026-07-27",
    "fase": "Rapat",
    "judul": "ND Laporan Hasil Rapat Koordinasi Progres Penyiapan Konstruksi Rusun TNI AL Pasuruan",
    "nomor_dokumen": "206/ND/DP.03/2026",
    "keterangan": "Nota dinas Direktur Penyiapan Lahan dan PSU Kawasan Permukiman kepada Dirjen Kawasan Permukiman terkait Laporan Rapat Koordinasi Progres Penyiapan Konstruksi Rusun TNI AL Pasuruan.",
    "bukti_dukung": "206 ND Laporan Hasil Koordinasi Progres Penyiapan Konstruksi Rusun TNI AL Pasuruan",
    "keywords": "Nota Dinas, Rapat, Notulen, Laporan Koordinasi, Konstruksi, Dirjen KP",
    "jenis_surat": "Nota Dinas Laporan Rapat",
    "pengirim": "Direktur Penyiapan Lahan dan PSU",
    "perihal": "Laporan Hasil Rapat Koordinasi Progres Penyiapan Konstruksi Rusun TNI AL Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:b:/g/personal/satker_jatim_pkp_go_id/IQDx-NwfKbdlRL8VmjMPBKHMASkEIcb-3Q9RX1gMtN1H50Q?e=kX8b2P"
  },
  {
    "no": 34,
    "tanggal": "2026-08-11",
    "fase": "Rapat",
    "judul": "ND Laporan Hasil Rapat Konsultasi Pembangunan Rumah Susun TNI AL Kabupaten Pasuruan",
    "nomor_dokumen": "224/ND/DP.03/2026",
    "keterangan": "Nota dinas Direktur Penyiapan Lahan dan PSU Kawasan Permukiman kepada Dirjen Kawasan Permukiman mengenai Laporan Hasil Rapat Konsultasi Pembangunan Rumah Susun TNI AL Kabupaten Pasuruan.",
    "bukti_dukung": "224 ND Laporan Hasil Rapat Konsultasi Pembangunan Rumah Sususn TNI AL Kabupaten Pasuruan.pdf",
    "keywords": "Nota Dinas, Rapat, Notulen, Konsultasi, Dirjen KP, Konstruksi",
    "jenis_surat": "Nota Dinas Laporan Rapat",
    "pengirim": "Direktur Penyiapan Lahan dan PSU",
    "perihal": "Laporan Hasil Rapat Konsultasi Pembangunan Rusun TNI AL Kab. Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:b:/g/personal/satker_jatim_pkp_go_id/IQADiEXDS4HuTbAda03DI8wyAScfP9Yq85mY2wisXM8aT3M?e=Kjg3Uh"
  },
  {
    "no": 35,
    "tanggal": "2026-08-13",
    "fase": "Rapat",
    "judul": "ND Laporan Hasil Rapat Pembahasan Rencana Rusun TNI AL bersama Ditjen Kuathan Kemhan",
    "nomor_dokumen": "228/ND/DP.03/2026",
    "keterangan": "Nota dinas Direktur Penyiapan Lahan dan PSU Kawasan Permukiman kepada Dirjen Kawasan Permukiman perihal Laporan Hasil Rapat Pembahasan Rencana Pembangunan Rumah Susun TNI AL di Kab. Pasuruan bersama Direktorat Jenderal Kekuatan Pertahanan Kemhan.",
    "bukti_dukung": "228 ND Laporan Hasil Rapat Pembahasan Rencana Pembangunan Rumah Susun TNI AL di Kabupaten Pasuruan Bersama Direktorat Jenderal Kekuatan Pertahan Kementerian Pertahanan.pdf",
    "keywords": "Nota Dinas, Rapat, Notulen, Kemhan, Kuathan, Pembahasan, TNI AL, Dirjen KP",
    "jenis_surat": "Nota Dinas Laporan Rapat",
    "pengirim": "Direktur Penyiapan Lahan dan PSU",
    "perihal": "Laporan Pembahasan Rencana Pembangunan Rusun TNI AL Pasuruan bersama Kemhan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:b:/g/personal/satker_jatim_pkp_go_id/IQDfPOKfaHmIQKXF1K5sx2GIAeRpWmGsxk9WMriThdrhIN4?e=mAG66p"
  },
  {
    "no": 36,
    "tanggal": "2026-08-20",
    "fase": "Surat Masuk",
    "judul": "Surat Keterangan Rawan Bencana Desa Gejugjati Kecamatan Lekok dari BPBD Pasuruan",
    "nomor_dokumen": "00.1.2.3/207.1/424.201/2026",
    "keterangan": "Surat Badan Penanggulangan Bencana Daerah Pemerintah Kabupaten Pasuruan kepada Kepala BP3KP Jawa IV menerangkan bahwa lokasi rencana rusun di Desa Gejugjati aman dari daerah rawan bencana.",
    "bukti_dukung": "20-08-2026_Surat Keterangan Rawan Bencana Desa Gejugjati Kecamatan Lekok",
    "keywords": "Surat, Surat Keterangan, BPBD, Rawan Bencana, Gejugjati Lekok, Persyaratan, Surat Masuk",
    "jenis_surat": "Surat Keterangan Bencana",
    "pengirim": "BPBD Kabupaten Pasuruan",
    "perihal": "Keterangan Rawan Bencana Desa Gejugjati Kecamatan Lekok Lokasi Rusun TNI AL",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgA-NsyrhARrRLDKN5VlS4B4ARbLNNLQIxgT2520Ly9u_M8?e=wgXLaL"
  },
  {
    "no": 37,
    "tanggal": "2026-09-01",
    "fase": "Persyaratan",
    "judul": "Surat Pernyataan Kesanggupan Pengelolaan dan Pemantauan Lingkungan Hidup (SPPL) Rusun TNI AL",
    "nomor_dokumen": "6a9637cac6aff",
    "keterangan": "Surat Pernyataan Pemerintah TNI Angkatan Laut Kodaeral V terkait Kesanggupan Pengelolaan dan Pemantauan Lingkungan Hidup (SPPL) untuk pembangunan Rumah Susun TNI AL.",
    "bukti_dukung": "01-09-2026_SURAT PERNYATAANKESANGGUPAN PENGELOLAAN DANPEMANTAUANLINGKUNGANHIDUP (SPPL) RumahSusun TNI AL",
    "keywords": "Surat, SPPL, Lingkungan Hidup, Kodaeral V, Pernyataan, Persyaratan, Dokumen Lingkungan",
    "jenis_surat": "Surat Pernyataan SPPL",
    "pengirim": "Pemerintah TNI AL - Kodaeral V",
    "perihal": "Pernyataan Kesanggupan Pengelolaan dan Pemantauan Lingkungan Hidup (SPPL)",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgCTGwPvTOtTSbEdIx8--OsAAYYmJyKNQqOGKH70r7j60_w?e=JaGtDO"
  },
  {
    "no": 38,
    "tanggal": "2026-09-01",
    "fase": "Surat Keluar",
    "judul": "Surat Perintah Pelaksanaan Pembangunan Rumah Susun TNI AL Kab. Pasuruan (Kabalai BP3KP IV)",
    "nomor_dokumen": "RU0801/Bp9/2322/B/2026",
    "keterangan": "Surat Perintah Kepala Balai Pelaksana Penyediaan Perumahan dan Kawasan Permukiman Jawa IV perihal pelaksanaan pembangunan Rumah Susun TNI AL Kabupaten Pasuruan.",
    "bukti_dukung": "01-09-2026_Surat Perintah Pelaksanaan Pembangunan Rumah Susun TNI AL Kabupaten Pasuruan",
    "keywords": "Surat, Perintah Pelaksanaan, SPP Fisik, Kabalai BP3KP, Pelaksanaan, Surat Keluar",
    "jenis_surat": "Surat Perintah Pelaksanaan",
    "pengirim": "Kepala BP3KP Jawa IV",
    "perihal": "Perintah Pelaksanaan Pembangunan Rumah Susun TNI AL Kabupaten Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgBhOdgBZDEVRrYGhdUceOcYAc6DLeMUf1ggsINANpYDGt8?e=lsmYky"
  },
  {
    "no": 39,
    "tanggal": "2026-09-03",
    "fase": "Surat Masuk",
    "judul": "Surat Informasi Peil Banjir Lokasi Rusun dari Dinas SDA Bina Marga Kab. Pasuruan",
    "nomor_dokumen": "500.5.7.15/366/103/2026",
    "keterangan": "Surat Informasi Peil Banjir dari Kepala Dinas Sumber Daya Air, Bina Marga dan Bina Konstruksi Kabupaten Pasuruan untuk lokasi pembangunan Rusun TNI AL.",
    "bukti_dukung": "03-09-2026_Surat Informasi Peil Banjir",
    "keywords": "Surat, Peil Banjir, Dinas SDA, Drainase, Banjir, Persyaratan, Surat Masuk",
    "jenis_surat": "Surat Keterangan Peil Banjir",
    "pengirim": "Dinas SDA, Bina Marga dan Bina Konstruksi Kab. Pasuruan",
    "perihal": "Informasi Peil Banjir Lokasi Pembangunan Rusun TNI AL Kabupaten Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgB_O0uXK-IOQ6Goi8dAbN1eAd2eeXd6C8DO52uPQ6noasY?e=UkKhtc"
  },
  {
    "no": 40,
    "tanggal": "2026-09-07",
    "fase": "Surat Masuk",
    "judul": "Surat Pernyataan Komitmen Penyelesaian Persyaratan Konstruksi Pembangunan Rusun di Grati",
    "nomor_dokumen": "Sper/6961/X/2026",
    "keterangan": "Surat Pernyataan Komitmen dari Komandan Komando Daerah TNI AL V terkait penyelesaian persyaratan konstruksi Pembangunan Rumah Susun di Grati Kabupaten Pasuruan.",
    "bukti_dukung": "07-09-2026_Surat Pernyataan Komitmen Penyelesaian Persyaratan Konstruksi Pembangunan Rusun di Grati Kabupaten Pasuruan",
    "keywords": "Surat, Komitmen, Kodaeral V, Persyaratan, Konstruksi, Grati Pasuruan, Surat Masuk",
    "jenis_surat": "Surat Pernyataan Komitmen",
    "pengirim": "Komandan Komando Daerah TNI AL V",
    "perihal": "Pernyataan Komitmen Penyelesaian Persyaratan Konstruksi Rusun di Grati Pasuruan",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgDaY4S-AUVtR5UIpnLdfo00AcUqQNmXH5TlRkb91ouEHFo?e=4TlZfG"
  },
  {
    "no": 41,
    "tanggal": "2026-09-07",
    "fase": "Surat Masuk",
    "judul": "Surat Pernyataan Kegiatan Masih Dalam Tahap Rencana dari Komandan Kodaeral V",
    "nomor_dokumen": "Sper/6951/X/2026",
    "keterangan": "Surat Pernyataan Komitmen dari Komandan Komando Daerah TNI AL V bahwa kegiatan pembangunan rusun masih dalam tahap rencana.",
    "bukti_dukung": "07-09-2026_Surat Pernyataan Komitmen Penyelesaian Persyaratan Konstruksi Pembangunan Rusun di Grati Kabupaten Pasuruan",
    "keywords": "Surat, Pernyataan, Kodaeral V, Tahap Rencana, Komitmen, Persyaratan, Surat Masuk",
    "jenis_surat": "Surat Pernyataan",
    "pengirim": "Komandan Komando Daerah TNI AL V",
    "perihal": "Pernyataan Kegiatan Pembangunan Rumah Susun Masih Dalam Tahap Rencana",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgDaY4S-AUVtR5UIpnLdfo00AcUqQNmXH5TlRkb91ouEHFo?e=0aVlXs"
  },
  {
    "no": 42,
    "tanggal": "2026-09-08",
    "fase": "Surat Keluar",
    "judul": "Nota Dinas Penyampaian Surat Perintah Pelaksanaan Pembangunan Rusun TNI AL Kab. Pasuruan",
    "nomor_dokumen": "119/ND/Bp9.1/2026",
    "keterangan": "Nota Dinas Kepala Satuan Kerja Perumahan dan Kawasan Permukiman Provinsi Jawa Timur meneruskan Surat Kepala BP3KP Jawa IV terkait Perintah Pelaksanaan Pembangunan Rumah Susun TNI AL Kab. Pasuruan.",
    "bukti_dukung": "08-09-2026_Nota Dinas Penyampaian Surat Kepala BP3KP Jawa IV terkait Perintah Pelaksanaan Pembangunan Rumah Susun TNI AL Kab Pasuruan",
    "keywords": "Nota Dinas, Surat, Penyampaian SPP, Kasatker, Pelaksanaan, Surat Keluar",
    "jenis_surat": "Nota Dinas",
    "pengirim": "Kepala Satker PKP Jawa Timur",
    "perihal": "Penyampaian Surat Kepala BP3KP Jawa IV terkait Perintah Pelaksanaan Rusun TNI AL",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgAuy9xsqVbWRKnECmwB4IeDAQQtPpIfrICZWpofUJzKgUg?e=ZAHM5v"
  },
  {
    "no": 43,
    "tanggal": "2026-09-11",
    "fase": "Pengadaan",
    "judul": "Penyampaian BA Pendampingan Persiapan E-Purchasing Pembangunan Rusun TNI AL Pasuruan",
    "nomor_dokumen": "123.1/ND/Bp9.1/2026",
    "keterangan": "Nota Dinas Ketua Tim Pelaksana E-Purchasing Pembangunan Rumah Susun TNI AL Kabupaten Pasuruan Melalui Katalog Elektronik perihal penyampaian Berita Acara Hasil Pemeriksaan oleh Tim Teknis.",
    "bukti_dukung": "Nota Dinas_Penyampaian BA Hasil Pemeriksaan oleh Tim Teknis-scanned.pdf",
    "keywords": "Berita Acara, Notulen, Nota Dinas, E-Purchasing, E-Katalog, Tim Teknis, Pengadaan",
    "jenis_surat": "Berita Acara E-Purchasing",
    "pengirim": "Ketua Tim Pelaksana E-Purchasing BP3KP IV",
    "perihal": "Penyampaian BA Hasil Pemeriksaan oleh Tim Teknis Persiapan E-Purchasing Katalog",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:b:/g/personal/satker_jatim_pkp_go_id/IQCRRpubyJuTS64sgDOlUex8Aenfqp_SymB0iA6Ctd_Gs_o?e=cXDspZ"
  },
  {
    "no": 44,
    "tanggal": "2026-09-16",
    "fase": "SK Penetapan",
    "judul": "SK Penetapan dan Penugasan Pokja Pemilihan Jatim II UKPBJ-PKP 2026 Kementerian PKP",
    "nomor_dokumen": "106/KPTS/Sj.04/2026",
    "keterangan": "SK Kepala Unit Kerja Pengadaan Barang/Jasa tentang Penetapan dan Penugasan Kelompok Kerja Pemilihan Jatim II UKPBJ-PKP 2026 Kementerian PKP TA. 2026.",
    "bukti_dukung": "16-09-2026_SK Kepala Unit Kerja Pengadaan Barang atau Jasa tentang Penetapan dan Penugasan Kelompok Kerja Pemilihan Jatim II UKPBJ-PKP 2026 Kementerian PKP TA. 2026",
    "keywords": "SK, Surat Keputusan, Pokja, Penetapan, UKPBJ, Pengadaan, Lelang, Tender",
    "jenis_surat": "SK Penetapan Pokja",
    "pengirim": "Kepala UKPBJ Kementerian PKP",
    "perihal": "Penetapan dan Penugasan Kelompok Kerja Pemilihan Jatim II UKPBJ-PKP TA. 2026",
    "link_dokumen": "https://kemenpkp-my.sharepoint.com/:f:/g/personal/satker_jatim_pkp_go_id/IgBi7MDJZKTUT6-yK_UMIyxNAe-j9BrlOoeIhXclK0gz6I8?e=R4D9R2"
  }
];

// State Pencarian & Filter
let currentTimelineSortOrder = 'asc'; // 'asc' (1 -> 44) or 'desc' (44 -> 1)
let currentCategoryFilter = 'all';
let currentKeywordFilter = null;
let currentTimelineSearch = '';
let currentSuratSearch = '';

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

// Authentication Handlers for Proyek
async function handleProyekLogin(e) {
    if (e) e.preventDefault();
    const usernameInput = document.getElementById('proyekLoginUsername')?.value.trim();
    const passwordInput = document.getElementById('proyekLoginPassword')?.value;
    const errBox = document.getElementById('proyekLoginError');

    if (!usernameInput || !passwordInput) {
        if (errBox) {
            errBox.textContent = 'Harap isi username dan password.';
            errBox.style.display = 'block';
        }
        return;
    }

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
            // If offline / static fallback for admin / admin12345
            if (usernameInput === 'admin' && passwordInput === 'admin12345') {
                localStorage.setItem('token', 'local-admin-token');
                localStorage.setItem('user', JSON.stringify({
                    username: 'admin',
                    role: 'admin',
                    nama_lengkap: 'Administrator Rusun'
                }));
                if (errBox) errBox.style.display = 'none';
                checkProyekAuthState();
                return;
            }
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Login gagal. Periksa username dan password.');
        }

        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify({
            username: data.username,
            role: data.role,
            nama_lengkap: data.nama_lengkap
        }));

        if (errBox) errBox.style.display = 'none';
        checkProyekAuthState();
    } catch (err) {
        if (usernameInput === 'admin' && passwordInput === 'admin12345') {
            localStorage.setItem('token', 'local-admin-token');
            localStorage.setItem('user', JSON.stringify({
                username: 'admin',
                role: 'admin',
                nama_lengkap: 'Administrator Rusun'
            }));
            if (errBox) errBox.style.display = 'none';
            checkProyekAuthState();
            return;
        }

        if (errBox) {
            errBox.textContent = err.message || 'Gagal login.';
            errBox.style.display = 'block';
        }
    }
}

function handleProyekLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    checkProyekAuthState();
}

function checkProyekAuthState() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    const loginSec = document.getElementById('proyekLoginSection');
    const mainSec = document.getElementById('proyekMainContent');
    const userBadge = document.getElementById('userBadgeProyek');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const btnKegiatan = document.getElementById('btnProyekKegiatan');
    const btnSurat = document.getElementById('btnProyekSurat');
    const btnLogout = document.getElementById('btnProyekLogout');

    if (token) {
        let user = { username: 'admin' };
        try {
            if (userStr) user = JSON.parse(userStr);
        } catch (e) {}

        if (loginSec) loginSec.style.display = 'none';
        if (mainSec) mainSec.style.display = 'block';
        if (userBadge) userBadge.style.display = 'inline-flex';
        if (userNameDisplay) userNameDisplay.textContent = user.nama_lengkap || user.username || 'admin';
        if (btnKegiatan) btnKegiatan.style.display = 'inline-flex';
        if (btnSurat) btnSurat.style.display = 'inline-flex';
        if (btnLogout) btnLogout.style.display = 'inline-flex';

        initProyekDetailPage();
    } else {
        if (loginSec) loginSec.style.display = 'block';
        if (mainSec) mainSec.style.display = 'none';
        if (userBadge) userBadge.style.display = 'none';
        if (btnKegiatan) btnKegiatan.style.display = 'none';
        if (btnSurat) btnSurat.style.display = 'none';
        if (btnLogout) btnLogout.style.display = 'none';
    }
}

// Load Proyek Details from URL /proyek/:tahun/:slug
async function initProyekDetailPage() {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    let tahun = 2026;
    let slug = 'tnialpasuruan';

    if (pathParts.length >= 3 && pathParts[0] === 'proyek') {
        tahun = parseInt(pathParts[1]);
        slug = pathParts[2];
    }

    try {
        const res = await fetch(`${API_BASE}/proyek/${tahun}/${slug}`);
        if (!res.ok) throw new Error('Data proyek belum tersedia di backend');
        currentProyekData = await res.json();
        
        // If timelines is empty in database, fallback to DEFAULT_TNI_AL_DATA
        if (!currentProyekData.timelines || currentProyekData.timelines.length === 0) {
            currentProyekData.timelines = DEFAULT_TNI_AL_DATA;
        }
        if (!currentProyekData.surat_list || currentProyekData.surat_list.length === 0) {
            currentProyekData.surat_list = DEFAULT_TNI_AL_DATA.map(d => ({
                no_surat: d.nomor_dokumen || `DOK-${String(d.no).padStart(2, '0')}/${d.tanggal}`,
                tgl_surat: d.tanggal,
                jenis_surat: d.jenis_surat || d.fase,
                pengirim: d.pengirim || 'Kementerian PKP / TNI AL',
                perihal: d.perihal || d.judul,
                keywords: d.keywords,
                file_path: d.link_dokumen || d.bukti_dukung
            }));
        }

        renderProyekDetail(currentProyekData);
    } catch (err) {
        console.warn('Load detail proyek API fallback to local dataset:', err.message);
        currentProyekData = {
            id: 'local-tnial-pasuruan-2026',
            nama_proyek: 'Pembangunan Rumah Susun TNI AL Pasuruan',
            tahun: 2026,
            status_fase: 'Tahap: Penyiapan E-Purchasing / Pokja UKPBJ',
            lokasi_detail: 'Desa Gejugjati, Kecamatan Lekok, Kabupaten Pasuruan',
            deskripsi: 'Pembangunan Rumah Susun untuk Prajurit TNI AL Pasuruan berlokasi di Desa Gejugjati, Kecamatan Lekok, Kabupaten Pasuruan. Saat ini dalam proses pembentukan Kelompok Kerja Pemilihan Jatim II UKPBJ-PKP 2026 dan persiapan E-Purchasing katalog elektronik.',
            timelines: DEFAULT_TNI_AL_DATA,
            surat_list: DEFAULT_TNI_AL_DATA.map(d => ({
                no_surat: d.nomor_dokumen || `DOK-${String(d.no).padStart(2, '0')}/${d.tanggal}`,
                tgl_surat: d.tanggal,
                jenis_surat: d.jenis_surat || d.fase,
                pengirim: d.pengirim || 'Kementerian PKP / TNI AL',
                perihal: d.perihal || d.judul,
                keywords: d.keywords,
                file_path: d.link_dokumen || d.bukti_dukung
            }))
        };
        renderProyekDetail(currentProyekData);
    }
}

function renderProyekDetail(p) {
    const elHeaderNama = document.getElementById('proyekNamaHeader');
    if (elHeaderNama) elHeaderNama.textContent = p.nama_proyek;

    const elNama = document.getElementById('proyekNama');
    const elDeskripsi = document.getElementById('proyekDeskripsi');
    if (elNama) elNama.textContent = p.nama_proyek;
    if (elDeskripsi) elDeskripsi.textContent = p.deskripsi || 'Pembangunan Rumah Susun untuk Prajurit TNI AL Pasuruan berlokasi di Desa Gejugjati, Kecamatan Lekok, Kabupaten Pasuruan.';

    const bTahun = document.getElementById('badgeTahun');
    const bFase = document.getElementById('badgeFase');
    if (bTahun) bTahun.textContent = `TA ${p.tahun}`;
    if (bFase) bFase.textContent = p.status_fase || 'Tahap: Penyiapan E-Purchasing / Pokja UKPBJ';

    const elLokasi = document.getElementById('infoLokasi');
    if (elLokasi) elLokasi.innerHTML = `📍 ${p.lokasi_detail || 'Desa Gejugjati, Kecamatan Lekok, Kabupaten Pasuruan'}`;

    // Pastikan timelines memiliki nomor urut, link_dokumen, dan keywords
    allTimelines = (p.timelines || []).map((t, i) => {
        return {
            no: t.no || (i + 1),
            tanggal: t.tanggal,
            fase: t.fase || 'Kegiatan',
            judul: t.judul,
            nomor_dokumen: t.nomor_dokumen || null,
            catatan: t.catatan || t.keterangan || '',
            bukti_dukung: t.bukti_dukung || t.lampiran_url || '',
            link_dokumen: t.link_dokumen || t.lampiran_url || null,
            keywords: t.keywords || ''
        };
    });

    allSuratList = (p.surat_list || []).map((s, idx) => ({
        no: s.no || (idx + 1),
        no_surat: s.no_surat,
        tgl_surat: s.tgl_surat,
        jenis_surat: s.jenis_surat,
        pengirim: s.pengirim,
        perihal: s.perihal,
        keywords: s.keywords,
        file_path: s.file_path || s.link_dokumen || null
    }));

    applyTimelineFilterAndRender();
    renderSuratList(allSuratList);
}

// Format Tanggal Indonesia
function formatIndoDate(dateStr) {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const d = parseInt(parts[2], 10);
    const m = months[parseInt(parts[1], 10) - 1] || parts[1];
    const y = parts[0];
    return `${d} ${m} ${y}`;
}

// Filter & Sort Logic for Timelines
function applyTimelineFilterAndRender() {
    let filtered = [...allTimelines];

    // 1. Filter Kategori Tab
    if (currentCategoryFilter !== 'all') {
        const catLower = currentCategoryFilter.toLowerCase();
        filtered = filtered.filter(item => {
            const f = (item.fase || '').toLowerCase();
            const j = (item.judul || '').toLowerCase();
            const kw = (item.keywords || '').toLowerCase();
            return f.includes(catLower) || j.includes(catLower) || kw.includes(catLower);
        });
    }

    // 2. Filter Spesifik Keyword (jika user klik chip keyword)
    if (currentKeywordFilter) {
        const kwLower = currentKeywordFilter.toLowerCase();
        filtered = filtered.filter(item => {
            const kw = (item.keywords || '').toLowerCase();
            const j = (item.judul || '').toLowerCase();
            const c = (item.catatan || '').toLowerCase();
            return kw.includes(kwLower) || j.includes(kwLower) || c.includes(kwLower);
        });
    }

    // 3. Filter Search Box
    if (currentTimelineSearch.trim() !== '') {
        const q = currentTimelineSearch.trim().toLowerCase();
        filtered = filtered.filter(item => {
            const j = (item.judul || '').toLowerCase();
            const c = (item.catatan || '').toLowerCase();
            const no = (item.nomor_dokumen || '').toLowerCase();
            const kw = (item.keywords || '').toLowerCase();
            const b = (item.bukti_dukung || '').toLowerCase();
            const t = (item.tanggal || '').toLowerCase();
            return j.includes(q) || c.includes(q) || no.includes(q) || kw.includes(q) || b.includes(q) || t.includes(q);
        });
    }

    // 4. Sorting Berdasarkan Waktu
    if (currentTimelineSortOrder === 'asc') {
        // Urutan Tertua Dulu (#1 -> #44)
        filtered.sort((a, b) => {
            if (a.tanggal === b.tanggal) return (a.no || 0) - (b.no || 0);
            return new Date(a.tanggal) - new Date(b.tanggal);
        });
    } else {
        // Urutan Terbaru Dulu (#44 -> #1)
        filtered.sort((a, b) => {
            if (a.tanggal === b.tanggal) return (b.no || 0) - (a.no || 0);
            return new Date(b.tanggal) - new Date(a.tanggal);
        });
    }

    renderTimelineList(filtered);
}

// Render Timeline Feed Cards
function renderTimelineList(timelines) {
    const timelineContainer = document.getElementById('timelineList');
    const elTimeCount = document.getElementById('timelineCount');
    
    if (elTimeCount) {
        if (timelines.length === allTimelines.length) {
            elTimeCount.textContent = `${allTimelines.length} Kegiatan`;
        } else {
            elTimeCount.textContent = `${timelines.length} dari ${allTimelines.length} Kegiatan`;
        }
    }

    if (!timelineContainer) return;

    if (timelines.length === 0) {
        timelineContainer.innerHTML = `
            <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); background: var(--bg-muted); border-radius: var(--radius-sm); border: 1px dashed var(--border-subtle);">
                <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">🔍</span>
                <strong style="color: var(--text-heading); font-size: 0.85rem;">Tidak ada kegiatan yang sesuai filter / pencarian</strong>
                <p style="font-size: 0.75rem; margin-top: 0.25rem;">Coba reset kata kunci atau bersihkan kotak pencarian di atas.</p>
                <button class="btn btn-outline btn-sm" onclick="resetAllTimelineFilters()" style="margin-top: 0.5rem;">✕ Reset Semua Filter</button>
            </div>
        `;
        return;
    }

    timelineContainer.innerHTML = timelines.map(item => {
        let badgeColor = 'badge-primary';
        let iconType = '📌';
        const faseLower = (item.fase || '').toLowerCase();

        if (faseLower.includes('rapat') || faseLower.includes('diskusi') || faseLower.includes('pertemuan') || faseLower.includes('vidcon')) {
            badgeColor = 'badge-info';
            iconType = '🗣️';
        } else if (faseLower.includes('surat masuk')) {
            badgeColor = 'badge-primary';
            iconType = '📩';
        } else if (faseLower.includes('surat keluar')) {
            badgeColor = 'badge-info';
            iconType = '📤';
        } else if (faseLower.includes('persyaratan') || faseLower.includes('lahan') || faseLower.includes('sppl')) {
            badgeColor = 'badge-warning';
            iconType = '📋';
        } else if (faseLower.includes('verifikasi') || faseLower.includes('peninjauan') || faseLower.includes('lapangan')) {
            badgeColor = 'badge-success';
            iconType = '🔍';
        } else if (faseLower.includes('dipa') || faseLower.includes('anggaran') || faseLower.includes('myc')) {
            badgeColor = 'badge-success';
            iconType = '💰';
        } else if (faseLower.includes('pengadaan') || faseLower.includes('kontrak') || faseLower.includes('lelang')) {
            badgeColor = 'badge-danger';
            iconType = '🛒';
        } else if (faseLower.includes('sk')) {
            badgeColor = 'badge-primary';
            iconType = '📜';
        }

        // Render Multi-Keywords
        let keywordsHtml = '';
        if (item.keywords) {
            const kwList = item.keywords.split(',').map(k => k.trim()).filter(Boolean);
            keywordsHtml = `
                <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.45rem; align-items: center;">
                    <span style="font-size: 0.65rem; color: var(--text-muted); font-weight: 600;">Kata Kunci:</span>
                    ${kwList.map(kw => `
                        <span class="badge-keyword" onclick="filterByKeyword('${kw}')" title="Klik untuk filter data dengan keyword ini">
                            🏷️ ${kw}
                        </span>
                    `).join('')}
                </div>
            `;
        }

        // Format Catatan (preserve newlines & clean markdown-like lists)
        let formattedCatatan = (item.catatan || '')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');

        return `
            <div class="timeline-card" id="kegiatan-${item.no}">
                <div class="timeline-icon"></div>
                <div class="timeline-box" style="box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); border-left: 3px solid var(--primary);">
                    
                    <!-- Header Kartu: Nomor Urut, Badge Kategori & Tanggal -->
                    <div class="timeline-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; flex-wrap: wrap; gap: 0.35rem;">
                        <div style="display: flex; align-items: center; gap: 0.35rem;">
                            <span class="badge badge-secondary" style="font-weight: 800; font-size: 0.725rem; padding: 0.15rem 0.45rem;">#${item.no}</span>
                            <span class="badge ${badgeColor}">${iconType} ${item.fase}</span>
                        </div>
                        <span class="timeline-date" style="font-size: 0.75rem; color: var(--text-muted);">
                            📅 <strong>${formatIndoDate(item.tanggal)}</strong>
                        </span>
                    </div>

                    <!-- Judul Utama Kegiatan -->
                    <h4 style="font-size: 0.875rem; font-weight: 700; color: var(--text-heading); margin-bottom: 0.25rem; line-height: 1.35;">
                        ${item.judul}
                    </h4>

                    <!-- Nomor Dokumen (jika ada) -->
                    ${item.nomor_dokumen ? `
                        <div style="margin-bottom: 0.35rem;">
                            <span style="font-size: 0.725rem; font-weight: 600; color: var(--text-heading); background: var(--bg-muted); border: 1px solid var(--border-subtle); padding: 0.15rem 0.45rem; border-radius: 4px; display: inline-block;">
                                📄 No: ${item.nomor_dokumen}
                            </span>
                        </div>
                    ` : ''}

                    <!-- Uraian & Keterangan Rinci -->
                    ${formattedCatatan ? `
                        <div style="font-size: 0.765rem; color: var(--text-body); line-height: 1.45; margin-top: 0.35rem; background: var(--bg-muted); padding: 0.5rem 0.65rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                            ${formattedCatatan}
                        </div>
                    ` : ''}

                    <!-- Multi-Keyword Tags -->
                    ${keywordsHtml}

                    <!-- Bukti Dukung & Tombol Tautan Dokumen Cloud -->
                    ${item.link_dokumen ? `
                        <div style="margin-top: 0.6rem; padding-top: 0.45rem; border-top: 1px dashed var(--border-subtle); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
                            <div style="display: flex; align-items: center; gap: 0.35rem; max-width: 65%;">
                                <span style="font-size: 0.75rem;">📎</span>
                                <span style="font-size: 0.7rem; color: var(--text-muted); font-style: italic; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.bukti_dukung}">
                                    ${item.bukti_dukung}
                                </span>
                            </div>
                            <a href="${item.link_dokumen}" target="_blank" rel="noopener noreferrer" class="btn-doc-link" title="Buka berkas resmi di SharePoint / Cloud Drive">
                                📂 Buka Dokumen Drive ↗
                            </a>
                        </div>
                    ` : (item.bukti_dukung ? `
                        <div style="margin-top: 0.55rem; padding-top: 0.45rem; border-top: 1px dashed var(--border-subtle); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.35rem;">
                            <span style="font-size: 0.7rem; color: var(--text-muted); font-style: italic;">
                                📎 ${item.bukti_dukung}
                            </span>
                        </div>
                    ` : '')}

                </div>
            </div>
        `;
    }).join('');
}

// Filter Handler Kategori
function filterTimeline(kategori, btn) {
    currentCategoryFilter = kategori;
    document.querySelectorAll('.filter-time-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    applyTimelineFilterAndRender();
}

// Filter Handler Keyword Klik Chip
function filterByKeyword(keyword) {
    currentKeywordFilter = keyword;
    const bar = document.getElementById('activeKeywordBar');
    const text = document.getElementById('activeKeywordText');
    if (bar && text) {
        text.textContent = `"${keyword}"`;
        bar.style.display = 'flex';
    }
    applyTimelineFilterAndRender();
}

function clearKeywordFilter() {
    currentKeywordFilter = null;
    const bar = document.getElementById('activeKeywordBar');
    if (bar) bar.style.display = 'none';
    applyTimelineFilterAndRender();
}

// Search Input Handler
function handleTimelineSearch(val) {
    currentTimelineSearch = val || '';
    const btnClear = document.getElementById('btnClearSearch');
    if (btnClear) btnClear.style.display = currentTimelineSearch ? 'block' : 'none';
    applyTimelineFilterAndRender();
}

function clearTimelineSearch() {
    const input = document.getElementById('timelineSearchInput');
    if (input) input.value = '';
    currentTimelineSearch = '';
    const btnClear = document.getElementById('btnClearSearch');
    if (btnClear) btnClear.style.display = 'none';
    applyTimelineFilterAndRender();
}

function resetAllTimelineFilters() {
    currentCategoryFilter = 'all';
    currentKeywordFilter = null;
    currentTimelineSearch = '';
    const input = document.getElementById('timelineSearchInput');
    if (input) input.value = '';
    const btnClear = document.getElementById('btnClearSearch');
    if (btnClear) btnClear.style.display = 'none';
    const bar = document.getElementById('activeKeywordBar');
    if (bar) bar.style.display = 'none';
    document.querySelectorAll('.filter-time-btn').forEach((b, i) => {
        if (i === 0) b.classList.add('active');
        else b.classList.remove('active');
    });
    applyTimelineFilterAndRender();
}

// Sorting Order Handler
function toggleTimelineSort() {
    const btn = document.getElementById('btnToggleSort');
    if (currentTimelineSortOrder === 'asc') {
        currentTimelineSortOrder = 'desc';
        if (btn) btn.textContent = '⬇️ Urutan: Terbaru Dulu (#44 ➔ #1)';
    } else {
        currentTimelineSortOrder = 'asc';
        if (btn) btn.textContent = '⬆️ Urutan: Tertua Dulu (#1 ➔ #44)';
    }
    applyTimelineFilterAndRender();
}

// Render Persuratan Table & Search
function handleSuratSearch(val) {
    currentSuratSearch = val || '';
    renderSuratList(allSuratList);
}

function renderSuratList(suratList) {
    const suratTbody = document.getElementById('suratTableBody');
    const elSuratCount = document.getElementById('suratCount');
    
    let filteredSurat = [...suratList];
    if (currentSuratSearch.trim() !== '') {
        const q = currentSuratSearch.trim().toLowerCase();
        filteredSurat = filteredSurat.filter(s => {
            const no = (s.no_surat || '').toLowerCase();
            const p = (s.perihal || '').toLowerCase();
            const j = (s.jenis_surat || '').toLowerCase();
            const peng = (s.pengirim || '').toLowerCase();
            const kw = (s.keywords || '').toLowerCase();
            return no.includes(q) || p.includes(q) || j.includes(q) || peng.includes(q) || kw.includes(q);
        });
    }

    if (elSuratCount) {
        if (filteredSurat.length === suratList.length) {
            elSuratCount.textContent = `${suratList.length} Berkas`;
        } else {
            elSuratCount.textContent = `${filteredSurat.length} dari ${suratList.length} Berkas`;
        }
    }

    if (!suratTbody) return;

    if (filteredSurat.length === 0) {
        suratTbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
                    Tidak ada dokumen persuratan yang cocok dengan pencarian.
                </td>
            </tr>
        `;
        return;
    }

    suratTbody.innerHTML = filteredSurat.map((s, idx) => {
        // Parse Keywords pills
        let kwHtml = '';
        if (s.keywords) {
            const tags = s.keywords.split(',').map(t => t.trim()).filter(Boolean);
            kwHtml = `
                <div style="display: flex; flex-wrap: wrap; gap: 0.2rem; margin-top: 0.25rem;">
                    ${tags.map(t => `<span class="badge-keyword" style="font-size: 0.625rem; padding: 0.05rem 0.35rem;">🏷️ ${t}</span>`).join('')}
                </div>
            `;
        }

        return `
            <tr>
                <td style="font-size: 0.725rem; white-space: nowrap; vertical-align: top;">
                    <span class="badge badge-secondary" style="font-size: 0.65rem; font-weight: 800;">#${idx + 1}</span><br>
                    <strong>${formatIndoDate(s.tgl_surat)}</strong>
                </td>
                <td style="vertical-align: top;">
                    <strong style="font-size: 0.76rem; color: var(--text-heading); word-break: break-word;">${s.no_surat}</strong><br>
                    <span class="badge badge-primary" style="font-size: 0.625rem; margin-top: 0.2rem;">${s.jenis_surat}</span>
                </td>
                <td style="vertical-align: top;">
                    <div style="font-size: 0.75rem; color: var(--text-heading); font-weight: 600; line-height: 1.35;">
                        ${s.perihal}
                    </div>
                    ${s.pengirim ? `<div style="font-size: 0.685rem; color: var(--text-muted); margin-top: 0.2rem;">🏛️ <em>${s.pengirim}</em></div>` : ''}
                    ${kwHtml}
                </td>
                <td style="white-space: nowrap; text-align: center; vertical-align: middle;">
                    ${s.file_path ? `
                        <a href="${s.file_path}" target="_blank" rel="noopener noreferrer" class="btn-doc-link" style="font-size: 0.685rem; padding: 0.22rem 0.55rem;" title="Buka Dokumen Resmi di Cloud Drive / SharePoint">
                            📂 Buka ↗
                        </a>
                    ` : '<span style="color:var(--text-subtle); font-size:0.75rem;">-</span>'}
                </td>
            </tr>
        `;
    }).join('');
}

// Modal Form Controls
function openQuickActionModal(tabType = 'kegiatan') {
    const modal = document.getElementById('quickModal');
    if (modal) {
        modal.classList.add('show');
        switchModalTab(tabType);
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

document.addEventListener('DOMContentLoaded', () => {
    initProyekTheme();
    checkProyekAuthState();
});
