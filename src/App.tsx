/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import {
  Camera,
  Upload,
  Sparkles,
  Palette,
  Printer,
  Download,
  RefreshCw,
  Trash2,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  RotateCcw,
  Type,
  Box,
  Layers,
  FlipHorizontal,
  Timer,
  Eye,
  Wand2,
  FileImage,
  LayoutGrid,
  Maximize2,
  Info,
  Check,
  X,
  Award,
  Star,
  Share2,
  QrCode,
  Copy,
  Globe,
  Monitor
} from 'lucide-react';

// Polyfill untuk ctx.roundRect jika pelayar lama digunakan
if (typeof window !== 'undefined' && typeof CanvasRenderingContext2D !== 'undefined') {
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (
      this: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      radii?: number | number[]
    ) {
      const r = typeof radii === 'number' ? radii : Array.isArray(radii) ? radii[0] || 0 : 0;
      const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
      this.beginPath();
      this.moveTo(x + radius, y);
      this.arcTo(x + w, y, x + w, y + h, radius);
      this.arcTo(x + w, y + h, x, y + h, radius);
      this.arcTo(x, y + h, x, y, radius);
      this.arcTo(x, y, x + w, y, radius);
      this.closePath();
      return this;
    };
  }
}

/**
 * ============================================================================
 * AVATARKU 3D STUDIO - METADATA AVATAR & TETAPAN AUTO-FIT WAJAH
 * Setiap avatar mempunyai konfigurasi ruang wajah (faceSlot), geometri 3D,
 * warna utama, dan aksesori lapisan hadapan/belakang tersendiri.
 * ============================================================================
 */
export interface AvatarColor {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

export interface FaceSlotConfig {
  centerX: number;
  centerY: number;
  widthRatio: number;
  heightRatio: number;
  eyeLineRatio: number;
  baseAngle: number;
  maskType: string;
  feather: number;
}

export interface AvatarItem {
  id: string;
  name: string;
  category: string;
  gender: 'Lelaki' | 'Perempuan' | 'Uniseks';
  badge: string;
  description: string;
  colors: AvatarColor[];
  faceSlot: FaceSlotConfig;
  accessoryType: string;
  hasCape: boolean;
  emblem: string;
}

const AVATAR_CATALOG: AvatarItem[] = [
  {
    id: 'wira-super',
    name: 'Kapten Kilat Super',
    category: 'Wira Super',
    gender: 'Lelaki',
    badge: 'Popular',
    description: 'Adiwira pelindung angkasa dengan mantel bertenaga dan perisai dada bercahaya.',
    colors: [
      { name: 'Biru Elektrik', primary: '#2563EB', secondary: '#EF4444', accent: '#FACC15' },
      { name: 'Merah Berani', primary: '#DC2626', secondary: '#1E40AF', accent: '#FACC15' },
      { name: 'Ungu Kosmik', primary: '#7C3AED', secondary: '#EC4899', accent: '#38BDF8' }
    ],
    faceSlot: {
      centerX: 0.5,
      centerY: 0.275,
      widthRatio: 0.215,
      heightRatio: 0.215,
      eyeLineRatio: 0.42,
      baseAngle: 0,
      maskType: 'hero-jaw',
      feather: 10
    },
    accessoryType: 'superhero-cowl',
    hasCape: true,
    emblem: 'star'
  },
  {
    id: 'putera-diraja',
    name: 'Putera Mahkota Kristal',
    category: 'Putera',
    gender: 'Lelaki',
    badge: 'Diraja',
    description: 'Putera tampan lengkap dengan mahkota emas permata dan jubah istana.',
    colors: [
      { name: 'Biru Diraja', primary: '#1D4ED8', secondary: '#991B1B', accent: '#FBBF24' },
      { name: 'Hijau Zamrud', primary: '#047857', secondary: '#78350F', accent: '#FDE047' },
      { name: 'Putih Gading', primary: '#F8FAFC', secondary: '#1E3A8A', accent: '#F59E0B' }
    ],
    faceSlot: {
      centerX: 0.5,
      centerY: 0.285,
      widthRatio: 0.21,
      heightRatio: 0.22,
      eyeLineRatio: 0.43,
      baseAngle: 0,
      maskType: 'oval',
      feather: 12
    },
    accessoryType: 'royal-crown-male',
    hasCape: true,
    emblem: 'crown'
  },
  {
    id: 'puteri-bintang',
    name: 'Puteri Pelangi Bintang',
    category: 'Puteri',
    gender: 'Perempuan',
    badge: 'Kegemaran',
    description: 'Puteri anggun dengan tiara berlian, gaun kembang 3D dan tongkat sakti.',
    colors: [
      { name: 'Merah Jambu Sakura', primary: '#EC4899', secondary: '#FCE7F3', accent: '#FACC15' },
      { name: 'Ungu Lavender', primary: '#8B5CF6', secondary: '#EDE9FE', accent: '#FDE047' },
      { name: 'Biru Ais', primary: '#0EA5E9', secondary: '#E0F2FE', accent: '#F8FAFC' }
    ],
    faceSlot: {
      centerX: 0.5,
      centerY: 0.285,
      widthRatio: 0.205,
      heightRatio: 0.215,
      eyeLineRatio: 0.44,
      baseAngle: 0,
      maskType: 'soft-oval',
      feather: 14
    },
    accessoryType: 'princess-tiara',
    hasCape: false,
    emblem: 'heart'
  },
  {
    id: 'angkasawan-negara',
    name: 'Angkasawan Galaksi',
    category: 'Angkasawan',
    gender: 'Uniseks',
    badge: 'STEM',
    description: 'Sut angkasa lepas lengkap dengan helmet visor bulat 3D dan beg jetpack.',
    colors: [
      { name: 'Putih NASA/Angkasa', primary: '#F1F5F9', secondary: '#2563EB', accent: '#F97316' },
      { name: 'Jingga Penjelajah', primary: '#EA580C', secondary: '#1E293B', accent: '#38BDF8' },
      { name: 'Biru Nebula', primary: '#1E40AF', secondary: '#93C5FD', accent: '#FACC15' }
    ],
    faceSlot: {
      centerX: 0.5,
      centerY: 0.275,
      widthRatio: 0.225,
      heightRatio: 0.22,
      eyeLineRatio: 0.43,
      baseAngle: 0,
      maskType: 'helmet-circle',
      feather: 14
    },
    accessoryType: 'astronaut-helmet',
    hasCape: false,
    emblem: 'planet'
  },
  {
    id: 'doktor-pakar',
    name: 'Dr. Cilik Prihatin',
    category: 'Doktor',
    gender: 'Perempuan',
    badge: 'Kerjaya',
    description: 'Kot putih doktor profesional bersama stetoskop 3D dan lencana hospital.',
    colors: [
      { name: 'Putih Klinikal & Biru', primary: '#FFFFFF', secondary: '#0284C7', accent: '#10B981' },
      { name: 'Hijau Bedah', primary: '#10B981', secondary: '#065F46', accent: '#FFFFFF' },
      { name: 'Merah Jambu Pediatrik', primary: '#F472B6', secondary: '#FFFFFF', accent: '#38BDF8' }
    ],
    faceSlot: {
      centerX: 0.5,
      centerY: 0.28,
      widthRatio: 0.21,
      heightRatio: 0.215,
      eyeLineRatio: 0.43,
      baseAngle: 0,
      maskType: 'hijab-friendly',
      feather: 12
    },
    accessoryType: 'doctor-headgear',
    hasCape: false,
    emblem: 'medical'
  },
  {
    id: 'guru-inspirasi',
    name: 'Cikgu Bestari Cemerlang',
    category: 'Guru',
    gender: 'Lelaki',
    badge: 'Pendidikan',
    description: 'Pendidik berdedikasi dengan blazer kemas, cermin mata pintar dan buku ilmu.',
    colors: [
      { name: 'Biru Korporat', primary: '#1E3A8A', secondary: '#DBEAFE', accent: '#F59E0B' },
      { name: 'Coklat Akademik', primary: '#78350F', secondary: '#FEF3C7', accent: '#10B981' },
      { name: 'Ungu Pendidik', primary: '#5B21B6', secondary: '#EDE9FE', accent: '#FBBF24' }
    ],
    faceSlot: {
      centerX: 0.5,
      centerY: 0.28,
      widthRatio: 0.21,
      heightRatio: 0.22,
      eyeLineRatio: 0.42,
      baseAngle: 0,
      maskType: 'oval',
      feather: 12
    },
    accessoryType: 'scholar-hair',
    hasCape: false,
    emblem: 'book'
  },
  {
    id: 'saintis-makmal',
    name: 'Profesor Inovasi Sains',
    category: 'Saintis',
    gender: 'Uniseks',
    badge: 'STEM',
    description: 'Saintis makmal lengkap dengan gogal keselamatan 3D di dahi dan kelalang bercahaya.',
    colors: [
      { name: 'Putih Makmal & Toska', primary: '#F8FAFC', secondary: '#0D9488', accent: '#A855F7' },
      { name: 'Biru Kuantum', primary: '#E0F2FE', secondary: '#4F46E5', accent: '#22C55E' }
    ],
    faceSlot: {
      centerX: 0.5,
      centerY: 0.285,
      widthRatio: 0.21,
      heightRatio: 0.215,
      eyeLineRatio: 0.44,
      baseAngle: 0,
      maskType: 'oval',
      feather: 12
    },
    accessoryType: 'scientist-goggles',
    hasCape: false,
    emblem: 'atom'
  },
  {
    id: 'pemain-bola',
    name: 'Kapten Harimau Juara',
    category: 'Pemain Bola Sepak',
    gender: 'Lelaki',
    badge: 'Sukan',
    description: 'Jersi bola sepak kebangsaan berjalur dengan bola emas di kaki.',
    colors: [
      { name: 'Kuning Harimau Malaya', primary: '#FACC15', secondary: '#111827', accent: '#FFFFFF' },
      { name: 'Biru Gelombang', primary: '#2563EB', secondary: '#FFFFFF', accent: '#FACC15' },
      { name: 'Merah Juara', primary: '#DC2626', secondary: '#FACC15', accent: '#FFFFFF' }
    ],
    faceSlot: {
      centerX: 0.5,
      centerY: 0.28,
      widthRatio: 0.21,
      heightRatio: 0.215,
      eyeLineRatio: 0.42,
      baseAngle: 0,
      maskType: 'sporty-oval',
      feather: 11
    },
    accessoryType: 'sport-headband',
    hasCape: false,
    emblem: 'trophy'
  },
  {
    id: 'ahli-sukan',
    name: 'Jaguh Olimpik Tangkas',
    category: 'Ahli Sukan',
    gender: 'Perempuan',
    badge: 'Sukan',
    description: 'Atlet badminton & olahraga kebangsaan bersama pingat emas berkilau.',
    colors: [
      { name: 'Merah & Putih Atletik', primary: '#EF4444', secondary: '#1E293B', accent: '#FACC15' },
      { name: 'Biru Muda Sukan', primary: '#0284C7', secondary: '#F8FAFC', accent: '#FACC15' }
    ],
    faceSlot: {
      centerX: 0.5,
      centerY: 0.28,
      widthRatio: 0.205,
      heightRatio: 0.215,
      eyeLineRatio: 0.43,
      baseAngle: 0,
      maskType: 'hijab-friendly',
      feather: 12
    },
    accessoryType: 'athlete-visor',
    hasCape: false,
    emblem: 'medal'
  },
  {
    id: 'anggota-bomba',
    name: 'Wira Bomba Penyelamat',
    category: 'Anggota Bomba',
    gender: 'Lelaki',
    badge: 'Unit Beruniform',
    description: 'Jaket kalis api bersama topi keledar penyelamat merah-kuning.',
    colors: [
      { name: 'Merah Penyelamat', primary: '#DC2626', secondary: '#1F2937', accent: '#FACC15' },
      { name: 'Jingga Taktikal', primary: '#EA580C', secondary: '#111827', accent: '#FDE047' }
    ],
    faceSlot: {
      centerX: 0.5,
      centerY: 0.285,
      widthRatio: 0.21,
      heightRatio: 0.21,
      eyeLineRatio: 0.43,
      baseAngle: 0,
      maskType: 'helmet-visor',
      feather: 12
    },
    accessoryType: 'firefighter-helmet',
    hasCape: false,
    emblem: 'shield'
  },
  {
    id: 'inspektor-polis',
    name: 'Inspektor Amanah Negara',
    category: 'Polis',
    gender: 'Uniseks',
    badge: 'Unit Beruniform',
    description: 'Uniform biru gelap kemas dengan topi puncak polis dan lencana perak.',
    colors: [
      { name: 'Biru Gelap Polis', primary: '#172554', secondary: '#1E3A8A', accent: '#E2E8F0' },
      { name: 'Putih Istiadat', primary: '#F8FAFC', secondary: '#172554', accent: '#FACC15' }
    ],
    faceSlot: {
      centerX: 0.5,
      centerY: 0.29,
      widthRatio: 0.21,
      heightRatio: 0.21,
      eyeLineRatio: 0.43,
      baseAngle: 0,
      maskType: 'oval',
      feather: 12
    },
    accessoryType: 'police-cap',
    hasCape: false,
    emblem: 'badge'
  },
  {
    id: 'tradisional-melayu',
    name: 'Busana Warisan Songket',
    category: 'Pakaian Tradisional Melayu',
    gender: 'Uniseks',
    badge: 'Budaya',
    description: 'Baju Melayu / Kurung Songket Diraja lengkap dengan tengkolok / selendang emas.',
    colors: [
      { name: 'Ungu Songket Emas', primary: '#6D28D9', secondary: '#4C1D95', accent: '#FBBF24' },
      { name: 'Hijau Zamrud Tradisi', primary: '#047857', secondary: '#064E3B', accent: '#FDE047' },
      { name: 'Biru Nilam Diraja', primary: '#1D4ED8', secondary: '#1E3A8A', accent: '#F59E0B' }
    ],
    faceSlot: {
      centerX: 0.5,
      centerY: 0.285,
      widthRatio: 0.21,
      heightRatio: 0.215,
      eyeLineRatio: 0.43,
      baseAngle: 0,
      maskType: 'oval',
      feather: 12
    },
    accessoryType: 'songkok-tengkolok',
    hasCape: false,
    emblem: 'bunga-raya'
  },
  {
    id: 'pahlawan-melayu',
    name: 'Laksamana Satria Nusantara',
    category: 'Pahlawan Melayu',
    gender: 'Lelaki',
    badge: 'Sejarah',
    description: 'Busana pendekar klasik dengan tanjak laksamana, bengkung dan keris adat.',
    colors: [
      { name: 'Hitam & Emas Pendekar', primary: '#1E293B', secondary: '#991B1B', accent: '#F59E0B' },
      { name: 'Merah Laksamana', primary: '#991B1B', secondary: '#111827', accent: '#FBBF24' }
    ],
    faceSlot: {
      centerX: 0.5,
      centerY: 0.29,
      widthRatio: 0.21,
      heightRatio: 0.215,
      eyeLineRatio: 0.43,
      baseAngle: 0,
      maskType: 'oval',
      feather: 12
    },
    accessoryType: 'tanjak-pahlawan',
    hasCape: true,
    emblem: 'crescent'
  },
  {
    id: 'pengembara-rimba',
    name: 'Pengembara Ekspedisi Rimba',
    category: 'Pengembara',
    gender: 'Uniseks',
    badge: 'Alam',
    description: 'Pakaian safari pengembara lengkap dengan topi fedora, teropong dan kompas.',
    colors: [
      { name: 'Khaki Safari & Hijau', primary: '#B45309', secondary: '#15803D', accent: '#FDE047' },
      { name: 'Hijau Rimba Tropika', primary: '#166534', secondary: '#78350F', accent: '#FACC15' }
    ],
    faceSlot: {
      centerX: 0.5,
      centerY: 0.29,
      widthRatio: 0.21,
      heightRatio: 0.21,
      eyeLineRatio: 0.43,
      baseAngle: 0,
      maskType: 'oval',
      feather: 12
    },
    accessoryType: 'explorer-hat',
    hasCape: false,
    emblem: 'compass'
  },
  {
    id: 'sains-teknologi',
    name: 'Jurutera Siber & Robotik',
    category: 'Ahli Sains Teknologi',
    gender: 'Uniseks',
    badge: 'Masa Depan',
    description: 'Sut jurutera AI moden dengan visor hologram pintar dan sarung tangan bionik.',
    colors: [
      { name: 'Siber Biru Neon', primary: '#0F172A', secondary: '#0284C7', accent: '#38BDF8' },
      { name: 'Putih Bersepadu AI', primary: '#F1F5F9', secondary: '#6366F1', accent: '#EC4899' }
    ],
    faceSlot: {
      centerX: 0.5,
      centerY: 0.28,
      widthRatio: 0.215,
      heightRatio: 0.215,
      eyeLineRatio: 0.43,
      baseAngle: 0,
      maskType: 'rounded-shield',
      feather: 12
    },
    accessoryType: 'cyber-headset',
    hasCape: false,
    emblem: 'chip'
  },
  {
    id: 'juruterbang-awan',
    name: 'Kapten Awan Biru',
    category: 'Juruterbang',
    gender: 'Uniseks',
    badge: 'Penerbangan',
    description: 'Uniform kapten pesawat komersial dengan lencana sayap emas dan topi kapten.',
    colors: [
      { name: 'Biru Kapten Penerbangan', primary: '#1E293B', secondary: '#FFFFFF', accent: '#FBBF24' },
      { name: 'Putih Awan Diraja', primary: '#F8FAFC', secondary: '#1E3A8A', accent: '#F59E0B' }
    ],
    faceSlot: {
      centerX: 0.5,
      centerY: 0.29,
      widthRatio: 0.21,
      heightRatio: 0.21,
      eyeLineRatio: 0.43,
      baseAngle: 0,
      maskType: 'oval',
      feather: 12
    },
    accessoryType: 'pilot-cap',
    hasCape: false,
    emblem: 'wings'
  },
  {
    id: 'ahli-muzik',
    name: 'Bintang Simfoni Muzik',
    category: 'Ahli Muzik',
    gender: 'Uniseks',
    badge: 'Kesenian',
    description: 'Jaket konsert bergaya dengan fon kepala studio 3D dan gitar/mikrofon.',
    colors: [
      { name: 'Ungu Konsert Pop', primary: '#7C3AED', secondary: '#EC4899', accent: '#FACC15' },
      { name: 'Merah Klasik', primary: '#BE123C', secondary: '#1E293B', accent: '#FDE047' }
    ],
    faceSlot: {
      centerX: 0.5,
      centerY: 0.28,
      widthRatio: 0.21,
      heightRatio: 0.215,
      eyeLineRatio: 0.43,
      baseAngle: 0,
      maskType: 'oval',
      feather: 12
    },
    accessoryType: 'music-headphones',
    hasCape: false,
    emblem: 'music'
  },
  {
    id: 'watak-fantasi',
    name: 'Kesatria Kristal Fantasi',
    category: 'Watak Fantasi',
    gender: 'Uniseks',
    badge: 'Fantasi',
    description: 'Perisai perak berkilau dengan sayap cahaya fantasi dan mahkota elf/kesatria.',
    colors: [
      { name: 'Biru Kristal Cahaya', primary: '#2563EB', secondary: '#E0E7FF', accent: '#38BDF8' },
      { name: 'Emas & Ungu Magik', primary: '#7E22CE', secondary: '#FEF08A', accent: '#FACC15' }
    ],
    faceSlot: {
      centerX: 0.5,
      centerY: 0.28,
      widthRatio: 0.21,
      heightRatio: 0.215,
      eyeLineRatio: 0.43,
      baseAngle: 0,
      maskType: 'soft-oval',
      feather: 14
    },
    accessoryType: 'fantasy-circlet',
    hasCape: true,
    emblem: 'crystal'
  }
];

export interface BackgroundTheme {
  id: string;
  name: string;
  type: 'solid' | 'gradient' | 'scene-studio' | 'scene-space' | 'scene-school' | 'scene-fantasy' | 'transparent';
  color?: string;
  colors?: string[];
  preview: string;
}

const BACKGROUND_THEMES: BackgroundTheme[] = [
  { id: 'putih', name: 'Putih Bersih', type: 'solid', color: '#FFFFFF', preview: '#FFFFFF' },
  { id: 'biru', name: 'Biru Ceria', type: 'gradient', colors: ['#DBEAFE', '#60A5FA', '#2563EB'], preview: '#60A5FA' },
  { id: 'ungu', name: 'Ungu Magik', type: 'gradient', colors: ['#F3E8FF', '#C084FC', '#7E22CE'], preview: '#C084FC' },
  { id: 'kuning', name: 'Kuning Suria', type: 'gradient', colors: ['#FEF9C3', '#FACC15', '#EA580C'], preview: '#FACC15' },
  { id: 'merah-jambu', name: 'Merah Jambu', type: 'gradient', colors: ['#FCE7F3', '#F472B6', '#DB2777'], preview: '#F472B6' },
  { id: 'studio', name: 'Studio Foto', type: 'scene-studio', colors: ['#1E293B', '#334155', '#0F172A'], preview: '#334155' },
  { id: 'angkasa', name: 'Angkasa Lepas', type: 'scene-space', colors: ['#090D16', '#1E1B4B', '#311042'], preview: '#1E1B4B' },
  { id: 'sekolah', name: 'Sekolah Ceria', type: 'scene-school', colors: ['#E0F2FE', '#BAE6FD', '#FEF3C7'], preview: '#38BDF8' },
  { id: 'fantasi', name: 'Dunia Fantasi', type: 'scene-fantasy', colors: ['#2E1065', '#4C1D95', '#831843'], preview: '#6D28D9' },
  { id: 'telus', name: 'Telus (PNG)', type: 'transparent', color: 'transparent', preview: 'checker' }
];

const FRAME_STYLES = [
  { id: 'none', name: 'Tiada Bingkai' },
  { id: 'gold-star', name: 'Bintang Emas' },
  { id: 'school-badge', name: 'Lencana Sekolah' },
  { id: 'cyber-neon', name: 'Neon Moden' },
  { id: 'royal-songket', name: 'Ukiran Diraja' },
  { id: 'polaroid', name: 'Kad Kenangan' }
];

const PRESET_SLOGANS = [
  'Saya Hebat!',
  'Bintang Kelas',
  'Cita-Cita Saya!',
  'Wira Masa Depan',
  'Murid Cemerlang',
  'Senyum Selalu!'
];

export interface FaceLandmarks {
  detected: boolean;
  imageWidth: number;
  imageHeight: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  nose: { x: number; y: number };
  mouth: { x: number; y: number };
  angleDeg: number;
}

export interface FitTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  feather: number;
  brightness: number;
  maskType: string;
}

export interface EditorConfig {
  backgroundId: string;
  frameId: string;
  softShadow: boolean;
  userName: string;
  customText: string;
  textSize: 'small' | 'medium' | 'large';
  textColor: string;
  textPosition: 'top' | 'bottom';
}

/**
 * Menghasilkan gambar potret contoh yang realistik dengan latar belakang berbeza
 * supaya pengguna boleh menguji aliran kerja walaupun tanpa kamera fizikal.
 */
function generateSamplePortraitDataUrl(variant = 1): string {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Latar belakang bilik/taman yang akan dibuang oleh modul BackgroundRemoval
  if (variant === 1) {
    const bgGrad = ctx.createLinearGradient(0, 0, 720, 720);
    bgGrad.addColorStop(0, '#86EFAC');
    bgGrad.addColorStop(1, '#3B82F6');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 720, 720);
    // Corak latar belakang supaya kelihatan jelas apabila dibuang
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(100 + i * 80, 120 + (i % 3) * 180, 45, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (variant === 2) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 720);
    bgGrad.addColorStop(0, '#FDE047');
    bgGrad.addColorStop(1, '#FB923C');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 720, 720);
  } else {
    const bgGrad = ctx.createLinearGradient(0, 0, 720, 0);
    bgGrad.addColorStop(0, '#C084FC');
    bgGrad.addColorStop(1, '#F472B6');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 720, 720);
  }

  ctx.save();
  const tilt = variant === 3 ? 0.05 : variant === 2 ? -0.03 : 0;
  ctx.translate(360, 360);
  ctx.rotate(tilt);
  ctx.translate(-360, -360);

  // Bahu / Baju subjek
  ctx.fillStyle = variant === 1 ? '#1E40AF' : variant === 2 ? '#BE185D' : '#047857';
  ctx.beginPath();
  ctx.ellipse(360, 680, 210, 150, 0, Math.PI, 0, false);
  ctx.fill();

  // Leher
  const skinColor = variant === 1 ? '#F3C6A5' : variant === 2 ? '#E8B490' : '#D99B72';
  const skinShadow = variant === 1 ? '#DFAA84' : variant === 2 ? '#CE9670' : '#B87A52';
  ctx.fillStyle = skinShadow;
  ctx.fillRect(310, 440, 100, 110);

  // Rambut belakang / Tudung (untuk variasi 2)
  if (variant === 2) {
    // Tudung / Hijab
    ctx.fillStyle = '#DB2777';
    ctx.beginPath();
    ctx.ellipse(360, 350, 175, 215, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Rambut belakang
    ctx.fillStyle = '#1E1B18';
    ctx.beginPath();
    ctx.ellipse(360, 295, 165, 175, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Telinga
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.ellipse(215, 345, 24, 42, -0.1, 0, Math.PI * 2);
  ctx.ellipse(505, 345, 24, 42, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Wajah (Muka Bujur dengan pencahayaan lembut)
  const faceGrad = ctx.createRadialGradient(345, 310, 20, 360, 335, 165);
  faceGrad.addColorStop(0, '#FFE0C8');
  faceGrad.addColorStop(0.6, skinColor);
  faceGrad.addColorStop(1, skinShadow);
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(360, 335, 142, 172, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pipi kemerahan ceria
  ctx.fillStyle = 'rgba(244, 114, 182, 0.28)';
  ctx.beginPath();
  ctx.ellipse(275, 372, 28, 16, 0, 0, Math.PI * 2);
  ctx.ellipse(445, 372, 28, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Kening
  ctx.strokeStyle = '#27201C';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(265, 278);
  ctx.quadraticCurveTo(298, 264, 328, 276);
  ctx.moveTo(392, 276);
  ctx.quadraticCurveTo(422, 264, 455, 278);
  ctx.stroke();

  // Mata Kiri & Kanan (Penting untuk pengesanan landmark mata)
  const drawEye = (cx: number, cy: number) => {
    // Putih mata
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 28, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    // Anak mata coklat gelap
    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.arc(cx, cy, 13, 0, Math.PI * 2);
    ctx.fill();
    // Pupil hitam
    ctx.fillStyle = '#09090B';
    ctx.beginPath();
    ctx.arc(cx, cy, 6.5, 0, Math.PI * 2);
    ctx.fill();
    // Pantulan cahaya mata
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 5, 4, 0, Math.PI * 2);
    ctx.arc(cx + 4, cy + 3, 2, 0, Math.PI * 2);
    ctx.fill();
    // Garis kelopak mata
    ctx.strokeStyle = '#1E1B18';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 28, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  };
  drawEye(298, 312);
  drawEye(422, 312);

  // Hidung
  ctx.strokeStyle = 'rgba(140, 82, 50, 0.55)';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(360, 315);
  ctx.lineTo(354, 366);
  ctx.quadraticCurveTo(360, 374, 372, 368);
  ctx.stroke();

  // Mulut / Senyuman lebar mesra
  ctx.fillStyle = '#BE123C';
  ctx.beginPath();
  ctx.arc(360, 405, 42, 0.08 * Math.PI, 0.92 * Math.PI, false);
  ctx.closePath();
  ctx.fill();

  // Gigi putih
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(360, 405, 36, 0.12 * Math.PI, 0.88 * Math.PI, false);
  ctx.closePath();
  ctx.fill();

  // Rambut hadapan / Jambul
  if (variant !== 2) {
    ctx.fillStyle = '#1E1B18';
    ctx.beginPath();
    ctx.moveTo(215, 290);
    ctx.quadraticCurveTo(260, 160, 365, 165);
    ctx.quadraticCurveTo(475, 165, 505, 290);
    ctx.quadraticCurveTo(440, 220, 380, 240);
    ctx.quadraticCurveTo(310, 215, 215, 290);
    ctx.fill();
  } else {
    // Anak tudung & lipatan tudung di dahi
    ctx.strokeStyle = '#9D174D';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(360, 335, 146, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }

  ctx.restore();
  return canvas.toDataURL('image/png');
}

/**
 * ============================================================================
 * MODUL COMPUTER VISION: PENYINGKIRAN LATAR BELAKANG & PENGESANAN WAJAH
 * ============================================================================
 */
async function processBackgroundRemovalAndFaceDetection(
  imageSrc: string,
  sensitivity = 42,
  featherRadius = 2,
  onProgress: (statusMsg: string, pct: number) => void = () => {}
): Promise<{ transparentDataUrl: string; landmarks: FaceLandmarks }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      try {
        onProgress('Sedang memproses gambar…', 15);
        await new Promise((r) => setTimeout(r, 120));

        const maxDim = 900;
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (w === 0 || h === 0) {
          throw new Error('Dimensi gambar tidak sah.');
        }
        if (w > maxDim || h > maxDim) {
          const scale = maxDim / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('Canvas 2D context tidak disokong.');

        ctx.drawImage(img, 0, 0, w, h);

        onProgress('Mengesan subjek…', 45);
        await new Promise((r) => setTimeout(r, 150));

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // 1. Sampel warna latar belakang daripada sempadan luar gambar (atas, kiri, kanan)
        const borderSamples: [number, number, number][] = [];
        const stepX = Math.max(2, Math.floor(w / 30));
        const stepY = Math.max(2, Math.floor(h / 30));

        for (let x = 0; x < w; x += stepX) {
          const idxTop = (2 * w + x) * 4;
          borderSamples.push([data[idxTop], data[idxTop + 1], data[idxTop + 2]]);
        }
        for (let y = 0; y < Math.floor(h * 0.75); y += stepY) {
          const idxLeft = (y * w + 2) * 4;
          const idxRight = (y * w + (w - 3)) * 4;
          borderSamples.push([data[idxLeft], data[idxLeft + 1], data[idxLeft + 2]]);
          borderSamples.push([data[idxRight], data[idxRight + 1], data[idxRight + 2]]);
        }

        const colorDist = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
          const dr = r1 - r2;
          const dg = g1 - g2;
          const db = b1 - b2;
          return Math.sqrt(dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11);
        };

        const isSkinPixel = (r: number, g: number, b: number) => {
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
          const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
          return (
            r > 65 &&
            g > 40 &&
            b > 20 &&
            r > g &&
            r > b &&
            maxC - minC > 12 &&
            cr >= 130 &&
            cr <= 180 &&
            cb >= 75 &&
            cb <= 135
          );
        };

        onProgress('Membuang latar belakang…', 75);
        await new Promise((r) => setTimeout(r, 160));

        // 2. Flood-Fill dari tepi luar + Pelindung Subjek Tengah
        const alphaMap = new Float32Array(w * h);
        alphaMap.fill(1.0);

        const visited = new Uint8Array(w * h);
        const queue = new Int32Array(w * h);
        let qHead = 0;
        let qTail = 0;

        const pushPixel = (px: number, py: number) => {
          const idx = py * w + px;
          if (!visited[idx]) {
            visited[idx] = 1;
            queue[qTail++] = idx;
          }
        };

        for (let x = 0; x < w; x++) {
          pushPixel(x, 0);
        }
        for (let y = 0; y < Math.floor(h * 0.88); y++) {
          pushPixel(0, y);
          pushPixel(w - 1, y);
        }

        const threshold = sensitivity;
        const softMargin = 22;

        const minBorderDiff = (r: number, g: number, b: number) => {
          let best = 999;
          for (let i = 0; i < borderSamples.length; i += 2) {
            const s = borderSamples[i];
            const d = colorDist(r, g, b, s[0], s[1], s[2]);
            if (d < best) best = d;
            if (best < 8) break;
          }
          return best;
        };

        while (qHead < qTail) {
          const currIdx = queue[qHead++];
          const cx = currIdx % w;
          const cy = Math.floor(currIdx / w);
          const p4 = currIdx * 4;
          const r = data[p4];
          const g = data[p4 + 1];
          const b = data[p4 + 2];

          const normX = (cx - w * 0.5) / (w * 0.25);
          const normY = (cy - h * 0.45) / (h * 0.28);
          const inFaceCore = normX * normX + normY * normY < 0.85;
          if (inFaceCore && isSkinPixel(r, g, b)) {
            continue;
          }

          const diff = minBorderDiff(r, g, b);
          if (diff <= threshold + softMargin) {
            if (diff <= threshold) {
              alphaMap[currIdx] = 0.0;
            } else {
              alphaMap[currIdx] = (diff - threshold) / softMargin;
            }

            if (diff <= threshold + softMargin * 0.6) {
              if (cx > 0) pushPixel(cx - 1, cy);
              if (cx < w - 1) pushPixel(cx + 1, cy);
              if (cy > 0) pushPixel(cx, cy - 1);
              if (cy < h - 1) pushPixel(cx, cy + 1);
            }
          }
        }

        // 3. Pelembutan pinggir
        const smoothedAlpha = new Float32Array(w * h);
        const rad = Math.max(1, featherRadius);
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            let sum = 0;
            let count = 0;
            for (let dy = -rad; dy <= rad; dy++) {
              const ny = y + dy;
              if (ny < 0 || ny >= h) continue;
              for (let dx = -rad; dx <= rad; dx++) {
                const nx = x + dx;
                if (nx < 0 || nx >= w) continue;
                sum += alphaMap[ny * w + nx];
                count++;
              }
            }
            smoothedAlpha[y * w + x] = sum / count;
          }
        }

        // 4. Mengesan lokasi wajah dan landmark
        let skinSumX = 0;
        let skinSumY = 0;
        let skinCount = 0;
        let minSkinX = w;
        let maxSkinX = 0;
        let minSkinY = h;
        let maxSkinY = 0;

        for (let y = Math.floor(h * 0.08); y < Math.floor(h * 0.82); y++) {
          for (let x = Math.floor(w * 0.12); x < Math.floor(w * 0.88); x++) {
            const idx = y * w + x;
            const p4 = idx * 4;
            const r = data[p4];
            const g = data[p4 + 1];
            const b = data[p4 + 2];

            const origA = data[p4 + 3] / 255;
            data[p4 + 3] = Math.round(smoothedAlpha[idx] * origA * 255);

            if (smoothedAlpha[idx] > 0.45 && isSkinPixel(r, g, b)) {
              skinSumX += x;
              skinSumY += y;
              skinCount++;
              if (x < minSkinX) minSkinX = x;
              if (x > maxSkinX) maxSkinX = x;
              if (y < minSkinY) minSkinY = y;
              if (y > maxSkinY) maxSkinY = y;
            }
          }
        }

        for (let i = 0; i < w * h; i++) {
          const p4 = i * 4;
          const origA = data[p4 + 3] > 0 ? 1 : 0;
          if (origA > 0) {
            data[p4 + 3] = Math.round(smoothedAlpha[i] * 255);
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const processedDataUrl = canvas.toDataURL('image/png');

        const minRequiredSkinPixels = w * h * 0.012;
        const faceDetected = skinCount >= minRequiredSkinPixels;

        let faceCenterX = w * 0.5;
        let faceCenterY = h * 0.44;
        let faceWidth = w * 0.38;
        let faceHeight = h * 0.46;
        let headAngleDeg = 0;

        if (faceDetected) {
          faceCenterX = skinSumX / skinCount;
          faceCenterY = skinSumY / skinCount;
          const rawW = (maxSkinX - minSkinX) * 0.92;
          const rawH = (maxSkinY - minSkinY) * 0.88;
          faceWidth = Math.max(w * 0.2, Math.min(w * 0.68, rawW));
          faceHeight = Math.max(h * 0.24, Math.min(h * 0.72, rawH));
          if (faceHeight > faceWidth * 1.32) {
            faceHeight = faceWidth * 1.24;
            faceCenterY = minSkinY + faceHeight * 0.52;
          }

          const eyeBandTop = Math.max(0, Math.floor(faceCenterY - faceHeight * 0.24));
          const eyeBandBottom = Math.min(h - 1, Math.floor(faceCenterY + faceHeight * 0.04));
          const leftStart = Math.max(0, Math.floor(faceCenterX - faceWidth * 0.36));
          const leftEnd = Math.max(0, Math.floor(faceCenterX - faceWidth * 0.08));
          const rightStart = Math.min(w - 1, Math.floor(faceCenterX + faceWidth * 0.08));
          const rightEnd = Math.min(w - 1, Math.floor(faceCenterX + faceWidth * 0.36));

          let leftEyeY = faceCenterY - faceHeight * 0.08;
          let rightEyeY = faceCenterY - faceHeight * 0.08;
          let minLeftLum = 999;
          let minRightLum = 999;

          for (let y = eyeBandTop; y <= eyeBandBottom; y++) {
            for (let x = leftStart; x <= leftEnd; x++) {
              const p4 = (y * w + x) * 4;
              const lum = data[p4] * 0.299 + data[p4 + 1] * 0.587 + data[p4 + 2] * 0.114;
              if (lum < minLeftLum) {
                minLeftLum = lum;
                leftEyeY = y;
              }
            }
            for (let x = rightStart; x <= rightEnd; x++) {
              const p4 = (y * w + x) * 4;
              const lum = data[p4] * 0.299 + data[p4 + 1] * 0.587 + data[p4 + 2] * 0.114;
              if (lum < minRightLum) {
                minRightLum = lum;
                rightEyeY = y;
              }
            }
          }

          const eyeDx = faceWidth * 0.44;
          const eyeDy = rightEyeY - leftEyeY;
          const rawAngle = (Math.atan2(eyeDy, eyeDx) * 180) / Math.PI;
          if (Math.abs(rawAngle) <= 18) {
            headAngleDeg = Number((rawAngle * 0.5).toFixed(1));
          }
        }

        const landmarks: FaceLandmarks = {
          detected: faceDetected,
          imageWidth: w,
          imageHeight: h,
          centerX: faceCenterX / w,
          centerY: faceCenterY / h,
          width: faceWidth / w,
          height: faceHeight / h,
          leftEye: {
            x: (faceCenterX - faceWidth * 0.22) / w,
            y: (faceCenterY - faceHeight * 0.08) / h
          },
          rightEye: {
            x: (faceCenterX + faceWidth * 0.22) / w,
            y: (faceCenterY - faceHeight * 0.08) / h
          },
          nose: {
            x: faceCenterX / w,
            y: (faceCenterY + faceHeight * 0.06) / h
          },
          mouth: {
            x: faceCenterX / w,
            y: (faceCenterY + faceHeight * 0.23) / h
          },
          angleDeg: headAngleDeg
        };

        onProgress('Gambar berjaya diproses!', 100);
        resolve({
          transparentDataUrl: processedDataUrl,
          landmarks
        });
      } catch (err: unknown) {
        reject(err);
      }
    };
    img.onerror = () =>
      reject(new Error('Gagal memuatkan fail gambar. Sila pastikan format gambar ialah JPG, PNG atau WebP.'));
    img.src = imageSrc;
  });
}

/**
 * ============================================================================
 * MODUL FACE AUTO-FIT
 * ============================================================================
 */
function computeAutoFitTransform(landmarks: FaceLandmarks | null, avatar: AvatarItem | null): FitTransform {
  if (!landmarks || !avatar) {
    return {
      scale: 1.0,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      feather: 12,
      brightness: 100,
      maskType: avatar?.faceSlot?.maskType || 'oval'
    };
  }

  const autoRotation = Number(((avatar.faceSlot.baseAngle || 0) - (landmarks.angleDeg || 0)).toFixed(1));

  return {
    scale: 1.0,
    offsetX: 0,
    offsetY: 0,
    rotation: Math.max(-20, Math.min(20, autoRotation)),
    feather: avatar.faceSlot.feather || 12,
    brightness: 102,
    maskType: avatar.faceSlot.maskType || 'oval'
  };
}

/**
 * ============================================================================
 * MODUL AVATAR COMPOSITOR (UNTUK PRATONTON & CETAKAN RESOLUSI TINGGI)
 * ============================================================================
 */
function renderCompositeSceneToCanvas({
  canvas,
  avatar,
  colorIndex = 0,
  faceImageElement,
  landmarks,
  fitTransform,
  editorConfig,
  includeBackground = true
}: {
  canvas: HTMLCanvasElement | null;
  avatar: AvatarItem | null;
  colorIndex?: number;
  faceImageElement: HTMLImageElement | null;
  landmarks: FaceLandmarks | null;
  fitTransform: FitTransform;
  editorConfig: EditorConfig;
  includeBackground?: boolean;
}) {
  if (!canvas || !avatar) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  const palette = avatar.colors[colorIndex] || avatar.colors[0];
  const bgTheme = BACKGROUND_THEMES.find((b) => b.id === editorConfig.backgroundId) || BACKGROUND_THEMES[0];

  // 1. LUKIS LATAR BELAKANG
  if (includeBackground && bgTheme.type !== 'transparent') {
    ctx.save();
    if (bgTheme.type === 'solid' && bgTheme.color) {
      ctx.fillStyle = bgTheme.color;
      ctx.fillRect(0, 0, W, H);
    } else if (bgTheme.type === 'gradient' && bgTheme.colors) {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, bgTheme.colors[0]);
      grad.addColorStop(0.55, bgTheme.colors[1]);
      grad.addColorStop(1, bgTheme.colors[2]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (bgTheme.type === 'scene-studio') {
      const rad = ctx.createRadialGradient(W * 0.5, H * 0.42, W * 0.08, W * 0.5, H * 0.5, W * 0.75);
      rad.addColorStop(0, '#475569');
      rad.addColorStop(0.6, '#1E293B');
      rad.addColorStop(1, '#0F172A');
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(0, H * 0.78, W, H * 0.22);
    } else if (bgTheme.type === 'scene-space') {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#090D16');
      grad.addColorStop(0.5, '#1E1B4B');
      grad.addColorStop(1, '#311042');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 45; i++) {
        const sx = ((i * 197) % 97) * 0.01 * W;
        const sy = ((i * 311) % 89) * 0.01 * H;
        const sr = ((i % 3) + 1) * (W / 600);
        ctx.globalAlpha = 0.4 + (i % 5) * 0.12;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      const pGrad = ctx.createRadialGradient(W * 0.8, H * 0.18, W * 0.01, W * 0.82, H * 0.2, W * 0.09);
      pGrad.addColorStop(0, '#F472B6');
      pGrad.addColorStop(1, '#6D28D9');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(W * 0.82, H * 0.2, W * 0.075, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.55)';
      ctx.lineWidth = W * 0.012;
      ctx.beginPath();
      ctx.ellipse(W * 0.82, H * 0.2, W * 0.13, W * 0.03, -0.3, 0, Math.PI * 2);
      ctx.stroke();
    } else if (bgTheme.type === 'scene-school') {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#BAE6FD');
      grad.addColorStop(0.72, '#E0F2FE');
      grad.addColorStop(0.721, '#FDE68A');
      grad.addColorStop(1, '#F59E0B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#065F46';
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = W * 0.018;
      ctx.fillRect(W * 0.12, H * 0.1, W * 0.76, H * 0.34);
      ctx.strokeRect(W * 0.12, H * 0.1, W * 0.76, H * 0.34);
    } else if (bgTheme.type === 'scene-fantasy') {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#2E1065');
      grad.addColorStop(0.55, '#6D28D9');
      grad.addColorStop(1, '#BE185D');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 25; i++) {
        const gx = ((i * 263) % 92) * 0.01 * W;
        const gy = ((i * 179) % 85) * 0.01 * H;
        const glow = ctx.createRadialGradient(gx, gy, 1, gx, gy, W * 0.035);
        glow.addColorStop(0, 'rgba(253, 224, 71, 0.85)');
        glow.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(gx, gy, W * 0.035, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  const create3DShader = (x: number, y: number, r: number, baseHex: string, darkHex?: string) => {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.08, x, y, r * 1.15);
    g.addColorStop(0, '#FFFFFF');
    g.addColorStop(0.18, baseHex);
    g.addColorStop(0.82, baseHex);
    g.addColorStop(1, darkHex || '#0F172A');
    return g;
  };

  ctx.save();
  if (editorConfig.softShadow) {
    ctx.shadowColor = 'rgba(15, 23, 42, 0.35)';
    ctx.shadowBlur = W * 0.04;
    ctx.shadowOffsetY = H * 0.015;
  }

  // Tapak bayang lantai 3D
  ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
  ctx.beginPath();
  ctx.ellipse(W * 0.5, H * 0.84, W * 0.26, H * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. LAPISAN BELAKANG AVATAR
  if (avatar.hasCape) {
    const capeGrad = ctx.createLinearGradient(W * 0.25, H * 0.35, W * 0.75, H * 0.82);
    capeGrad.addColorStop(0, palette.secondary);
    capeGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = capeGrad;
    ctx.beginPath();
    ctx.moveTo(W * 0.34, H * 0.39);
    ctx.quadraticCurveTo(W * 0.18, H * 0.62, W * 0.22, H * 0.81);
    ctx.quadraticCurveTo(W * 0.5, H * 0.85, W * 0.78, H * 0.81);
    ctx.quadraticCurveTo(W * 0.82, H * 0.62, W * 0.66, H * 0.39);
    ctx.closePath();
    ctx.fill();
  }

  if (avatar.id === 'watak-fantasi') {
    ctx.fillStyle = 'rgba(186, 230, 253, 0.65)';
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = W * 0.006;
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.moveTo(W * 0.5, H * 0.45);
      ctx.bezierCurveTo(W * (0.5 + dir * 0.38), H * 0.25, W * (0.5 + dir * 0.44), H * 0.52, W * (0.5 + dir * 0.18), H * 0.62);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  }

  if (avatar.id === 'angkasawan-negara') {
    ctx.fillStyle = '#CBD5E1';
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = W * 0.006;
    ctx.beginPath();
    ctx.roundRect(W * 0.29, H * 0.34, W * 0.42, H * 0.26, W * 0.04);
    ctx.fill();
    ctx.stroke();
  }

  // 3. KAKI & KASUT 3D
  const legColor = avatar.id === 'puteri-bintang' ? palette.primary : palette.secondary;
  ctx.fillStyle = legColor;
  ctx.beginPath();
  ctx.roundRect(W * 0.37, H * 0.63, W * 0.1, H * 0.18, W * 0.04);
  ctx.roundRect(W * 0.53, H * 0.63, W * 0.1, H * 0.18, W * 0.04);
  ctx.fill();

  ctx.fillStyle = create3DShader(W * 0.41, H * 0.81, W * 0.08, palette.accent, '#1E293B');
  ctx.beginPath();
  ctx.ellipse(W * 0.41, H * 0.81, W * 0.075, H * 0.032, 0, 0, Math.PI * 2);
  ctx.ellipse(W * 0.59, H * 0.81, W * 0.075, H * 0.032, 0, 0, Math.PI * 2);
  ctx.fill();

  // 4. BADAN / PAKAIAN 3D
  const torsoGrad = ctx.createRadialGradient(W * 0.44, H * 0.46, W * 0.04, W * 0.5, H * 0.52, W * 0.26);
  torsoGrad.addColorStop(0, '#FFFFFF');
  torsoGrad.addColorStop(0.15, palette.primary);
  torsoGrad.addColorStop(0.85, palette.primary);
  torsoGrad.addColorStop(1, '#0F172A');

  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  if (avatar.id === 'puteri-bintang') {
    ctx.moveTo(W * 0.36, H * 0.39);
    ctx.lineTo(W * 0.64, H * 0.39);
    ctx.quadraticCurveTo(W * 0.78, H * 0.65, W * 0.74, H * 0.79);
    ctx.quadraticCurveTo(W * 0.5, H * 0.83, W * 0.26, H * 0.79);
    ctx.quadraticCurveTo(W * 0.22, H * 0.65, W * 0.36, H * 0.39);
  } else {
    ctx.roundRect(W * 0.32, H * 0.38, W * 0.36, H * 0.29, [W * 0.08, W * 0.08, W * 0.05, W * 0.05]);
  }
  ctx.fill();

  if (avatar.id === 'tradisional-melayu' || avatar.id === 'pahlawan-melayu') {
    ctx.fillStyle = palette.secondary;
    ctx.fillRect(W * 0.32, H * 0.55, W * 0.36, H * 0.14);
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = W * 0.008;
    ctx.strokeRect(W * 0.32, H * 0.55, W * 0.36, H * 0.14);
  }

  // Tali Pinggang 3D
  ctx.fillStyle = palette.secondary;
  ctx.fillRect(W * 0.32, H * 0.56, W * 0.36, H * 0.035);
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.roundRect(W * 0.45, H * 0.552, W * 0.1, H * 0.05, W * 0.015);
  ctx.fill();

  if (avatar.id === 'doktor-pakar' || avatar.id === 'saintis-makmal' || avatar.id === 'guru-inspirasi') {
    ctx.fillStyle = avatar.id === 'guru-inspirasi' ? palette.primary : '#F8FAFC';
    ctx.fillRect(W * 0.32, H * 0.39, W * 0.11, H * 0.27);
    ctx.fillRect(W * 0.57, H * 0.39, W * 0.11, H * 0.27);
    if (avatar.id === 'doktor-pakar') {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = W * 0.012;
      ctx.beginPath();
      ctx.arc(W * 0.5, H * 0.42, W * 0.09, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.arc(W * 0.56, H * 0.49, W * 0.022, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Lengan Kiri & Kanan 3D
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.roundRect(W * 0.21, H * 0.39, W * 0.11, H * 0.22, W * 0.055);
  ctx.roundRect(W * 0.68, H * 0.39, W * 0.11, H * 0.22, W * 0.055);
  ctx.fill();

  // Tangan Bulat 3D
  ctx.fillStyle = create3DShader(W * 0.26, H * 0.62, W * 0.055, '#FCD34D', '#D97706');
  ctx.beginPath();
  ctx.arc(W * 0.265, H * 0.62, W * 0.045, 0, Math.PI * 2);
  ctx.arc(W * 0.735, H * 0.62, W * 0.045, 0, Math.PI * 2);
  ctx.fill();

  // Lencana / Emblem Dada
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.arc(W * 0.5, H * 0.47, W * 0.048, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = W * 0.005;
  ctx.stroke();

  // 5. KEPALA ASAS AVATAR 3D & KOLAR LEHER
  const slot = avatar.faceSlot;
  const headCX = W * slot.centerX;
  const headCY = H * slot.centerY;
  const headRX = W * (slot.widthRatio * 0.62);
  const headRY = H * (slot.heightRatio * 0.62);

  // Leher 3D
  ctx.fillStyle = '#E2A77F';
  ctx.beginPath();
  ctx.roundRect(headCX - headRX * 0.38, headCY + headRY * 0.72, headRX * 0.76, headRY * 0.45, W * 0.02);
  ctx.fill();

  if (avatar.id === 'angkasawan-negara') {
    const helmGrad = ctx.createRadialGradient(headCX - headRX * 0.3, headCY - headRY * 0.3, headRX * 0.1, headCX, headCY, headRX * 1.45);
    helmGrad.addColorStop(0, '#FFFFFF');
    helmGrad.addColorStop(0.7, '#E2E8F0');
    helmGrad.addColorStop(1, '#64748B');
    ctx.fillStyle = helmGrad;
    ctx.beginPath();
    ctx.arc(headCX, headCY, headRX * 1.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(headCX, headCY, headRX * 1.12, 0, Math.PI * 2);
    ctx.fill();
  } else if (slot.maskType === 'hijab-friendly') {
    ctx.fillStyle = palette.secondary;
    ctx.beginPath();
    ctx.ellipse(headCX, headCY + headRY * 0.06, headRX * 1.28, headRY * 1.26, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#F1C29B';
    ctx.beginPath();
    ctx.ellipse(headCX - headRX * 1.02, headCY + headRY * 0.04, headRX * 0.18, headRY * 0.26, -0.1, 0, Math.PI * 2);
    ctx.ellipse(headCX + headRX * 1.02, headCY + headRY * 0.04, headRX * 0.18, headRY * 0.26, 0.1, 0, Math.PI * 2);
    ctx.fill();

    const headBaseGrad = ctx.createRadialGradient(headCX - headRX * 0.25, headCY - headRY * 0.25, headRX * 0.1, headCX, headCY, headRX * 1.15);
    headBaseGrad.addColorStop(0, '#FFE4CE');
    headBaseGrad.addColorStop(0.75, '#F1C29B');
    headBaseGrad.addColorStop(1, '#C98A63');
    ctx.fillStyle = headBaseGrad;
    ctx.beginPath();
    ctx.ellipse(headCX, headCY, headRX * 1.05, headRY * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. LUKIS WAJAH PENGGUNA (AUTO-FIT + TOPENG POTONGAN)
  if (faceImageElement) {
    ctx.save();

    const maskRX = headRX * 0.98;
    const maskRY = headRY * 0.98;
    const activeMask = fitTransform?.maskType || slot.maskType || 'oval';

    ctx.beginPath();
    if (activeMask === 'helmet-circle') {
      ctx.arc(headCX, headCY, Math.min(maskRX, maskRY) * 1.02, 0, Math.PI * 2);
    } else if (activeMask === 'rounded-shield' || activeMask === 'helmet-visor') {
      ctx.roundRect(headCX - maskRX, headCY - maskRY * 0.95, maskRX * 2, maskRY * 1.9, maskRX * 0.65);
    } else {
      ctx.ellipse(headCX, headCY, maskRX, maskRY, 0, 0, Math.PI * 2);
    }
    ctx.clip();

    const lm = landmarks || {
      detected: true,
      imageWidth: 600,
      imageHeight: 600,
      centerX: 0.5,
      centerY: 0.45,
      width: 0.38,
      height: 0.46,
      leftEye: { x: 0.4, y: 0.4 },
      rightEye: { x: 0.6, y: 0.4 },
      nose: { x: 0.5, y: 0.48 },
      mouth: { x: 0.5, y: 0.56 },
      angleDeg: 0
    };

    const userScale = fitTransform?.scale ?? 1.0;
    const userOffsetX = (fitTransform?.offsetX ?? 0) * (W / 500);
    const userOffsetY = (fitTransform?.offsetY ?? 0) * (H / 500);
    const userRotRad = ((fitTransform?.rotation ?? 0) * Math.PI) / 180;

    const srcW = faceImageElement.naturalWidth || faceImageElement.width || 600;
    const srcH = faceImageElement.naturalHeight || faceImageElement.height || 600;
    const detectedFacePxW = srcW * (lm.width || 0.38);
    const targetSlotPxW = maskRX * 2.08;
    const baseScale = (targetSlotPxW / Math.max(40, detectedFacePxW)) * userScale;

    const drawW = srcW * baseScale;
    const drawH = srcH * baseScale;

    const faceOriginX = lm.centerX * drawW;
    const faceOriginY = lm.centerY * drawH;

    ctx.translate(headCX + userOffsetX, headCY + userOffsetY);
    ctx.rotate(userRotRad);

    if (fitTransform?.brightness && fitTransform.brightness !== 100) {
      ctx.filter = `brightness(${fitTransform.brightness}%) contrast(103%)`;
    }

    ctx.drawImage(faceImageElement, -faceOriginX, -faceOriginY, drawW, drawH);
    ctx.filter = 'none';

    const featherStrength = Math.max(0, Math.min(1, (fitTransform?.feather ?? 12) / 25));
    if (featherStrength > 0) {
      const innerGrad = ctx.createRadialGradient(0, 0, maskRX * (0.95 - featherStrength * 0.35), 0, 0, maskRX * 1.04);
      innerGrad.addColorStop(0, 'rgba(241, 194, 155, 0)');
      innerGrad.addColorStop(0.8, 'rgba(241, 194, 155, 0.12)');
      innerGrad.addColorStop(1, avatar.id === 'angkasawan-negara' ? 'rgba(30, 41, 59, 0.65)' : 'rgba(217, 155, 114, 0.55)');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.translate(headCX, headCY);
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, maskRX * 1.08, maskRY * 1.08, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 7. LAPISAN AKSESORI HADAPAN
  ctx.save();
  const acc = avatar.accessoryType;

  if (acc === 'royal-crown-male' || acc === 'princess-tiara' || acc === 'fantasy-circlet') {
    const crownY = headCY - headRY * 0.82;
    const crownGrad = ctx.createLinearGradient(headCX - headRX, crownY - headRY * 0.5, headCX + headRX, crownY);
    crownGrad.addColorStop(0, '#FDE047');
    crownGrad.addColorStop(0.5, '#F59E0B');
    crownGrad.addColorStop(1, '#B45309');
    ctx.fillStyle = crownGrad;
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = W * 0.005;

    ctx.beginPath();
    ctx.moveTo(headCX - headRX * 0.85, crownY + headRY * 0.12);
    ctx.lineTo(headCX - headRX * 0.65, crownY - headRY * 0.42);
    ctx.lineTo(headCX - headRX * 0.32, crownY - headRY * 0.12);
    ctx.lineTo(headCX, crownY - headRY * 0.58);
    ctx.lineTo(headCX + headRX * 0.32, crownY - headRY * 0.12);
    ctx.lineTo(headCX + headRX * 0.65, crownY - headRY * 0.42);
    ctx.lineTo(headCX + headRX * 0.85, crownY + headRY * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = palette.primary;
    ctx.beginPath();
    ctx.arc(headCX, crownY - headRY * 0.18, headRX * 0.14, 0, Math.PI * 2);
    ctx.fill();
  } else if (acc === 'astronaut-helmet') {
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = W * 0.014;
    ctx.beginPath();
    ctx.arc(headCX, headCY, headRX * 1.12, 0, Math.PI * 2);
    ctx.stroke();

    const glassGrad = ctx.createLinearGradient(headCX - headRX, headCY - headRY, headCX + headRX * 0.2, headCY);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.38)');
    glassGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.05)');
    glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    ctx.arc(headCX, headCY, headRX * 1.06, Math.PI * 0.95, Math.PI * 1.65);
    ctx.closePath();
    ctx.fill();
  } else if (acc === 'firefighter-helmet' || acc === 'police-cap' || acc === 'pilot-cap' || acc === 'explorer-hat') {
    const hatTopY = headCY - headRY * 0.78;
    ctx.fillStyle = acc === 'explorer-hat' ? '#92400E' : palette.primary;
    ctx.beginPath();
    ctx.ellipse(headCX, hatTopY, headRX * 1.15, headRY * 0.48, 0, Math.PI, 0, false);
    ctx.fill();

    ctx.fillStyle = acc === 'firefighter-helmet' ? palette.accent : '#0F172A';
    ctx.beginPath();
    ctx.ellipse(headCX, hatTopY + headRY * 0.02, headRX * 1.28, headRY * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(headCX, hatTopY - headRY * 0.18, headRX * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (acc === 'songkok-tengkolok' || acc === 'tanjak-pahlawan') {
    const tanjakY = headCY - headRY * 0.78;
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = W * 0.008;
    ctx.beginPath();
    if (acc === 'tanjak-pahlawan') {
      ctx.moveTo(headCX - headRX * 1.05, tanjakY + headRY * 0.1);
      ctx.lineTo(headCX - headRX * 0.85, tanjakY - headRY * 0.45);
      ctx.lineTo(headCX + headRX * 0.25, tanjakY - headRY * 0.2);
      ctx.lineTo(headCX + headRX * 0.95, tanjakY - headRY * 0.62);
      ctx.lineTo(headCX + headRX * 1.05, tanjakY + headRY * 0.1);
    } else {
      ctx.roundRect(headCX - headRX * 0.95, tanjakY - headRY * 0.38, headRX * 1.9, headRY * 0.48, W * 0.02);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(headCX, tanjakY - headRY * 0.14, headRX * 0.14, 0, Math.PI * 2);
    ctx.fill();
  } else if (acc === 'scientist-goggles' || acc === 'cyber-headset') {
    const gogY = headCY - headRY * 0.82;
    ctx.strokeStyle = palette.accent;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
    ctx.lineWidth = W * 0.01;
    ctx.beginPath();
    ctx.roundRect(headCX - headRX * 0.82, gogY - headRY * 0.16, headRX * 0.74, headRY * 0.32, W * 0.025);
    ctx.roundRect(headCX + headRX * 0.08, gogY - headRY * 0.16, headRX * 0.74, headRY * 0.32, W * 0.025);
    ctx.fill();
    ctx.stroke();
  } else if (acc === 'music-headphones') {
    ctx.strokeStyle = palette.primary;
    ctx.lineWidth = W * 0.022;
    ctx.beginPath();
    ctx.arc(headCX, headCY, headRX * 1.12, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.ellipse(headCX - headRX * 1.12, headCY + headRY * 0.05, headRX * 0.22, headRY * 0.34, 0, 0, Math.PI * 2);
    ctx.ellipse(headCX + headRX * 1.12, headCY + headRY * 0.05, headRX * 0.22, headRY * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (acc === 'superhero-cowl' || acc === 'sport-headband' || acc === 'athlete-visor') {
    const bandY = headCY - headRY * 0.78;
    ctx.fillStyle = palette.primary;
    ctx.beginPath();
    ctx.roundRect(headCX - headRX * 0.98, bandY - headRY * 0.14, headRX * 1.96, headRY * 0.28, W * 0.025);
    ctx.fill();
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.arc(headCX, bandY, headRX * 0.13, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
  ctx.restore();

  // 8. LUKIS BINGKAI GAMBAR (FRAME)
  if (editorConfig.frameId && editorConfig.frameId !== 'none') {
    ctx.save();
    const fId = editorConfig.frameId;
    if (fId === 'gold-star') {
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = W * 0.032;
      ctx.strokeRect(W * 0.02, H * 0.02, W * 0.96, H * 0.96);
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = W * 0.008;
      ctx.strokeRect(W * 0.038, H * 0.038, W * 0.924, H * 0.924);
    } else if (fId === 'school-badge') {
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = W * 0.035;
      ctx.strokeRect(W * 0.018, H * 0.018, W * 0.964, H * 0.964);
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(W * 0.15, H * 0.015, W * 0.7, H * 0.045);
      ctx.fillStyle = '#1E3A8A';
      ctx.font = `800 ${Math.round(W * 0.028)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('AVATARKU 3D STUDIO • KENANGAN SEKOLAH', W * 0.5, H * 0.046);
    } else if (fId === 'cyber-neon') {
      ctx.strokeStyle = '#38BDF8';
      ctx.shadowColor = '#0284C7';
      ctx.shadowBlur = W * 0.03;
      ctx.lineWidth = W * 0.022;
      ctx.strokeRect(W * 0.03, H * 0.03, W * 0.94, H * 0.94);
    } else if (fId === 'royal-songket') {
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = W * 0.04;
      ctx.strokeRect(W * 0.02, H * 0.02, W * 0.96, H * 0.96);
      ctx.strokeStyle = '#FEF3C7';
      ctx.setLineDash([W * 0.02, W * 0.015]);
      ctx.lineWidth = W * 0.008;
      ctx.strokeRect(W * 0.035, H * 0.035, W * 0.93, H * 0.93);
    } else if (fId === 'polaroid') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, W, H * 0.05);
      ctx.fillRect(0, H * 0.85, W, H * 0.15);
      ctx.fillRect(0, 0, W * 0.05, H);
      ctx.fillRect(W * 0.95, 0, W * 0.05, H);
    }
    ctx.restore();
  }

  // 9. LUKIS NAMA PENGGUNA & SLOGAN TEKS
  const hasUserName = Boolean(editorConfig.userName && editorConfig.userName.trim().length > 0);
  const hasSlogan = Boolean(editorConfig.customText && editorConfig.customText.trim().length > 0);

  if (hasUserName || hasSlogan) {
    ctx.save();
    const isTop = editorConfig.textPosition === 'top';
    const bannerY = isTop ? H * 0.11 : H * 0.89;
    const scaleMult = editorConfig.textSize === 'large' ? 1.2 : editorConfig.textSize === 'small' ? 0.85 : 1.0;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.strokeStyle = editorConfig.textColor || '#FACC15';
    ctx.lineWidth = W * 0.006;
    const boxW = W * 0.78;
    const boxH = hasUserName && hasSlogan ? H * 0.105 : H * 0.068;
    ctx.beginPath();
    ctx.roundRect(W * 0.5 - boxW * 0.5, bannerY - boxH * 0.5, boxW, boxH, W * 0.03);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (hasUserName && hasSlogan) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `800 ${Math.round(W * 0.044 * scaleMult)}px sans-serif`;
      ctx.fillText(editorConfig.userName.trim().toUpperCase(), W * 0.5, bannerY - boxH * 0.18);

      ctx.fillStyle = editorConfig.textColor || '#FACC15';
      ctx.font = `700 ${Math.round(W * 0.034 * scaleMult)}px sans-serif`;
      ctx.fillText(editorConfig.customText.trim(), W * 0.5, bannerY + boxH * 0.22);
    } else {
      const singleText = hasUserName ? editorConfig.userName.trim().toUpperCase() : editorConfig.customText.trim();
      ctx.fillStyle = editorConfig.textColor || '#FACC15';
      ctx.font = `800 ${Math.round(W * 0.045 * scaleMult)}px sans-serif`;
      ctx.fillText(singleText, W * 0.5, bannerY);
    }
    ctx.restore();
  }
}

/**
 * ============================================================================
 * MODUL AVATAR VIEWER 3D (THREE.JS INTERAKTIF)
 * ============================================================================
 */
interface InteractiveThreeAvatarProps {
  avatar: AvatarItem;
  colorIndex: number;
  faceImageElement: HTMLImageElement | null;
  landmarks: FaceLandmarks | null;
  fitTransform: FitTransform;
}

function InteractiveThreeAvatar({
  avatar,
  colorIndex,
  faceImageElement,
  landmarks,
  fitTransform
}: InteractiveThreeAvatarProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [threeError, setThreeError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current || !avatar) return;

    const container = mountRef.current;
    const width = container.clientWidth || 420;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.35, 5.2);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
    } catch {
      setThreeError('WebGL tidak disokong pada pelayar ini.');
      return;
    }

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.78);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.55);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    const characterGroup = new THREE.Group();
    scene.add(characterGroup);

    const palette = avatar.colors[colorIndex] || avatar.colors[0];
    const primaryMat = new THREE.MeshStandardMaterial({
      color: palette.primary,
      roughness: 0.35,
      metalness: 0.15
    });
    const secondaryMat = new THREE.MeshStandardMaterial({
      color: palette.secondary,
      roughness: 0.4,
      metalness: 0.1
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: palette.accent,
      roughness: 0.25,
      metalness: 0.55
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xf1c29b,
      roughness: 0.55,
      metalness: 0.05
    });

    // Tekstur wajah pengguna untuk permukaan kepala 3D
    const faceTexCanvas = document.createElement('canvas');
    faceTexCanvas.width = 512;
    faceTexCanvas.height = 512;
    const fCtx = faceTexCanvas.getContext('2d');
    if (fCtx) {
      fCtx.fillStyle = '#F1C29B';
      fCtx.fillRect(0, 0, 512, 512);

      if (faceImageElement) {
        const lm = landmarks || {
          detected: true,
          imageWidth: 600,
          imageHeight: 600,
          centerX: 0.5,
          centerY: 0.45,
          width: 0.38,
          height: 0.46,
          leftEye: { x: 0.4, y: 0.4 },
          rightEye: { x: 0.6, y: 0.4 },
          nose: { x: 0.5, y: 0.48 },
          mouth: { x: 0.5, y: 0.56 },
          angleDeg: 0
        };
        const srcW = faceImageElement.naturalWidth || faceImageElement.width || 600;
        const srcH = faceImageElement.naturalHeight || faceImageElement.height || 600;
        const userScale = fitTransform?.scale ?? 1.0;
        const detectedFacePxW = srcW * (lm.width || 0.38);
        const scale = (320 / Math.max(40, detectedFacePxW)) * userScale;
        const drawW = srcW * scale;
        const drawH = srcH * scale;

        fCtx.save();
        fCtx.beginPath();
        fCtx.arc(256, 256, 210, 0, Math.PI * 2);
        fCtx.clip();
        fCtx.translate(256 + (fitTransform?.offsetX || 0) * 1.5, 256 + (fitTransform?.offsetY || 0) * 1.5);
        fCtx.rotate(((fitTransform?.rotation || 0) * Math.PI) / 180);
        fCtx.drawImage(faceImageElement, -lm.centerX * drawW, -lm.centerY * drawH, drawW, drawH);
        fCtx.restore();
      }
    }

    const faceTexture = new THREE.CanvasTexture(faceTexCanvas);
    const faceMat = new THREE.MeshStandardMaterial({
      map: faceTexture,
      roughness: 0.45,
      metalness: 0.05
    });

    // 1. Kepala 3D
    const headGeo = new THREE.SphereGeometry(0.68, 32, 32);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.set(0, 1.08, 0);
    characterGroup.add(headMesh);

    const facePlaneGeo = new THREE.SphereGeometry(0.692, 32, 32, -Math.PI * 0.35, Math.PI * 0.7, Math.PI * 0.22, Math.PI * 0.56);
    const facePlaneMesh = new THREE.Mesh(facePlaneGeo, faceMat);
    facePlaneMesh.position.set(0, 1.08, 0);
    facePlaneMesh.rotation.y = -Math.PI * 0.5;
    characterGroup.add(facePlaneMesh);

    // 2. Badan / Torso 3D
    const torsoGeo =
      avatar.id === 'puteri-bintang'
        ? new THREE.ConeGeometry(0.88, 1.45, 32)
        : new THREE.CylinderGeometry(0.52, 0.58, 1.25, 28);
    const torsoMesh = new THREE.Mesh(torsoGeo, primaryMat);
    torsoMesh.position.set(0, 0.0, 0);
    characterGroup.add(torsoMesh);

    // Lencana Dada 3D
    const badgeGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 24);
    const badgeMesh = new THREE.Mesh(badgeGeo, accentMat);
    badgeMesh.rotation.x = Math.PI * 0.5;
    badgeMesh.position.set(0, 0.22, 0.54);
    characterGroup.add(badgeMesh);

    // 3. Lengan & Tangan 3D
    [-1, 1].forEach((dir) => {
      const armGeo = new THREE.CylinderGeometry(0.16, 0.14, 0.85, 20);
      const armMesh = new THREE.Mesh(armGeo, primaryMat);
      armMesh.position.set(dir * 0.72, 0.08, 0);
      armMesh.rotation.z = dir * 0.28;
      characterGroup.add(armMesh);

      const handGeo = new THREE.SphereGeometry(0.17, 20, 20);
      const handMesh = new THREE.Mesh(handGeo, skinMat);
      handMesh.position.set(dir * 0.84, -0.34, 0.05);
      characterGroup.add(handMesh);

      const legGeo = new THREE.CylinderGeometry(0.19, 0.16, 0.75, 20);
      const legMesh = new THREE.Mesh(legGeo, secondaryMat);
      legMesh.position.set(dir * 0.26, -0.92, 0);
      characterGroup.add(legMesh);

      const bootGeo = new THREE.SphereGeometry(0.22, 20, 16);
      const bootMesh = new THREE.Mesh(bootGeo, accentMat);
      bootMesh.scale.set(1, 0.65, 1.35);
      bootMesh.position.set(dir * 0.26, -1.28, 0.08);
      characterGroup.add(bootMesh);
    });

    // 4. Aksesori Kepala 3D
    if (avatar.accessoryType === 'astronaut-helmet') {
      const domeGeo = new THREE.SphereGeometry(0.84, 32, 32);
      const domeMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.28,
        roughness: 0.1
      });
      const domeMesh = new THREE.Mesh(domeGeo, domeMat);
      domeMesh.position.set(0, 1.08, 0);
      characterGroup.add(domeMesh);
    } else if (
      avatar.accessoryType === 'royal-crown-male' ||
      avatar.accessoryType === 'princess-tiara' ||
      avatar.accessoryType === 'fantasy-circlet'
    ) {
      const crownGeo = new THREE.CylinderGeometry(0.52, 0.44, 0.32, 12, 1, true);
      const crownMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        metalness: 0.7,
        roughness: 0.2,
        side: THREE.DoubleSide
      });
      const crownMesh = new THREE.Mesh(crownGeo, crownMat);
      crownMesh.position.set(0, 1.72, 0);
      characterGroup.add(crownMesh);
    } else {
      const capGeo = new THREE.CylinderGeometry(0.58, 0.64, 0.34, 24);
      const capMesh = new THREE.Mesh(capGeo, secondaryMat);
      capMesh.position.set(0, 1.65, 0);
      characterGroup.add(capMesh);
    }

    // Tapak Berdiri Bulat 3D
    const pedestalGeo = new THREE.CylinderGeometry(1.15, 1.28, 0.16, 36);
    const pedestalMesh = new THREE.Mesh(pedestalGeo, secondaryMat);
    pedestalMesh.position.set(0, -1.42, 0);
    characterGroup.add(pedestalMesh);

    // Kawalan Putaran Tetikus & Sentuhan
    let isDragging = false;
    let prevX = 0;
    let targetRotY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      if ('touches' in e && e.touches[0]) {
        prevX = e.touches[0].clientX;
      } else if ('clientX' in e) {
        prevX = e.clientX;
      }
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      let clientX = prevX;
      if ('touches' in e && e.touches[0]) {
        clientX = e.touches[0].clientX;
      } else if ('clientX' in e) {
        clientX = e.clientX;
      }
      const deltaX = clientX - prevX;
      targetRotY += deltaX * 0.012;
      prevX = clientX;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domElem.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    let animFrameId: number;
    let clock = 0;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      clock += 0.025;
      if (!isDragging) {
        targetRotY = Math.sin(clock * 0.6) * 0.28;
      }
      characterGroup.rotation.y += (targetRotY - characterGroup.rotation.y) * 0.1;
      characterGroup.position.y = Math.sin(clock * 1.4) * 0.04;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      domElem.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domElem.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      renderer.dispose();
    };
  }, [avatar, colorIndex, faceImageElement, landmarks, fitTransform]);

  if (threeError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-900/90 text-white rounded-2xl">
        <AlertTriangle className="w-10 h-10 text-yellow-400 mb-2" />
        <p className="text-sm font-medium">{threeError}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div
        ref={mountRef}
        className="w-full h-[420px] sm:h-[480px] cursor-grab active:cursor-grabbing flex items-center justify-center"
      />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/75 backdrop-blur-md text-white text-xs px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-white/15 pointer-events-none">
        <Box className="w-3.5 h-3.5 text-yellow-400" />
        <span>Seret ke kiri atau kanan untuk memusingkan Avatar 3D</span>
      </div>
    </div>
  );
}

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);

  const [showShareModal, setShowShareModal] = useState(false);
  const [studentAccessUrl, setStudentAccessUrl] = useState(() => {
    try {
      const href = window.location.href;
      if (href && href.startsWith('http') && !href.includes('about:blank')) {
        return href;
      }
    } catch {
      // Abaikan jika disekat oleh iframe
    }
    return 'https://avatarku-3d-studio.netlify.app';
  });
  const [classCode, setClassCode] = useState('KELAS-3D-2026');
  const [schoolName, setSchoolName] = useState('Makmal Komputer Sekolah');
  const [isKioskMode, setIsKioskMode] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // State Modul Kamera & Gambar Sumber
  const [cameraActive, setCameraActive] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [mirrorCam, setMirrorCam] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [cameraError, setCameraError] = useState('');
  const [rawPhotoUrl, setRawPhotoUrl] = useState('');

  // State Modul Penyingkiran Latar Belakang & Pengesanan Wajah
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [processStatusText, setProcessStatusText] = useState('');
  const [processProgress, setProcessProgress] = useState(0);
  const [bgSensitivity, setBgSensitivity] = useState(42);
  const [bgFeather, setBgFeather] = useState(2);
  const [transparentPhotoUrl, setTransparentPhotoUrl] = useState('');
  const [faceLandmarks, setFaceLandmarks] = useState<FaceLandmarks | null>(null);
  const [processError, setProcessError] = useState('');
  const [manualFaceMode, setManualFaceMode] = useState(false);

  // Elemen Imej HTML yang telah dimuatkan untuk kompositor Canvas
  const [faceImageElem, setFaceImageElem] = useState<HTMLImageElement | null>(null);

  // State Modul Galeri Avatar 3D & Auto-Fit
  const [selectedAvatarId, setSelectedAvatarId] = useState(AVATAR_CATALOG[0].id);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [genderFilter, setGenderFilter] = useState('Semua');
  const [renderMode, setRenderMode] = useState<'print' | '3d'>('print');
  const [fitTransform, setFitTransform] = useState<FitTransform>({
    scale: 1.0,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    feather: 12,
    brightness: 102,
    maskType: 'hero-jaw'
  });

  // State Modul Editor & Cetakan
  const [editorConfig, setEditorConfig] = useState<EditorConfig>({
    backgroundId: 'biru',
    frameId: 'gold-star',
    softShadow: true,
    userName: '',
    customText: 'Saya Hebat!',
    textSize: 'medium',
    textColor: '#FACC15',
    textPosition: 'bottom'
  });

  // State Tetapan Cetakan (4R / A4)
  const [printFormat, setPrintFormat] = useState<'4R' | 'A4'>('4R');
  const [printOrientation, setPrintOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [a4Copies, setA4Copies] = useState(1);
  const [finalCompositeUrl, setFinalCompositeUrl] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const selectedAvatar = useMemo(
    () => AVATAR_CATALOG.find((a) => a.id === selectedAvatarId) || AVATAR_CATALOG[0],
    [selectedAvatarId]
  );

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCountdown(0);
  }, []);

  useEffect(() => {
    if (currentStep !== 1) {
      stopCameraStream();
    }
  }, [currentStep, stopCameraStream]);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  const startCamera = async (deviceIdToUse = selectedDeviceId) => {
    setCameraError('');
    stopCameraStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Pelayar web anda tidak menyokong akses kamera secara langsung. Sila gunakan butang "Muat Naik Gambar" atau "Cuba Gambar Contoh" di bawah.'
      );
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 960 },
          facingMode: 'user',
          ...(deviceIdToUse ? { deviceId: { exact: deviceIdToUse } } : {})
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter((d) => d.kind === 'videoinput');
      setVideoDevices(cams);
      if (!deviceIdToUse && cams.length > 0) {
        const currentTrack = stream.getVideoTracks()[0];
        const settings = currentTrack?.getSettings?.();
        if (settings?.deviceId) {
          setSelectedDeviceId(settings.deviceId);
        }
      }
    } catch {
      setCameraActive(false);
      setCameraError(
        'Akses kamera tidak dibenarkan atau tiada kamera ditemui. Sila benarkan kebenaran kamera pada bar alamat pelayar, atau gunakan fungsi "Muat Naik Gambar" / "Gambar Contoh".'
      );
    }
  };

  const captureFromWebcam = useCallback(() => {
    if (!videoRef.current || !cameraActive) return;
    const video = videoRef.current;
    const vw = video.videoWidth || 720;
    const vh = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (mirrorCam) {
      ctx.translate(vw, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, vw, vh);

    const dataUrl = canvas.toDataURL('image/png');
    setRawPhotoUrl(dataUrl);
    stopCameraStream();
    showToast('Gambar berjaya diambil! Sila semak pratonton.', 'success');
  }, [cameraActive, mirrorCam, stopCameraStream, showToast]);

  const handleTriggerCapture = () => {
    if (!cameraActive) return;
    if (timerSeconds > 0) {
      setCountdown(timerSeconds);
      let remaining = timerSeconds;
      const interval = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          captureFromWebcam();
        }
      }, 1000);
    } else {
      captureFromWebcam();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Format fail tidak disokong. Sila pilih gambar JPG, PNG atau WebP.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        stopCameraStream();
        setRawPhotoUrl(reader.result);
        showToast('Gambar daripada komputer berjaya dimuat naik!', 'success');
      }
    };
    reader.onerror = () => {
      showToast('Gagal membaca fail gambar.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSamplePhoto = (variant: number) => {
    stopCameraStream();
    const sampleUrl = generateSamplePortraitDataUrl(variant);
    setRawPhotoUrl(sampleUrl);
    showToast(`Gambar contoh #${variant} sedia digunakan!`, 'success');
  };

  const runBackgroundAndFacePipeline = useCallback(
    async (sourceUrl: string, sens = bgSensitivity, feath = bgFeather) => {
      if (!sourceUrl) return;
      setIsProcessingBg(true);
      setProcessError('');
      setProcessProgress(5);
      setProcessStatusText('Sedang memproses gambar…');

      try {
        const result = await processBackgroundRemovalAndFaceDetection(
          sourceUrl,
          sens,
          feath,
          (statusMsg, pct) => {
            setProcessStatusText(statusMsg);
            setProcessProgress(pct);
          }
        );

        setTransparentPhotoUrl(result.transparentDataUrl);
        setFaceLandmarks(result.landmarks);

        const img = new Image();
        img.onload = () => {
          setFaceImageElem(img);
        };
        img.src = result.transparentDataUrl;

        const autoFit = computeAutoFitTransform(result.landmarks, selectedAvatar);
        setFitTransform(autoFit);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal memproses penyingkiran latar belakang.';
        setProcessError(msg);
      } finally {
        setIsProcessingBg(false);
      }
    },
    [bgSensitivity, bgFeather, selectedAvatar]
  );

  const handleSelectAvatar = (avatar: AvatarItem) => {
    setSelectedAvatarId(avatar.id);
    setSelectedColorIdx(0);
    if (faceLandmarks) {
      const newAutoFit = computeAutoFitTransform(faceLandmarks, avatar);
      setFitTransform(newAutoFit);
    }
  };

  useEffect(() => {
    if (!previewCanvasRef.current || !selectedAvatar) return;
    renderCompositeSceneToCanvas({
      canvas: previewCanvasRef.current,
      avatar: selectedAvatar,
      colorIndex: selectedColorIdx,
      faceImageElement: faceImageElem,
      landmarks: faceLandmarks,
      fitTransform,
      editorConfig,
      includeBackground: true
    });
    setFinalCompositeUrl(previewCanvasRef.current.toDataURL('image/png'));
  }, [selectedAvatar, selectedColorIdx, faceImageElem, faceLandmarks, fitTransform, editorConfig, currentStep, renderMode]);

  const handleDownloadHighResPNG = () => {
    if (!selectedAvatar) return;
    try {
      const exportCanvas = document.createElement('canvas');
      const isLandscape = printFormat === '4R' && printOrientation === 'landscape';
      exportCanvas.width = isLandscape ? 1800 : 1200;
      exportCanvas.height = isLandscape ? 1200 : 1800;

      renderCompositeSceneToCanvas({
        canvas: exportCanvas,
        avatar: selectedAvatar,
        colorIndex: selectedColorIdx,
        faceImageElement: faceImageElem,
        landmarks: faceLandmarks,
        fitTransform,
        editorConfig,
        includeBackground: editorConfig.backgroundId !== 'telus'
      });

      const dataUrl = exportCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      const cleanName = (editorConfig.userName || selectedAvatar.name).replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `AvatarKu_3D_${cleanName}_HD.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Fail PNG Resolusi Tinggi (1200×1800px) berjaya dimuat turun!', 'success');
    } catch {
      showToast('Ralat semasa mengeksport gambar PNG.', 'error');
    }
  };

  const handlePrintNow = (targetFormat: '4R' | 'A4' = printFormat) => {
    setPrintFormat(targetFormat);
    setTimeout(() => {
      window.print();
    }, 180);
  };

  const handleClearAllSessionData = () => {
    stopCameraStream();
    setRawPhotoUrl('');
    setTransparentPhotoUrl('');
    setFaceImageElem(null);
    setFaceLandmarks(null);
    setFinalCompositeUrl('');
    setEditorConfig((prev) => ({ ...prev, userName: '', customText: 'Saya Hebat!' }));
    setCurrentStep(0);
    showToast('Semua gambar dan data sementara sesi telah dipadamkan sepenuhnya.', 'success');
  };

  // Lukis Poster Kod QR & Kad Akses Pelajar pada Kanvas
  useEffect(() => {
    if (!showShareModal || !qrCanvasRef.current) return;
    const canvas = qrCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#1E3A8A');
    bgGrad.addColorStop(0.5, '#3730A3');
    bgGrad.addColorStop(1, '#581C87');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, W - 32, H - 32);

    ctx.fillStyle = '#FACC15';
    ctx.font = '800 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((schoolName || 'MAKMAL KOMPUTER SEKOLAH').toUpperCase(), W / 2, 52);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 30px sans-serif';
    ctx.fillText('AVATARKU 3D STUDIO', W / 2, 90);

    ctx.fillStyle = '#BFDBFE';
    ctx.font = '700 15px sans-serif';
    ctx.fillText('“Ambil Gambar, Jadi Avatar, Cetak Kenangan!”', W / 2, 116);

    const qrBoxSize = 220;
    const qrX = (W - qrBoxSize) / 2;
    const qrY = 136;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(qrX, qrY, qrBoxSize, qrBoxSize, 18);
    ctx.fill();

    const cells = 21;
    const margin = 18;
    const cellSize = (qrBoxSize - margin * 2) / cells;
    const urlStr = studentAccessUrl || 'https://avatarku.studio';
    let hash = 2166136261;
    for (let i = 0; i < urlStr.length; i++) {
      hash ^= urlStr.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    const isFinderPattern = (r: number, c: number) => {
      const inTL = r < 7 && c < 7;
      const inTR = r < 7 && c >= cells - 7;
      const inBL = r >= cells - 7 && c < 7;
      return inTL || inTR || inBL;
    };

    const drawFinder = (startR: number, startC: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          if (isBorder || isInner) {
            ctx.fillStyle = '#0F172A';
            ctx.fillRect(
              qrX + margin + (startC + c) * cellSize,
              qrY + margin + (startR + r) * cellSize,
              cellSize + 0.4,
              cellSize + 0.4
            );
          }
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(0, cells - 7);
    drawFinder(cells - 7, 0);

    ctx.fillStyle = '#0F172A';
    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        if (isFinderPattern(r, c)) continue;
        if (r >= 8 && r <= 12 && c >= 8 && c <= 12) continue;
        const bit = ((hash >>> ((r * cells + c) % 28)) ^ (urlStr.charCodeAt((r + c) % urlStr.length) || 7)) & 1;
        if (bit === 1 || r === 6 || c === 6) {
          ctx.fillRect(
            qrX + margin + c * cellSize,
            qrY + margin + r * cellSize,
            cellSize + 0.3,
            cellSize + 0.3
          );
        }
      }
    }

    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.roundRect(W / 2 - 20, qrY + qrBoxSize / 2 - 20, 40, 40, 10);
    ctx.fill();
    ctx.fillStyle = '#1E1B4B';
    ctx.font = '900 15px sans-serif';
    ctx.fillText('3D', W / 2, qrY + qrBoxSize / 2 + 5);

    ctx.fillStyle = '#FACC15';
    ctx.font = '800 15px sans-serif';
    ctx.fillText(`KOD SESI KELAS: ${classCode || 'CERIA-3D'}`, W / 2, 386);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.beginPath();
    ctx.roundRect(36, 402, W - 72, 44, 12);
    ctx.fill();

    ctx.fillStyle = '#38BDF8';
    ctx.font = '700 14px monospace';
    const shortUrl = urlStr.length > 48 ? urlStr.substring(0, 45) + '...' : urlStr;
    ctx.fillText(shortUrl, W / 2, 429);

    ctx.fillStyle = '#E0E7FF';
    ctx.font = '700 13px sans-serif';
    ctx.fillText('1. Buka Pautan  •  2. Ambil Gambar  •  3. Pilih Avatar 3D  •  4. Cetak!', W / 2, 474);
  }, [showShareModal, studentAccessUrl, classCode, schoolName]);

  const handleCopyStudentLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(studentAccessUrl);
        showToast('Pautan akses pelajar berjaya disalin ke papan keratan!', 'success');
        return;
      }
    } catch {
      // Gunakan fallback
    }
    const tempInput = document.createElement('textarea');
    tempInput.value = studentAccessUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast('Pautan akses pelajar berjaya disalin!', 'success');
  };

  const handleDownloadQrCard = () => {
    if (!qrCanvasRef.current) return;
    const dataUrl = qrCanvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Kad_Akses_Pelajar_AvatarKu_3D.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Kad Akses & QR Pelajar berjaya dimuat turun!', 'success');
  };

  const handleToggleKioskMode = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
        setIsKioskMode(true);
        showToast('Mod Kiosk Makmal Sekolah diaktifkan (Skrin Penuh).', 'success');
      } else {
        document.exitFullscreen?.();
        setIsKioskMode(false);
        showToast('Mod Kiosk ditamatkan.', 'success');
      }
    } catch {
      setIsKioskMode((prev) => !prev);
      showToast('Mod Paparan Pelajar dikemas kini.', 'success');
    }
  };

  const handleDownloadStandalonePortalHtml = () => {
    const portalHtml = `<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portal Pelajar — AvatarKu 3D Studio</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white flex items-center justify-center p-6 font-sans">
  <div class="max-w-xl w-full bg-white/10 backdrop-blur-md border-2 border-yellow-400 rounded-3xl p-8 text-center shadow-2xl space-y-6">
    <div class="inline-block bg-yellow-400 text-indigo-950 font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-wider">
      ${schoolName} • Kod Kelas: ${classCode}
    </div>
    <h1 class="text-3xl sm:text-4xl font-black text-white">AvatarKu 3D Studio</h1>
    <p class="text-yellow-300 font-bold text-lg">“Ambil Gambar, Jadi Avatar, Cetak Kenangan!”</p>
    <p class="text-blue-100 text-sm leading-relaxed">
      Klik butang di bawah untuk melancarkan studio kamera dan mula mencipta watak Avatar 3D anda sekarang.
    </p>
    <a href="${studentAccessUrl}" target="_blank" rel="noopener noreferrer"
       class="block w-full bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-black text-xl py-4 px-6 rounded-2xl shadow-xl transition transform hover:scale-105">
      🚀 BUKA AVATARKU 3D STUDIO SEKARANG
    </a>
    <p class="text-xs text-blue-200 pt-2">Pautan Terus: <span class="underline font-mono">${studentAccessUrl}</span></p>
  </div>
</body>
</html>`;
    const blob = new Blob([portalHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mula-AvatarKu-3D-Pelajar.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Fail Pelancar Desktop Pelajar (.html) berjaya dimuat turun! Letakkan di Desktop komputer makmal.', 'success');
  };

  const allCategories = useMemo(() => {
    return ['Semua', ...Array.from(new Set(AVATAR_CATALOG.map((a) => a.category)))];
  }, []);

  const filteredAvatars = useMemo(() => {
    return AVATAR_CATALOG.filter((a) => {
      const matchCat = categoryFilter === 'Semua' || a.category === categoryFilter;
      const matchGender = genderFilter === 'Semua' || a.gender === genderFilter || a.gender === 'Uniseks';
      return matchCat && matchGender;
    });
  }, [categoryFilter, genderFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/70 to-purple-100 text-slate-800 font-sans flex flex-col justify-between selection:bg-yellow-300">
      {/* GAYA CSS KHUSUS UNTUK CETAKAN FIZIKAL 4R & A4 */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #avatarku-print-area,
          #avatarku-print-area * {
            visibility: visible !important;
          }
          #avatarku-print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 99999 !important;
          }
          @page {
            size: ${printFormat === '4R' ? (printOrientation === 'landscape' ? '6in 4in' : '4in 6in') : 'A4 portrait'};
            margin: ${printFormat === '4R' ? '0mm' : '8mm'};
          }
        }
        .checkerboard-bg {
          background-image: linear-gradient(45deg, #cbd5e1 25%, transparent 25%),
            linear-gradient(-45deg, #cbd5e1 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #cbd5e1 75%),
            linear-gradient(-45deg, transparent 75%, #cbd5e1 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>

      {/* NOTIFIKASI TOAST MESRA PENGGUNA */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 max-w-md animate-bounce print:hidden">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border-2 ${
              notification.type === 'error'
                ? 'bg-red-600 text-white border-red-300'
                : 'bg-indigo-900 text-white border-yellow-400'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-yellow-300 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-yellow-400 shrink-0" />
            )}
            <span className="text-sm font-semibold">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* HEADER & PENUNJUK KEMAJUAN (PROGRESS BAR) */}
      <header className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white shadow-lg sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Nama Aplikasi */}
          <div
            onClick={() => setCurrentStep(0)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-yellow-400 text-indigo-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 fill-indigo-950" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
                AvatarKu 3D Studio
                <span className="hidden md:inline-block text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-yellow-400 text-indigo-950">
                  Edisi Sekolah &amp; Keluarga
                </span>
              </h1>
              <p className="text-xs text-blue-100 font-medium">
                “Ambil Gambar, Jadi Avatar, Cetak Kenangan!”
              </p>
            </div>
          </div>

          {/* Penunjuk Kemajuan 4 Langkah */}
          <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
            {[
              { step: 1, label: '1. Ambil Gambar', icon: Camera },
              { step: 2, label: '2. Buang Latar', icon: Wand2 },
              { step: 3, label: '3. Pilih Avatar 3D', icon: Box },
              { step: 4, label: '4. Cetak Hasil', icon: Printer }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentStep === item.step;
              const isCompleted = currentStep > item.step;
              const canJump =
                item.step === 1 ||
                (item.step === 2 && Boolean(rawPhotoUrl)) ||
                (item.step >= 3 && Boolean(transparentPhotoUrl));

              return (
                <button
                  key={item.step}
                  disabled={!canJump}
                  onClick={() => canJump && setCurrentStep(item.step)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-yellow-400 text-indigo-950 shadow-md scale-105'
                      : isCompleted
                      ? 'bg-white/20 text-white hover:bg-white/30'
                      : 'bg-white/10 text-blue-200 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                  {isCompleted && <Check className="w-3.5 h-3.5 text-yellow-300" />}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Butang Pautan Online & QR Pelajar */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 text-xs sm:text-sm font-black px-3.5 py-2 rounded-xl shadow-md hover:scale-105 transition"
              title="Dapatkan Pautan Online, Kod QR & Pelancar Makmal untuk Pelajar"
            >
              <Share2 className="w-4 h-4" />
              <span>Pautan Pelajar &amp; QR</span>
            </button>

            {/* Butang Mod Kiosk / Murid Seterusnya */}
            <button
              onClick={handleToggleKioskMode}
              className={`hidden md:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition ${
                isKioskMode
                  ? 'bg-emerald-500 text-white border-emerald-300'
                  : 'bg-white/15 hover:bg-white/25 text-white border-white/25'
              }`}
              title="Aktifkan Skrin Penuh untuk Kegunaan Makmal Komputer Sekolah"
            >
              <Monitor className="w-4 h-4" />
              <span>{isKioskMode ? 'Kiosk Aktif' : 'Mod Makmal'}</span>
            </button>

            {/* Butang Padam Semua Gambar (Privasi) */}
            {(rawPhotoUrl || transparentPhotoUrl) && (
              <button
                onClick={handleClearAllSessionData}
                className="flex items-center gap-1.5 bg-red-500/90 hover:bg-red-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow transition"
                title="Padam Semua Gambar dan Bersihkan Sesi"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Murid Baharu / Reset</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MODAL PAUTAN ONLINE, KOD QR & AKSES PELAJAR */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:hidden">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border-4 border-yellow-400 space-y-6 my-8">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-yellow-300 flex items-center justify-center shadow-md shrink-0">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
                    Akses Terus Pelajar &amp; Makmal Komputer
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-indigo-950 mt-0.5">
                    Pautan Online, Kod QR &amp; Pelancar Pelajar
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Kiri: Konfigurasi Pautan & Cara Akses */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-blue-50/90 border-2 border-blue-200 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-blue-900 flex items-center gap-1.5">
                      <Share2 className="w-4 h-4 text-blue-600" />
                      1. Pautan Akses Terus Pelajar (Online URL)
                    </span>
                    <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Sedia Dikongsi
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Kongsi pautan di bawah kepada murid atau letakkan pada Google Classroom / Makmal Komputer:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={studentAccessUrl}
                      onChange={(e) => setStudentAccessUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-blue-300 text-xs sm:text-sm font-mono font-bold text-indigo-950 bg-white focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      onClick={handleCopyStudentLink}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow transition shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                      Salin Pautan
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-600 block mb-1">
                      Nama Sekolah / Makmal:
                    </label>
                    <input
                      type="text"
                      maxLength={32}
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-600 block mb-1">
                      Kod Sesi / Kelas:
                    </label>
                    <input
                      type="text"
                      maxLength={18}
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="bg-purple-50/80 border-2 border-purple-200 rounded-2xl p-4 space-y-2.5">
                  <h4 className="text-xs font-black uppercase text-purple-950 flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-purple-600" />
                    2. Pintasan 1-Klik untuk Desktop Makmal Komputer Sekolah
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Muat turun fail pelancar <strong>Mula-AvatarKu-3D-Pelajar.html</strong> ini dan letakkan di atas <em>Desktop</em> semua komputer murid. Murid hanya perlu klik dua kali untuk terus masuk!
                  </p>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      onClick={handleDownloadStandalonePortalHtml}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow transition"
                    >
                      <Download className="w-4 h-4" />
                      Muat Turun Fail Pelancar Pelajar (.HTML)
                    </button>
                    <button
                      onClick={() => {
                        setShowShareModal(false);
                        handleToggleKioskMode();
                      }}
                      className="flex items-center gap-2 bg-white hover:bg-purple-100 text-purple-900 font-bold text-xs px-4 py-2.5 rounded-xl border border-purple-300 transition"
                    >
                      <Maximize2 className="w-4 h-4" />
                      Buka Mod Kiosk Skrin Penuh Sekarang
                    </button>
                  </div>
                </div>
              </div>

              {/* Kanan: Pratonton Kad Akses QR Pelajar */}
              <div className="lg:col-span-5 flex flex-col items-center bg-slate-100 p-4 rounded-3xl border-2 border-slate-200 space-y-3">
                <canvas
                  ref={qrCanvasRef}
                  width={420}
                  height={500}
                  className="w-full max-w-[300px] rounded-2xl shadow-lg border-2 border-white"
                />
                <div className="w-full flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleDownloadQrCard}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-black text-xs py-3 px-4 rounded-xl shadow transition"
                  >
                    <QrCode className="w-4 h-4" />
                    Muat Turun Poster QR (PNG)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KANDUNGAN UTAMA APLIKASI */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 print:hidden">
        {/* KANVAS TERSEMBUNYI UNTUK PENJANAAN KOMPOSIT */}
        <canvas ref={previewCanvasRef} width={800} height={1200} className="hidden" />

        {/* ===================================================================
            HALAMAN UTAMA (STEP 0): PENGENALAN & MULA SEKARANG
           =================================================================== */}
        {currentStep === 0 && (
          <div className="space-y-8 py-2">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white p-8 sm:p-12 shadow-2xl border-4 border-white">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400 text-indigo-950 font-extrabold text-xs sm:text-sm shadow">
                    <Sparkles className="w-4 h-4" />
                    STUDIO FOTO AVATAR 3D INTERAKTIF
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black leading-tight">
                    AvatarKu 3D Studio
                  </h2>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-300">
                    “Ambil Gambar, Jadi Avatar, Cetak Kenangan!”
                  </p>
                  <p className="text-blue-100 text-base sm:text-lg leading-relaxed max-w-2xl">
                    Tukarkan wajah anda menjadi salah satu daripada <strong>18 watak Avatar 3D</strong> impian — daripada Angkasawan, Doktor, Wira Super, Puteri hinggalah Pahlawan Melayu! Latar belakang dibuang secara automatik dan sedia untuk dicetak pada kertas foto 4R atau A4.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex items-center gap-3 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-black text-lg sm:text-xl px-8 py-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      <Camera className="w-6 h-6" />
                      MULA SEKARANG
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => {
                        const sample = generateSamplePortraitDataUrl(1);
                        setRawPhotoUrl(sample);
                        setCurrentStep(2);
                        runBackgroundAndFacePipeline(sample);
                      }}
                      className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold text-sm sm:text-base px-5 py-4 rounded-2xl border border-white/30 transition"
                    >
                      <Wand2 className="w-5 h-5 text-yellow-300" />
                      Cuba Demo Pantas (Gambar Contoh)
                    </button>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="flex items-center gap-2 bg-indigo-950/60 hover:bg-indigo-950/80 text-yellow-300 font-bold text-sm sm:text-base px-5 py-4 rounded-2xl border border-yellow-400/50 transition"
                    >
                      <QrCode className="w-5 h-5" />
                      Pautan &amp; QR Pelajar
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center">
                  <div className="bg-white/15 backdrop-blur-md p-5 rounded-3xl border-2 border-white/30 shadow-2xl w-full max-w-sm">
                    <div className="grid grid-cols-2 gap-3">
                      {AVATAR_CATALOG.slice(0, 4).map((av) => (
                        <div
                          key={av.id}
                          className="bg-indigo-950/60 p-3.5 rounded-2xl border border-white/15 flex flex-col items-center text-center"
                        >
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner mb-2 border-2 border-yellow-400"
                            style={{ backgroundColor: av.colors[0].primary }}
                          >
                            <Star className="w-7 h-7 text-yellow-300 fill-yellow-300" />
                          </div>
                          <span className="text-xs font-extrabold text-yellow-300">{av.category}</span>
                          <span className="text-[11px] text-blue-100 mt-0.5">{av.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 bg-indigo-950/80 rounded-2xl p-3 text-center border border-yellow-400/40">
                      <p className="text-xs font-bold text-yellow-300">
                        ✨ 18 Kategori Avatar 3D • Auto-Fit Wajah Pintar • Cetakan 4R &amp; A4
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-center text-xl sm:text-2xl font-extrabold text-indigo-950 mb-5">
                4 Langkah Mudah Menghasilkan Avatar 3D Anda
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    num: '1',
                    title: 'Ambil Gambar',
                    desc: 'Gunakan webcam komputer dengan pemasa 3s/5s atau muat naik gambar wajah anda.',
                    icon: Camera,
                    color: 'from-blue-500 to-blue-700'
                  },
                  {
                    num: '2',
                    title: 'Buang Latar Belakang',
                    desc: 'Sistem mengesan subjek dan membuang latar belakang menjadi telus secara automatik.',
                    icon: Wand2,
                    color: 'from-indigo-500 to-indigo-700'
                  },
                  {
                    num: '3',
                    title: 'Pilih Avatar 3D',
                    desc: 'Pilih daripada 18 watak 3D menarik. Wajah anda dipadankan secara automatik!',
                    icon: Box,
                    color: 'from-purple-500 to-purple-700'
                  },
                  {
                    num: '4',
                    title: 'Cetak Hasil',
                    desc: 'Tambah latar belakang, bingkai & nama, kemudian muat turun PNG atau cetak 4R / A4.',
                    icon: Printer,
                    color: 'from-amber-500 to-orange-600'
                  }
                ].map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.num}
                      className="bg-white rounded-3xl p-6 shadow-lg border-2 border-indigo-100 hover:border-indigo-300 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-md`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <span className="text-3xl font-black text-indigo-200">0{card.num}</span>
                        </div>
                        <h4 className="text-lg font-extrabold text-indigo-950 mb-1.5">{card.title}</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            LANGKAH 1: MODUL WEBCAM DAN PENGAMBILAN GAMBAR
           =================================================================== */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl shadow-xl border-2 border-indigo-100 p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Langkah 1 daripada 4
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 mt-1">
                  Ambil Gambar Wajah Anda
                </h2>
                <p className="text-sm text-slate-600">
                  Pastikan wajah anda menghadap ke hadapan dengan pencahayaan yang terang supaya padanan avatar lebih kemas.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {videoDevices.length > 1 && (
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => {
                      setSelectedDeviceId(e.target.value);
                      startCamera(e.target.value);
                    }}
                    className="text-xs font-bold bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  >
                    {videoDevices.map((dev, idx) => (
                      <option key={dev.deviceId || idx} value={dev.deviceId}>
                        {dev.label || `Kamera ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={() => setMirrorCam((m) => !m)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                    mirrorCam
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                      : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  <FlipHorizontal className="w-4 h-4" />
                  Cermin: {mirrorCam ? 'Aktif' : 'Mati'}
                </button>

                <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                  <Timer className="w-4 h-4 text-slate-500 ml-2 mr-1" />
                  {[
                    { label: 'Tiada', val: 0 },
                    { label: '3 Saat', val: 3 },
                    { label: '5 Saat', val: 5 }
                  ].map((t) => (
                    <button
                      key={t.val}
                      onClick={() => setTimerSeconds(t.val)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        timerSeconds === t.val
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {cameraError && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-bold">Makluman Kamera:</p>
                  <p>{cameraError}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7">
                <div className="relative aspect-[4/3] w-full bg-slate-900 rounded-3xl overflow-hidden shadow-inner border-4 border-indigo-100 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${
                      cameraActive && !rawPhotoUrl ? 'block' : 'hidden'
                    } ${mirrorCam ? '-scale-x-100' : ''}`}
                  />

                  {cameraActive && !rawPhotoUrl && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                      <div className="w-48 h-60 sm:w-56 sm:h-72 border-4 border-dashed border-yellow-400/85 rounded-full shadow-[0_0_0_9999px_rgba(15,23,42,0.35)]" />
                      <span className="mt-3 bg-slate-900/80 text-yellow-300 text-xs font-bold px-3.5 py-1 rounded-full">
                        Posisikan wajah anda di dalam bulatan ini
                      </span>
                    </div>
                  )}

                  {countdown > 0 && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-20">
                      <span className="text-7xl sm:text-8xl font-black text-yellow-400 animate-ping">
                        {countdown}
                      </span>
                    </div>
                  )}

                  {rawPhotoUrl && (
                    <img
                      src={rawPhotoUrl}
                      alt="Pratonton Gambar Pengguna"
                      className="w-full h-full object-contain bg-slate-950"
                    />
                  )}

                  {!cameraActive && !rawPhotoUrl && (
                    <div className="text-center p-6 space-y-4 max-w-md">
                      <div className="w-20 h-20 rounded-3xl bg-indigo-600/30 border-2 border-indigo-400 text-yellow-300 flex items-center justify-center mx-auto">
                        <Camera className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-extrabold text-white">Kamera Belum Diaktifkan</h3>
                      <p className="text-xs sm:text-sm text-slate-300">
                        Klik butang <strong>“Aktifkan Kamera”</strong> di bawah untuk memulakan tangkapan webcam, atau muat naik gambar daripada komputer anda.
                      </p>
                      <button
                        onClick={() => startCamera()}
                        className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-black px-6 py-3.5 rounded-2xl shadow-lg transition"
                      >
                        <Camera className="w-5 h-5" />
                        Aktifkan Kamera
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  {!cameraActive && !rawPhotoUrl && (
                    <button
                      onClick={() => startCamera()}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-md transition"
                    >
                      <Camera className="w-5 h-5" />
                      Aktifkan Kamera
                    </button>
                  )}

                  {cameraActive && !rawPhotoUrl && (
                    <>
                      <button
                        onClick={handleTriggerCapture}
                        disabled={countdown > 0}
                        className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-black text-base px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition"
                      >
                        <Camera className="w-6 h-6" />
                        {timerSeconds > 0 ? `Ambil Gambar (${timerSeconds}s)` : 'Ambil Gambar'}
                      </button>
                      <button
                        onClick={stopCameraStream}
                        className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-3.5 rounded-2xl transition"
                      >
                        Tutup Kamera
                      </button>
                    </>
                  )}

                  {rawPhotoUrl && (
                    <>
                      <button
                        onClick={() => {
                          setRawPhotoUrl('');
                          startCamera();
                        }}
                        className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold px-5 py-3.5 rounded-2xl transition"
                      >
                        <RefreshCw className="w-5 h-5" />
                        Ambil Semula
                      </button>

                      <button
                        onClick={() => {
                          setCurrentStep(2);
                          runBackgroundAndFacePipeline(rawPhotoUrl);
                        }}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-base px-8 py-4 rounded-2xl shadow-xl hover:scale-105 transition"
                      >
                        <CheckCircle2 className="w-5 h-5 text-yellow-300" />
                        Gunakan Gambar Ini
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Panel Alternatif: Muat Naik Gambar & Gambar Contoh */}
              <div className="lg:col-span-5 space-y-5">
                <div className="bg-indigo-50/80 rounded-3xl p-5 border-2 border-indigo-100 space-y-4">
                  <h3 className="text-base font-extrabold text-indigo-950 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-indigo-600" />
                    Alternatif: Muat Naik Gambar Komputer
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tiada webcam atau mahu menggunakan gambar sedia ada di dalam komputer/telefon? Muat naik fail gambar anda di sini.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-indigo-100 text-indigo-900 font-extrabold py-3.5 px-4 rounded-2xl border-2 border-dashed border-indigo-300 shadow-sm transition"
                  >
                    <Upload className="w-5 h-5 text-indigo-600" />
                    Pilih Fail Gambar (JPG / PNG)
                  </button>
                </div>

                <div className="bg-purple-50/80 rounded-3xl p-5 border-2 border-purple-100 space-y-3">
                  <h3 className="text-base font-extrabold text-purple-950 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Cuba Dengan Gambar Wajah Contoh
                  </h3>
                  <p className="text-xs text-slate-600">
                    Klik salah satu potret contoh di bawah untuk menguji pembuangan latar belakang dan padanan wajah automatik dengan segera:
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 1, label: 'Murid Lelaki' },
                      { id: 2, label: 'Murid Bertudung' },
                      { id: 3, label: 'Sudut Senget' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleLoadSamplePhoto(s.id)}
                        className="bg-white hover:bg-purple-100 border-2 border-purple-200 rounded-2xl p-2.5 text-center transition shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-black flex items-center justify-center mx-auto mb-1 text-xs">
                          #{s.id}
                        </div>
                        <span className="text-[11px] font-bold text-purple-950 block">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200 text-xs text-amber-900 space-y-1.5">
                  <p className="font-extrabold flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-600" />
                    Tip Gambar Terbaik:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-amber-800">
                    <li>Pandang tepat ke arah kamera dan senyum ceria.</li>
                    <li>Elakkan memakai topi besar atau tangan menutup muka.</li>
                    <li>Pastikan cahaya berada di hadapan wajah anda.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            LANGKAH 2: MODUL AUTO REMOVE BACKGROUND & PENGESANAN WAJAH
           =================================================================== */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl shadow-xl border-2 border-indigo-100 p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                  Langkah 2 daripada 4
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 mt-1">
                  Penyingkiran Latar Belakang &amp; Pengesanan Wajah
                </h2>
                <p className="text-sm text-slate-600">
                  Sistem membuang latar belakang menjadi telus (saluran alfa PNG) dan mengesan kedudukan mata, hidung serta mulut.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Ambil Gambar Semula
                </button>
                <button
                  onClick={() => runBackgroundAndFacePipeline(rawPhotoUrl, bgSensitivity, bgFeather)}
                  disabled={isProcessingBg}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-xs sm:text-sm font-bold transition"
                >
                  <RefreshCw className={`w-4 h-4 ${isProcessingBg ? 'animate-spin' : ''}`} />
                  Cuba Semula
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 rounded-2xl p-4 border border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-extrabold text-indigo-950 flex items-center gap-2">
                  {isProcessingBg ? (
                    <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                  {processStatusText || 'Gambar berjaya diproses!'}
                </span>
                <span className="text-xs font-black text-indigo-700">{processProgress}%</span>
              </div>
              <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-indigo-100">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-300"
                  style={{ width: `${processProgress}%` }}
                />
              </div>
            </div>

            {processError && (
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-center gap-3 text-red-900">
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                <div className="text-sm">
                  <p className="font-extrabold">Ralat Pemprosesan Gambar:</p>
                  <p>{processError}</p>
                </div>
              </div>
            )}

            {faceLandmarks && !faceLandmarks.detected && (
              <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-amber-950">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-extrabold">
                      “Kami tidak dapat mengesan wajah dengan jelas. Sila ambil gambar yang menghadap kamera.”
                    </p>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Anda boleh mengambil gambar semula atau menetapkan kedudukan kawasan wajah secara manual di bawah.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold"
                  >
                    Ambil Semula
                  </button>
                  <button
                    onClick={() => setManualFaceMode(true)}
                    className="px-4 py-2 rounded-xl bg-white border border-amber-400 text-amber-900 text-xs font-bold"
                  >
                    Tetapkan Wajah Manual
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-3xl p-4 border-2 border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-700">1. Gambar Asal</span>
                  <span className="text-xs font-semibold text-slate-500">Dengan Latar Belakang</span>
                </div>
                <div className="aspect-square max-h-80 mx-auto rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
                  {rawPhotoUrl && (
                    <img src={rawPhotoUrl} alt="Gambar Asal" className="w-full h-full object-contain" />
                  )}
                </div>
              </div>

              <div className="bg-indigo-50/50 rounded-3xl p-4 border-2 border-indigo-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-indigo-950">
                    2. Selepas Latar Belakang Dibuang (PNG Telus)
                  </span>
                  <button
                    onClick={() => setManualFaceMode((m) => !m)}
                    className="text-xs font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 hover:bg-indigo-100"
                  >
                    {manualFaceMode ? 'Sembunyi Pelarasan Wajah' : 'Laraskan Kotak Wajah'}
                  </button>
                </div>

                <div className="relative aspect-square max-h-80 mx-auto rounded-2xl overflow-hidden checkerboard-bg border border-slate-300 flex items-center justify-center">
                  {transparentPhotoUrl && (
                    <img
                      src={transparentPhotoUrl}
                      alt="Latar Belakang Telus"
                      className="w-full h-full object-contain"
                    />
                  )}

                  {faceLandmarks && !isProcessingBg && (
                    <div
                      className="absolute border-2 border-dashed border-yellow-400 rounded-full pointer-events-none shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                      style={{
                        left: `${(faceLandmarks.centerX - faceLandmarks.width / 2) * 100}%`,
                        top: `${(faceLandmarks.centerY - faceLandmarks.height / 2) * 100}%`,
                        width: `${faceLandmarks.width * 100}%`,
                        height: `${faceLandmarks.height * 100}%`
                      }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-950 text-yellow-300 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        Wajah Dikesan ({faceLandmarks.angleDeg}°){' '}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 flex justify-between">
                  <span>Kepekaan Pembuangan Latar Belakang:</span>
                  <span className="text-indigo-600">{bgSensitivity}</span>
                </label>
                <input
                  type="range"
                  min="18"
                  max="75"
                  value={bgSensitivity}
                  onChange={(e) => setBgSensitivity(Number(e.target.value))}
                  onMouseUp={() => runBackgroundAndFacePipeline(rawPhotoUrl, bgSensitivity, bgFeather)}
                  onTouchEnd={() => runBackgroundAndFacePipeline(rawPhotoUrl, bgSensitivity, bgFeather)}
                  className="w-full accent-indigo-600"
                />
                <p className="text-[11px] text-slate-500">
                  Gerakkan peluncur jika sebahagian latar belakang masih kelihatan atau rambut terpotong.
                </p>
              </div>

              {manualFaceMode && faceLandmarks && (
                <div className="space-y-2 bg-white p-3 rounded-xl border border-indigo-200">
                  <p className="text-xs font-extrabold text-indigo-950">
                    Pelarasan Manual Kedudukan Wajah Sumber:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500">Posisi X</span>
                      <input
                        type="range"
                        min="0.25"
                        max="0.75"
                        step="0.01"
                        value={faceLandmarks.centerX}
                        onChange={(e) =>
                          setFaceLandmarks((prev) => (prev ? { ...prev, centerX: Number(e.target.value), detected: true } : null))
                        }
                        className="w-full accent-indigo-600"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500">Posisi Y</span>
                      <input
                        type="range"
                        min="0.2"
                        max="0.75"
                        step="0.01"
                        value={faceLandmarks.centerY}
                        onChange={(e) =>
                          setFaceLandmarks((prev) => (prev ? { ...prev, centerY: Number(e.target.value), detected: true } : null))
                        }
                        className="w-full accent-indigo-600"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500">Saiz Muka</span>
                      <input
                        type="range"
                        min="0.22"
                        max="0.65"
                        step="0.01"
                        value={faceLandmarks.width}
                        onChange={(e) => {
                          const wVal = Number(e.target.value);
                          setFaceLandmarks((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  width: wVal,
                                  height: wVal * 1.18,
                                  detected: true
                                }
                              : null
                          );
                        }}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                disabled={isProcessingBg || !transparentPhotoUrl}
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-indigo-950 font-black text-base sm:text-lg px-8 py-4 rounded-2xl shadow-xl hover:scale-105 transition"
              >
                Teruskan ke Galeri Avatar 3D
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            LANGKAH 3: GALERI 18 AVATAR 3D & FUNGSI AUTO-FIT WAJAH
           =================================================================== */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl shadow-xl border-2 border-indigo-100 p-5 space-y-4 sticky top-20">
                <div className="flex items-center justify-between gap-2 bg-slate-100 p-1.5 rounded-2xl">
                  <button
                    onClick={() => setRenderMode('print')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-extrabold transition ${
                      renderMode === 'print'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Mod Cetakan HD
                  </button>
                  <button
                    onClick={() => setRenderMode('3d')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-extrabold transition ${
                      renderMode === '3d'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Box className="w-4 h-4" />
                    Mod 3D Interaktif
                  </button>
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-indigo-100 shadow-inner flex items-center justify-center min-h-[420px]">
                  {renderMode === '3d' ? (
                    <InteractiveThreeAvatar
                      avatar={selectedAvatar}
                      colorIndex={selectedColorIdx}
                      faceImageElement={faceImageElem}
                      landmarks={faceLandmarks}
                      fitTransform={fitTransform}
                    />
                  ) : (
                    finalCompositeUrl && (
                      <img
                        src={finalCompositeUrl}
                        alt="Pratonton Gabungan Avatar"
                        className="w-full max-h-[460px] object-contain"
                      />
                    )
                  )}
                </div>

                <div className="flex items-center justify-between bg-indigo-50/70 px-4 py-2.5 rounded-2xl border border-indigo-100">
                  <span className="text-xs font-extrabold text-indigo-950">Warna Pakaian Avatar:</span>
                  <div className="flex items-center gap-2">
                    {selectedAvatar.colors.map((c, idx) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColorIdx(idx)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition ${
                          selectedColorIdx === idx
                            ? 'bg-indigo-950 text-white border-yellow-400 scale-105 shadow'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-white"
                          style={{ backgroundColor: c.primary }}
                        />
                        <span className="hidden sm:inline">{c.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-indigo-600" />
                      Pelarasan Wajah (Auto-Fit Aktif)
                    </span>
                    <button
                      onClick={() => setFitTransform(computeAutoFitTransform(faceLandmarks, selectedAvatar))}
                      className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Pulihkan Auto-Fit
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                        <span>Saiz Wajah</span>
                        <span>{Math.round(fitTransform.scale * 100)}%</span>
                      </label>
                      <input
                        type="range"
                        min="0.65"
                        max="1.45"
                        step="0.02"
                        value={fitTransform.scale}
                        onChange={(e) =>
                          setFitTransform((p) => ({ ...p, scale: Number(e.target.value) }))
                        }
                        className="w-full accent-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                        <span>Putaran Sudut</span>
                        <span>{fitTransform.rotation}°</span>
                      </label>
                      <input
                        type="range"
                        min="-25"
                        max="25"
                        step="1"
                        value={fitTransform.rotation}
                        onChange={(e) =>
                          setFitTransform((p) => ({ ...p, rotation: Number(e.target.value) }))
                        }
                        className="w-full accent-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                        <span>Kiri / Kanan (X)</span>
                        <span>{fitTransform.offsetX}px</span>
                      </label>
                      <input
                        type="range"
                        min="-60"
                        max="60"
                        step="2"
                        value={fitTransform.offsetX}
                        onChange={(e) =>
                          setFitTransform((p) => ({ ...p, offsetX: Number(e.target.value) }))
                        }
                        className="w-full accent-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                        <span>Atas / Bawah (Y)</span>
                        <span>{fitTransform.offsetY}px</span>
                      </label>
                      <input
                        type="range"
                        min="-60"
                        max="60"
                        step="2"
                        value={fitTransform.offsetY}
                        onChange={(e) =>
                          setFitTransform((p) => ({ ...p, offsetY: Number(e.target.value) }))
                        }
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-bold text-slate-600">Bentuk Potongan:</span>
                    <div className="flex gap-1.5">
                      {[
                        { id: 'oval', label: 'Bujur' },
                        { id: 'helmet-circle', label: 'Bulat' },
                        { id: 'rounded-shield', label: 'Perisai' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setFitTransform((p) => ({ ...p, maskType: m.id }))}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                            fitTransform.maskType === m.id
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(4)}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-black text-base py-4 rounded-2xl shadow-lg hover:scale-[1.02] transition"
                >
                  Teruskan ke Suntingan &amp; Cetakan
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Kanan: Galeri 18 Kategori Avatar 3D */}
            <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl border-2 border-indigo-100 p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    Langkah 3 daripada 4 • 18 Pilihan Watak
                  </span>
                  <h2 className="text-2xl font-black text-indigo-950 mt-1">
                    Pilih Watak Avatar 3D Kegemaran
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Klik mana-mana watak di bawah — wajah anda akan dipadankan secara automatik!
                  </p>
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {['Semua', 'Lelaki', 'Perempuan'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenderFilter(g)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        genderFilter === g
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                      categoryFilter === cat
                        ? 'bg-indigo-950 text-yellow-300 border-indigo-950 shadow'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[680px] overflow-y-auto pr-1">
                {filteredAvatars.map((av) => {
                  const isSelected = av.id === selectedAvatarId;
                  const primaryColor = av.colors[0].primary;
                  const accentColor = av.colors[0].accent;

                  return (
                    <div
                      key={av.id}
                      onClick={() => handleSelectAvatar(av)}
                      className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-b from-indigo-50 to-purple-50 border-indigo-600 shadow-lg ring-2 ring-yellow-400 scale-[1.02]'
                          : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md border-2 border-white shrink-0"
                            style={{
                              background: `radial-gradient(circle at 30% 30%, #ffffff, ${primaryColor})`
                            }}
                          >
                            <Award
                              className="w-7 h-7 drop-shadow"
                              style={{ color: accentColor }}
                            />
                          </div>
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-900">
                            {av.category}
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-indigo-950">{av.name}</h3>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {av.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {av.colors.map((c) => (
                            <span
                              key={c.name}
                              className="w-3.5 h-3.5 rounded-full border border-slate-300"
                              style={{ backgroundColor: c.primary }}
                              title={c.name}
                            />
                          ))}
                        </div>
                        <span
                          className={`text-xs font-extrabold flex items-center gap-1 ${
                            isSelected ? 'text-indigo-700' : 'text-slate-500'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Dipilih
                            </>
                          ) : (
                            'Pilih Avatar'
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            LANGKAH 4: EDITOR KEMASAN AKHIR & MODUL CETAKAN FOTO (4R, A4, PNG)
           =================================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-900 via-blue-800 to-purple-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-yellow-400 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1 rounded-full bg-yellow-400 text-indigo-950 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Langkah 4 daripada 4 • Sedia Untuk Dicetak
                </span>
                <h2 className="text-2xl sm:text-4xl font-black">Avatar Anda Sudah Siap!</h2>
                <p className="text-sm text-blue-100 mt-1">
                  Pilih latar belakang, bingkai dan teks kenangan anda, kemudian muat turun PNG resolusi tinggi atau cetak pada saiz 4R / A4.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold text-sm px-4 py-3 rounded-2xl border border-white/30 transition"
                >
                  <Box className="w-4 h-4 text-yellow-300" />
                  Tukar Avatar
                </button>
                <button
                  onClick={handleDownloadHighResPNG}
                  className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-black text-sm sm:text-base px-6 py-3.5 rounded-2xl shadow-lg hover:scale-105 transition"
                >
                  <Download className="w-5 h-5" />
                  Muat Turun PNG (HD)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-3xl shadow-xl border-2 border-indigo-100 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-indigo-950 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-indigo-600" />
                      Pratonton Hasil Akhir ({selectedAvatar.name})
                    </h3>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      1200 × 1800 px (300 DPI)
                    </span>
                  </div>

                  <div className="rounded-2xl overflow-hidden checkerboard-bg border-2 border-indigo-100 shadow-inner flex items-center justify-center bg-slate-900">
                    {finalCompositeUrl && (
                      <img
                        src={finalCompositeUrl}
                        alt="Avatar Akhir"
                        className="w-full max-h-[480px] object-contain"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={handleDownloadHighResPNG}
                      className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow transition"
                    >
                      <Download className="w-4 h-4" />
                      Muat Turun PNG
                    </button>
                    <button
                      onClick={() => handlePrintNow(printFormat)}
                      className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-black text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow transition"
                    >
                      <Printer className="w-4 h-4" />
                      Cetak Sekarang
                    </button>
                  </div>
                </div>
              </div>

              {/* Kanan: Panel Editor & Modul Cetakan */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-3xl shadow-xl border-2 border-indigo-100 p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-extrabold text-indigo-950 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-indigo-600" />
                      Editor Latar Belakang, Bingkai &amp; Teks
                    </h3>
                    <button
                      onClick={() =>
                        setEditorConfig({
                          backgroundId: 'biru',
                          frameId: 'gold-star',
                          softShadow: true,
                          userName: '',
                          customText: 'Saya Hebat!',
                          textSize: 'medium',
                          textColor: '#FACC15',
                          textPosition: 'bottom'
                        })
                      }
                      className="text-xs font-bold text-slate-600 hover:text-indigo-700 flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-xl"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Editor
                    </button>
                  </div>

                  {/* Pilihan 10 Latar Belakang */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-700 block">
                      Pilih Latar Belakang Studio:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {BACKGROUND_THEMES.map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => setEditorConfig((p) => ({ ...p, backgroundId: bg.id }))}
                          className={`flex items-center gap-2 p-2 rounded-xl border-2 text-left transition ${
                            editorConfig.backgroundId === bg.id
                              ? 'border-indigo-600 bg-indigo-50 font-extrabold text-indigo-950 shadow-sm'
                              : 'border-slate-200 hover:border-indigo-200 text-slate-700 font-semibold'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-lg border border-slate-300 shrink-0 ${
                              bg.preview === 'checker' ? 'checkerboard-bg' : ''
                            }`}
                            style={
                              bg.preview !== 'checker' ? { backgroundColor: bg.preview } : undefined
                            }
                          />
                          <span className="text-xs truncate">{bg.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pilihan Bingkai & Bayang */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-8 space-y-2">
                      <label className="text-xs font-extrabold text-slate-700 block">
                        Bingkai Gambar:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {FRAME_STYLES.map((fr) => (
                          <button
                            key={fr.id}
                            onClick={() => setEditorConfig((p) => ({ ...p, frameId: fr.id }))}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                              editorConfig.frameId === fr.id
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50'
                            }`}
                          >
                            {fr.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <input
                          type="checkbox"
                          checked={editorConfig.softShadow}
                          onChange={(e) =>
                            setEditorConfig((p) => ({ ...p, softShadow: e.target.checked }))
                          }
                          className="w-4 h-4 accent-indigo-600 rounded"
                        />
                        <span className="text-xs font-extrabold text-slate-700">
                          Bayang Lembut 3D
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Nama Pengguna & Teks Slogan */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                        <Type className="w-4 h-4 text-indigo-600" />
                        Nama &amp; Teks Kenangan
                      </span>
                      <button
                        onClick={() =>
                          setEditorConfig((p) => ({ ...p, userName: '', customText: '' }))
                        }
                        className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200"
                      >
                        Padam Teks
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Nama Anda (Pilihan):
                        </label>
                        <input
                          type="text"
                          maxLength={24}
                          placeholder="Contoh: ADIK DANIAL"
                          value={editorConfig.userName}
                          onChange={(e) =>
                            setEditorConfig((p) => ({ ...p, userName: e.target.value }))
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Teks Slogan Pendek:
                        </label>
                        <input
                          type="text"
                          maxLength={28}
                          placeholder="Contoh: Saya Hebat!"
                          value={editorConfig.customText}
                          onChange={(e) =>
                            setEditorConfig((p) => ({ ...p, customText: e.target.value }))
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_SLOGANS.map((slog) => (
                        <button
                          key={slog}
                          onClick={() => setEditorConfig((p) => ({ ...p, customText: slog }))}
                          className="text-[11px] font-bold bg-white hover:bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-lg border border-indigo-200 transition"
                        >
                          + {slog}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <span className="text-[11px] font-bold text-slate-600 block mb-1">
                          Saiz Teks:
                        </span>
                        <div className="flex bg-white rounded-xl p-1 border border-slate-200">
                          {[
                            { id: 'small', label: 'Kecil' },
                            { id: 'medium', label: 'Sederhana' },
                            { id: 'large', label: 'Besar' }
                          ].map((sz) => (
                            <button
                              key={sz.id}
                              onClick={() => setEditorConfig((p) => ({ ...p, textSize: sz.id as 'small' | 'medium' | 'large' }))}
                              className={`flex-1 py-1 rounded-lg text-[11px] font-bold ${
                                editorConfig.textSize === sz.id
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-slate-600'
                              }`}
                            >
                              {sz.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-600 block mb-1">
                          Kedudukan Teks:
                        </span>
                        <div className="flex bg-white rounded-xl p-1 border border-slate-200">
                          {[
                            { id: 'top', label: 'Atas' },
                            { id: 'bottom', label: 'Bawah' }
                          ].map((pos) => (
                            <button
                              key={pos.id}
                              onClick={() =>
                                setEditorConfig((p) => ({ ...p, textPosition: pos.id as 'top' | 'bottom' }))
                              }
                              className={`flex-1 py-1 rounded-lg text-[11px] font-bold ${
                                editorConfig.textPosition === pos.id
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-slate-600'
                              }`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-600 block mb-1">
                          Warna Teks:
                        </span>
                        <div className="flex items-center gap-2 pt-1">
                          {['#FACC15', '#FFFFFF', '#38BDF8', '#F472B6', '#4ADE80'].map((col) => (
                            <button
                              key={col}
                              onClick={() => setEditorConfig((p) => ({ ...p, textColor: col }))}
                              className={`w-6 h-6 rounded-full border-2 ${
                                editorConfig.textColor === col
                                  ? 'border-indigo-950 scale-110 ring-2 ring-indigo-400'
                                  : 'border-slate-300'
                              }`}
                              style={{ backgroundColor: col }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Modul Cetakan Foto 4R & Kertas A4 */}
                <div className="bg-white rounded-3xl shadow-xl border-2 border-indigo-100 p-6 space-y-5">
                  <h3 className="text-lg font-extrabold text-indigo-950 flex items-center gap-2">
                    <Printer className="w-5 h-5 text-indigo-600" />
                    Tetapan Susun Atur Cetakan Foto (4R &amp; Kertas A4)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setPrintFormat('4R')}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition ${
                        printFormat === '4R'
                          ? 'bg-blue-50/70 border-blue-600 shadow'
                          : 'bg-slate-50 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-indigo-950">
                          Cetakan Foto 4R (4 × 6 Inci)
                        </span>
                        <FileImage className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-xs text-slate-600 mb-3">
                        Saiz standard kertas foto album (1200 × 1800 piksel pada 300 DPI).
                      </p>
                      <div className="flex items-center gap-2">
                        {[
                          { id: 'portrait', label: 'Potret (Tegak)' },
                          { id: 'landscape', label: 'Landskap (Melintang)' }
                        ].map((or) => (
                          <button
                            key={or.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPrintFormat('4R');
                              setPrintOrientation(or.id as 'portrait' | 'landscape');
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                              printFormat === '4R' && printOrientation === or.id
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            {or.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      onClick={() => setPrintFormat('A4')}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition ${
                        printFormat === 'A4'
                          ? 'bg-purple-50/70 border-purple-600 shadow'
                          : 'bg-slate-50 border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-indigo-950">
                          Susun pada Kertas A4
                        </span>
                        <LayoutGrid className="w-5 h-5 text-purple-600" />
                      </div>
                      <p className="text-xs text-slate-600 mb-3">
                        Cetak 1 avatar besar atau berbilang salinan pada sehelai kertas A4 dengan ruang pemotongan.
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          { count: 1, label: '1 Besar' },
                          { count: 2, label: '2 Salinan' },
                          { count: 4, label: '4 Salinan' },
                          { count: 8, label: '8 Lencana' }
                        ].map((item) => (
                          <button
                            key={item.count}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPrintFormat('A4');
                              setA4Copies(item.count);
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border ${
                              printFormat === 'A4' && a4Copies === item.count
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Panduan Cetakan Tepat:</strong> Dalam tetingkap cetakan pelayar (Print Dialog), pastikan anda memilih <strong>Saiz Kertas: {printFormat === '4R' ? '4 × 6 in (Photo 4R)' : 'A4'}</strong>, tetapkan <strong>Skala (Scale): 100% / Default</strong>, dan tandakan <strong>Background Graphics (Grafik Latar Belakang)</strong>.
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => handlePrintNow('4R')}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm px-5 py-3.5 rounded-2xl shadow transition"
                    >
                      <Printer className="w-4 h-4" />
                      Cetak Saiz 4R
                    </button>

                    <button
                      onClick={() => handlePrintNow('A4')}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm px-5 py-3.5 rounded-2xl shadow transition"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      Susun pada Kertas A4
                    </button>

                    <button
                      onClick={handleDownloadHighResPNG}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-5 py-3.5 rounded-2xl shadow transition"
                    >
                      <Download className="w-4 h-4" />
                      Muat Turun PNG
                    </button>

                    <button
                      onClick={handleClearAllSessionData}
                      className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs sm:text-sm px-5 py-3.5 rounded-2xl transition ml-auto"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Cipta Avatar Baharu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =====================================================================
          KANVAS CETAKAN FIZIKAL (HANYA KELIHATAN SEMASA WINDOW.PRINT())
         ===================================================================== */}
      <div id="avatarku-print-area" className="hidden print:flex">
        {printFormat === '4R' ? (
          <div
            style={{
              width: printOrientation === 'landscape' ? '6in' : '4in',
              height: printOrientation === 'landscape' ? '4in' : '6in',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              background: '#ffffff'
            }}
          >
            {finalCompositeUrl && (
              <img
                src={finalCompositeUrl}
                alt="Cetakan 4R"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            )}
          </div>
        ) : (
          <div
            style={{
              width: '210mm',
              minHeight: '297mm',
              padding: '10mm',
              boxSizing: 'border-box',
              background: '#ffffff',
              display: 'grid',
              gap: '6mm',
              alignContent: 'center',
              justifyItems: 'center',
              gridTemplateColumns:
                a4Copies === 1
                  ? '1fr'
                  : a4Copies === 2
                  ? '1fr'
                  : a4Copies === 4
                  ? 'repeat(2, 1fr)'
                  : 'repeat(4, 1fr)'
            }}
          >
            {Array.from({ length: a4Copies }).map((_, index) => (
              <div
                key={index}
                style={{
                  border: a4Copies > 1 ? '1px dashed #94a3b8' : 'none',
                  padding: a4Copies > 1 ? '2mm' : '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  maxHeight:
                    a4Copies === 1
                      ? '260mm'
                      : a4Copies === 2
                      ? '130mm'
                      : a4Copies === 4
                      ? '125mm'
                      : '60mm'
                }}
              >
                {finalCompositeUrl && (
                  <img
                    src={finalCompositeUrl}
                    alt={`Salinan Cetakan A4 #${index + 1}`}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER & NOTIS PRIVASI BAHASA MELAYU */}
      <footer className="bg-indigo-950 text-blue-100 border-t-4 border-yellow-400 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-yellow-400 shrink-0" />
            <p className="text-xs sm:text-sm font-medium text-blue-100">
              “Gambar anda digunakan untuk menghasilkan avatar dan cetakan dalam aplikasi ini. Gambar tidak dimuat naik atau disimpan secara kekal oleh aplikasi ini secara lalai.”
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleClearAllSessionData}
              className="text-xs font-bold text-yellow-300 hover:text-yellow-200 underline"
            >
              Padam Semua Gambar Sesi
            </button>
            <span className="text-xs text-blue-300">• AvatarKu 3D Studio</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
