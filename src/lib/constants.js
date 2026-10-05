// Fixed 8M categories per TOWS methodology (extended)
// These are pre-defined and cannot be added/deleted/renamed by users.
export const INTERNAL_CATEGORIES = [
  {
    id: 'man',
    name: 'Man',
    description: 'Sumber daya manusia — tingkat pendidikan, jumlah tenaga kerja, keterampilan',
  },
  {
    id: 'money',
    name: 'Money',
    description: 'Keuangan — keuntungan, biaya operasional, modal',
  },
  {
    id: 'market',
    name: 'Market',
    description: 'Pasar — harga jual, volume penjualan, kualitas produk',
  },
  {
    id: 'machine',
    name: 'Machine',
    description: 'Mesin/Teknologi — peralatan, penyimpanan, pengendalian iklim',
  },
  {
    id: 'method',
    name: 'Method',
    description: 'Metode — proses/teknik, jadwal produksi, prosedur kerja',
  },
  {
    id: 'material',
    name: 'Material',
    description: 'Bahan baku — ketersediaan pasokan, jarak logistik, pemanfaatan limbah',
  },
  {
    id: 'time',
    name: 'Time',
    description: 'Waktu — efisiensi waktu produksi, ketepatan jadwal, lead time',
  },
  {
    id: 'information',
    name: 'Information',
    description: 'Informasi — sistem informasi, data manajemen, alur komunikasi',
  },
];

// Fixed scale scores per methodology — not configurable
export const SCALE_SCORES = [-3, -1, 1, 3];

// Quadrant definitions
export const QUADRANTS = {
  SO: {
    name: 'SO',
    strategy: 'Ofensif (Aggressive)',
    color: '#10b981', // emerald-500
  },
  WO: {
    name: 'WO',
    strategy: 'Turn Around',
    color: '#f59e0b', // amber-500
  },
  WT: {
    name: 'WT',
    strategy: 'Defensif',
    color: '#ef4444', // red-500
  },
  ST: {
    name: 'ST',
    strategy: 'Diversifikasi',
    color: '#3b82f6', // blue-500
  },
};

// Interpretation templates per quadrant (Bahasa Indonesia)
export const INTERPRETATION_TEMPLATES = {
  SO: 'Organisasi berada pada kuadran SO. Kekuatan internal yang dimiliki sejalan dengan besarnya peluang eksternal yang tersedia. Strategi yang disarankan adalah agresif — memanfaatkan kekuatan secara maksimal untuk merebut peluang yang ada.',
  WO: 'Organisasi berada pada kuadran WO. Peluang eksternal lebih besar dibanding ancaman, namun kelemahan internal masih dominan. Strategi yang disarankan adalah turn around — memperbaiki kelemahan internal terlebih dahulu sebelum memaksimalkan peluang eksternal.',
  WT: 'Organisasi berada pada kuadran WT. Kelemahan internal dan ancaman eksternal sama-sama dominan. Strategi yang disarankan adalah defensif — meminimalkan kelemahan sambil menghindari dampak ancaman, sebelum mengambil langkah ekspansif.',
  ST: 'Organisasi berada pada kuadran ST. Kekuatan internal cukup besar, namun dihadapkan pada ancaman eksternal yang signifikan. Strategi yang disarankan adalah diversifikasi — menggunakan kekuatan yang ada untuk membuka peluang baru yang mengurangi ketergantungan pada kondisi eksternal saat ini.',
};

// Boundary warning messages
export const BOUNDARY_WARNINGS = {
  sapZero: 'Posisi tepat di sumbu SAP — kekuatan dan kelemahan internal saling meniadakan, hasil ini sensitif terhadap perubahan kecil pada bobot atau skor.',
  etopZero: 'Posisi tepat di sumbu ETOP — peluang dan ancaman eksternal saling meniadakan, hasil ini sensitif terhadap perubahan kecil pada bobot atau skor.',
};

// Weight validation tolerance (±0.01%)
export const WEIGHT_TOLERANCE = 0.01;

// Soft warning threshold for variable count
export const VARIABLE_COUNT_WARNING = 30;
