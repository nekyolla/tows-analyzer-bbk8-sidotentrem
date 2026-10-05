# TOWS Analyzer by Kinness

Kalkulator analisis TOWS berbasis browser. Menghitung **SAP**, **ETOP**, posisi kuadran, dan rekomendasi strategi tanpa spreadsheet. Metodologi mengacu pada Dr. Setya Haksama, FKM Universitas Airlangga.

Semua data diproses dan disimpan otomatis di browser (`localStorage`). Tidak ada data yang dikirim ke server.

## Alur

1. **Variabel Eksternal**: daftar tanpa kategori. Total bobot = 100%.
2. **Variabel Internal**: dikelompokkan dalam 8M (Man, Money, Market, Machine, Method, Material, Time, Information). Total bobot kategori = 100%, dan total bobot variabel di setiap kategori = bobot kategorinya.
3. **Hasil Analisis**: muncul setelah semua validasi terpenuhi.

Setiap variabel punya skala 4 level dengan skor tetap **−3, −1, +1, +3**:

- **Kualitatif**: deskripsi per level (level 1 dan 4 wajib), level dipilih manual saat observasi.
- **Kuantitatif**: range min–max per level (keempatnya wajib, tidak boleh overlap). Level dipilih otomatis dari nilai observasi. Celah antar-range hanya menghasilkan peringatan.

## Rumus

| Besaran | Rumus |
|---|---|
| Skor terbobot | bobot (%) × skor |
| O / T | jumlah skor terbobot eksternal positif / negatif |
| S / W | jumlah skor terbobot internal positif / negatif |
| ETOP | O + T |
| SAP | S + W |

Kuadran (nilai 0 dihitung positif):

| | SAP ≥ 0 | SAP < 0 |
|---|---|---|
| **ETOP ≥ 0** | SO: Ofensif | WO: Turn Around |
| **ETOP < 0** | ST: Diversifikasi | WT: Defensif |

## Pengembangan

```bash
npm install
npm run dev      # server pengembangan
npm test         # unit test (Vitest)
npm run lint     # oxlint
npm run build    # build produksi ke dist/
```

## Struktur

```
src/
  App.jsx                 layout, indikator autosave, reset
  hooks/useAppReducer.js  state (useReducer) + autosave localStorage
  lib/
    calculations.js       rumus, validasi bobot & range, kesiapan kalkulasi
    validators.js         kelengkapan variabel
    interpretation.js     teks interpretasi kuadran
    constants.js          kategori 8M, skor, kuadran, template teks
    format.js             format angka bertanda
  components/             UI (section eksternal/internal, editor skala, hasil, chart)
```
