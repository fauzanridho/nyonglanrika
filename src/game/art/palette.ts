// ============================================================
// Palette & Colors - Pixel art tanpa asset eksternal
// ============================================================

export const DEFAULT_PALETTE: Record<string, string> = {
  // Transparan / Kosong
  '.': 'transparent',

  // Alam & Lingkungan
  'G': '#4c8a2b', // Rumput terang
  'g': '#32611e', // Rumput gelap / bayangan
  'D': '#8a5c38', // Tanah / jalan
  'd': '#5e3c23', // Tanah gelap / batang pohon
  'T': '#225927', // Daun pohon tua
  't': '#3b823e', // Daun pohon muda
  'W': '#4b9fea', // Air sungai terang
  'w': '#2665a3', // Air sungai dalam
  'F': '#3a6642', // Daun pinus Baturraden
  'P': '#1b3b22', // Pinus gelap

  // Bangunan, Lantai & Jalanan
  'B': '#757984', // Batu / paving
  'b': '#484b54', // Batu gelap / aspal
  'R': '#a85b3b', // Bata merah / atap genteng
  'r': '#6e3822', // Bata gelap / rel
  'Y': '#e6b333', // Kayu / bangku
  'y': '#a87818', // Kayu gelap
  'L': '#ffe266', // Lentera / lampu menyala
  'l': '#998433', // Tiang lentera mati

  // Karakter (bisa di-override per player look)
  'H': '#3a2010', // Rambut default
  'S': '#f2be9b', // Kulit default
  's': '#c99677', // Bayangan kulit
  'C': '#2d68c4', // Baju default
  'c': '#1b407d', // Bayangan baju
  'P_': '#2b2e38', // Celana default
  'E': '#151515', // Mata / outline gelap
  'W_': '#ffffff', // Putih mata / highlight
};
