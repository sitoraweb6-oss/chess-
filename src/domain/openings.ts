/**
 * Curated Chess Openings & Gambits Domain Layer for "ওপেনিং শেখো"
 * 11 Openings + 7 Gambits (18 items total)
 * Validated with chess.js at module initialization.
 * "দাবা শিক্ষক" - Daba Shikkhok
 */

import { Chess } from 'chess.js';

export interface OpeningMoveDetail {
  ply: number;
  san: string;
  uci: string;
  explanationBn: string;
}

export interface OpeningTrap {
  id: string;
  name: string;
  nameBn: string;
  descriptionBn: string;
  movesSan: string[];
}

export interface OpeningVariation {
  id: string;
  name: string;
  nameBn: string;
  movesSan: string[];
  descriptionBn: string;
}

export interface GambitDetails {
  sacrificeBn: string;
  compensationBn: string;
  refutationBn: string;
}

export interface ChessOpening {
  id: string;
  name: string;
  nameBn: string;
  eco: string;
  category: 'opening' | 'gambit';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  difficultyBn: 'সহজ' | 'মাঝারি' | 'অগ্রসর';
  forColor: 'white' | 'black';
  forColorBn: 'সাদা' | 'কালো';
  mainIdeaLines: [string, string];
  moves: OpeningMoveDetail[];
  variations: OpeningVariation[];
  middlegamePlans: [string, string, string];
  typicalMistakes: [string, string];
  traps: [OpeningTrap, OpeningTrap];
  gambitDetails?: GambitDetails;
}

export const OPENINGS_DATA: ChessOpening[] = [
  // 1. Italian Game
  {
    id: 'italian-game',
    name: 'Italian Game',
    nameBn: 'ইতালিয়ান গেম',
    eco: 'C50',
    category: 'opening',
    difficulty: 'beginner',
    difficultyBn: 'সহজ',
    forColor: 'white',
    forColorBn: 'সাদা',
    mainIdeaLines: [
      'সাদা দ্রুত কেন্দ্র নিয়ন্ত্রণ ও রাজার নিরাপত্তা (ক্যাসলিং) নিশ্চিত করে।',
      'c4 হাতি দিয়ে কালোর সবচেয়ে দুর্বল ঘর f7-এ তীব্র চাপ তৈরি করা হয়।',
    ],
    moves: [
      { ply: 1, san: 'e4', uci: 'e2e4', explanationBn: 'কেন্দ্র দখল ও হাতি ও রানীর পথ উন্মুক্ত করা।' },
      { ply: 2, san: 'e5', uci: 'e7e5', explanationBn: 'কালোর কেন্দ্রে সমতা আনার প্রথম পদক্ষেপ।' },
      { ply: 3, san: 'Nf3', uci: 'g1f3', explanationBn: 'e5 সৈন্য আক্রমণ এবং রাজাপক্ষের দ্রুত উন্নতি।' },
      { ply: 4, san: 'Nc6', uci: 'b8c6', explanationBn: 'e5 সৈন্য রক্ষা ও কেন্দ্রের একটি ঘর নিয়ন্ত্রণ।' },
      { ply: 5, san: 'Bc4', uci: 'f1c4', explanationBn: 'f7 দুর্বল ঘরে তাক করা এবং দ্রুত ক্যাসলিংয়ের প্রস্তুতি।' },
      { ply: 6, san: 'Bc5', uci: 'f8c5', explanationBn: 'কালোর হাতি সক্রিয় করে কেন্দ্র নিয়ন্ত্রণ (Giuoco Piano)।' },
      { ply: 7, san: 'c3', uci: 'c2c3', explanationBn: 'd4 চালের ভিত্তি তৈরি করে কেন্দ্র দখলের প্রস্তুতি।' },
      { ply: 8, san: 'Nf6', uci: 'g8f6', explanationBn: 'সাদার e4 সৈন্য আক্রমণ ও প্রতি-আক্রমণ শুরু।' },
      { ply: 9, san: 'd3', uci: 'd2d3', explanationBn: 'e4 সৈন্যের প্রতিরক্ষা ও পজিশনাল ভারসাম্য রক্ষা।' },
      { ply: 10, san: 'O-O', uci: 'e8g8', explanationBn: 'কালোর রাজাকে নিরাপদে ক্যাসলিং সম্পন্ন করা।' },
    ],
    variations: [
      {
        id: 'italian-two-knights',
        name: 'Two Knights Defense',
        nameBn: 'টু নাইটস ডিফেন্স',
        movesSan: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'd3', 'Bc5'],
        descriptionBn: 'কালো আক্রমণাত্মকভাবে নিজের ঘোড়া এগিয়ে দিয়ে পাল্টা চ্যালেঞ্জ ছুড়ে দেয়।',
      },
    ],
    middlegamePlans: [
      'd3 ও c3 দিয়ে শক্ত কেন্দ্র তৈরি করে রাজাপক্ষে সুরক্ষা রাখা।',
      'f7 ঘরের দুর্বলতায় হাতি ও ঘোড়ার চাপ বজায় রাখা।',
      'h3 খেলে কালোর Bg4 পিন প্রতিরোধ করা।',
    ],
    typicalMistakes: [
      'শুরুতেই অযথা d4 ঠেলে কেন্দ্র তাড়াতাড়ি উন্মুক্ত করে দেওয়া।',
      'c4 হাতি অরক্ষিত রেখে f7 আক্রমণ করতে গিয়ে ট্র্যাপে পড়া।',
    ],
    traps: [
      {
        id: 'italian-blackburne',
        name: 'Blackburne Shilling Trap',
        nameBn: 'ব্ল্যাকবার্ন শিলিং ট্র্যাপ',
        descriptionBn: 'সাদা অসতর্কভাবে e5 সৈন্য খেতে গেলে কালো রানী নিয়ে ভয়ঙ্কর আক্রমণ গড়ে তোলে।',
        movesSan: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nd4', 'Nxe5', 'Qg5', 'Bxf7+', 'Ke7'],
      },
      {
        id: 'italian-legals',
        name: "Legal's Mate Trap",
        nameBn: 'লেগালস মেট ট্র্যাপ',
        descriptionBn: 'রানীর টোপ দিয়ে কালোকে বিভ্রান্ত করে মাত্র তিনটি হালকা ঘুঁটি দিয়ে সুন্দর চেকমেট!',
        movesSan: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'd6', 'Nc3', 'Bg4', 'h3', 'Bh5', 'Nxe5', 'Bxd1', 'Bxf7+', 'Ke7', 'Nd5#'],
      },
    ],
  },

  // 2. Ruy Lopez
  {
    id: 'ruy-lopez',
    name: 'Ruy Lopez',
    nameBn: 'রুই লোপেজ (স্প্যানিশ)',
    eco: 'C60',
    category: 'opening',
    difficulty: 'intermediate',
    difficultyBn: 'মাঝারি',
    forColor: 'white',
    forColorBn: 'সাদা',
    mainIdeaLines: [
      'কালোর e5 সৈন্যের মূল রক্ষক c6 ঘোড়াকে আক্রমণ করে কৌশলগত চাপ সৃষ্টি করা।',
      'সবচেয়ে ক্লাসিক্যাল ওপেনিং যা সঠিক পজিশনাল খেলার মূল ভিত্তি শেখায়।',
    ],
    moves: [
      { ply: 1, san: 'e4', uci: 'e2e4', explanationBn: 'কেন্দ্রের নিয়ন্ত্রণ শুরু করা।' },
      { ply: 2, san: 'e5', uci: 'e7e5', explanationBn: 'কালোর কেন্দ্রীয় সমান অংশীদারিত্ব।' },
      { ply: 3, san: 'Nf3', uci: 'g1f3', explanationBn: 'e5 আক্রমণ ও ঘোড়ার উন্নতি।' },
      { ply: 4, san: 'Nc6', uci: 'b8c6', explanationBn: 'ঘোড়া দিয়ে সৈন্যের নিরাপত্তা নিশ্চিত করা।' },
      { ply: 5, san: 'Bb5', uci: 'f1b5', explanationBn: 'c6 ঘোড়া পিন করে e5 সৈন্যের ওপর পরোক্ষ চাপ তৈরি।' },
      { ply: 6, san: 'a6', uci: 'a7a6', explanationBn: 'মর্ফি ডিফেন্স: সাদার হাতিকে অবিলম্বে সিদ্ধান্ত নিতে বাধ্য করা।' },
      { ply: 7, san: 'Ba4', uci: 'b5a4', explanationBn: 'হাতির তির্যক আক্রমণ অক্ষুণ্ণ রেখে পিছু হটা।' },
      { ply: 8, san: 'Nf6', uci: 'g8f6', explanationBn: 'সাদার e4 সৈন্য আক্রমণ ও প্রতিদ্বন্দিতা বাড়ানো।' },
      { ply: 9, san: 'O-O', uci: 'e1g1', explanationBn: 'সাদার রাজাকে ক্যাসলিং করে নিরাপদ আশ্রয়ে নেওয়া।' },
      { ply: 10, san: 'Be7', uci: 'f8e7', explanationBn: 'কালোর রাজাপক্ষ ক্যাসলিংয়ের প্রস্তুতি ও পিন মুক্ত হওয়া।' },
    ],
    variations: [
      {
        id: 'ruy-berlin',
        name: 'Berlin Defense',
        nameBn: 'বার্লিন ডিফেন্স',
        movesSan: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6', 'O-O', 'Nxe4'],
        descriptionBn: 'অভেদ্য প্রাচীরের মতো কালোর অতি নির্ভরযোগ্য পজিশনাল পছন্দ।',
      },
    ],
    middlegamePlans: [
      'Re1 ও c3 খেলে d4 ঠেলে কেন্দ্রে স্থায়ী আধিপত্য প্রতিষ্ঠা।',
      'Bb3 হাতিকে কুইনসাইড ও রাজাপক্ষের সংযোগস্থলে শক্তিশালী রাখা।',
      'Nbd2-f1-g3 চালের মাধ্যমে ঘোড়াকে রাজাপক্ষে যুক্ত করা।',
    ],
    typicalMistakes: [
      'a6 এর পর অকারণে Bxc6 দিয়ে কালোর d-ফাইল উন্মুক্ত করে দেওয়া।',
      'ক্যাসলিং অযথা বিলম্ব করা।',
    ],
    traps: [
      {
        id: 'ruy-noahs-ark',
        name: "Noah's Ark Trap",
        nameBn: "নোয়াস আর্ক ট্র্যাপ",
        descriptionBn: 'সাদা অসতর্কভাবে খেললে কুইনসাইডের সৈন্যরা সাদার লাইট-স্কয়ার হাতিকে বন্দি করে ফেলে!',
        movesSan: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'd6', 'd4', 'b5', 'Bb3', 'Nxd4', 'Nxd4', 'exd4', 'Qxd4', 'c5', 'Qd5', 'Be6', 'Qc6+', 'Bd7', 'Qd5', 'c4'],
      },
      {
        id: 'ruy-tarrasch',
        name: 'Tarrasch Trap',
        nameBn: 'তারাশ ট্র্যাপ',
        descriptionBn: 'হাতি ও রুকের পিনের মাধ্যমে প্রতিপক্ষের মূল্যবান ঘোড়া জিতে নেওয়া।',
        movesSan: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Nxe4', 'd4', 'b5', 'Bb3', 'd5', 'dxe5', 'Be6', 'c3', 'Be7', 'Re1', 'O-O', 'Nd4', 'Qd7'],
      },
    ],
  },

  // 3. Sicilian Defense
  {
    id: 'sicilian-defense',
    name: 'Sicilian Defense',
    nameBn: 'সিসিলিয়ান ডিফেন্স',
    eco: 'B20',
    category: 'opening',
    difficulty: 'advanced',
    difficultyBn: 'অগ্রসর',
    forColor: 'black',
    forColorBn: 'কালো',
    mainIdeaLines: [
      '১ম চালেই বিষমমাত্রিক (asymmetrical) লড়াই তৈরি করে সাদার জয়ের লক্ষ্য প্রতিহত করা।',
      'c-ফাইল উন্মুক্ত করে রানীর পক্ষে আক্রমণ ও কেন্দ্রে অতিরিক্ত সৈন্যের সুবিধা নেওয়া।',
    ],
    moves: [
      { ply: 1, san: 'e4', uci: 'e2e4', explanationBn: 'সাদার রাজাপক্ষের কেন্দ্র বিস্তার।' },
      { ply: 2, san: 'c5', uci: 'c7c5', explanationBn: 'সিসিলিয়ান চাল: d4 ঘর নিয়ন্ত্রণ ও বিষম আক্রমণ।' },
      { ply: 3, san: 'Nf3', uci: 'g1f3', explanationBn: 'সাদার d4 ঠেলার প্রস্তুতি ও ঘোড়া সক্রিয় করা।' },
      { ply: 4, san: 'd6', uci: 'd7d6', explanationBn: 'e5 ঠেকানো ও c8 হাতির পথ উন্মুক্ত করা।' },
      { ply: 5, san: 'd4', uci: 'd2d4', explanationBn: 'ওপেন সিসিলিয়ান: কেন্দ্র উন্মুক্ত করার সাহসী পদক্ষেপ।' },
      { ply: 6, san: 'cxd4', uci: 'c5d4', explanationBn: 'ফ্ল্যাঙ্ক সৈন্য দিয়ে সাদার কেন্দ্রীয় সৈন্য বিনিময়।' },
      { ply: 7, san: 'Nxd4', uci: 'f3d4', explanationBn: 'সাদা কেন্দ্রে ঘোড়া স্থাপন করল।' },
      { ply: 8, san: 'Nf6', uci: 'g8f6', explanationBn: 'সাদার e4 সৈন্যের ওপর চাপ বৃদ্ধি।' },
      { ply: 9, san: 'Nc3', uci: 'b1c3', explanationBn: 'e4 প্রতিরক্ষা ও দ্বিতীয় ঘোড়ার উন্নতি।' },
      { ply: 10, san: 'a6', uci: 'a7a6', explanationBn: 'বিখ্যাত নাইডর্ফ ভ্যারিয়েশন (Najdorf): Nb5 ও Bb5 প্রতিরোধ।' },
    ],
    variations: [
      {
        id: 'sicilian-dragon',
        name: 'Dragon Variation',
        nameBn: 'ড্রাগন ভ্যারিয়েশন',
        movesSan: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6'],
        descriptionBn: 'g7-এ ড্রাগন হাতির উন্মুক্ত তির্যক আক্রমণের বিখ্যাত রূপভেদ।',
      },
    ],
    middlegamePlans: [
      'অর্ধ-উন্মুক্ত c-ফাইলে রুক বসিয়ে সাদার কুইনসাইডে চাপ প্রয়োগ।',
      'e5 বা d5 ব্রেকের মাধ্যমে কেন্দ্রের নিয়ন্ত্রণ ফিরিয়ে নেওয়া।',
      'সাদার রাজাপক্ষের আক্রমণ সাবধানে প্রতিহত করে অ্যান্ডগেমে জেতা।',
    ],
    typicalMistakes: [
      'ক্যাসলিং দেরি করে d6 ও f7 ঘরে সাদার স্যাক্রিফাইসে ধ্বংস হওয়া।',
      'কুইনসাইডে অতিরিক্ত ব্যস্ত হয়ে নিজের রাজার প্রতিরক্ষা ভুলে যাওয়া।',
    ],
    traps: [
      {
        id: 'sicilian-magnus',
        name: 'Magnus Smith Trap',
        nameBn: 'ম্যাগনেস স্মিথ ট্র্যাপ',
        descriptionBn: 'কালো অসাবধানে খেলে সাদার ঘোড়া ও রানীর যুগলবন্দিতে মেট হয়ে যায়।',
        movesSan: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'Nc6', 'Bc4', 'g6', 'Nxc6', 'bxc6', 'e5', 'dxe5', 'Bxf7+'],
      },
      {
        id: 'sicilian-siberian',
        name: 'Siberian Trap',
        nameBn: 'সাইবেরিয়ান ট্র্যাপ',
        descriptionBn: 'স্মিথ-মোরায় কালো ঘোড়া ও রানী দিয়ে সাদার h2 ঘরে আকস্মিক চেকমেট দেয়।',
        movesSan: ['e4', 'c5', 'd4', 'cxd4', 'c3', 'dxc3', 'Nxc3', 'Nc6', 'Nf3', 'e6', 'Bc4', 'Qc7', 'O-O', 'Nf6', 'Qe2', 'Ng4', 'h3', 'Nd4'],
      },
    ],
  },

  // 4. French Defense
  {
    id: 'french-defense',
    name: 'French Defense',
    nameBn: 'ফ্রেঞ্চ ডিফেন্স',
    eco: 'C00',
    category: 'opening',
    difficulty: 'intermediate',
    difficultyBn: 'মাঝারি',
    forColor: 'black',
    forColorBn: 'কালো',
    mainIdeaLines: [
      'e6 ও d5 দিয়ে সাদার e4 কে সরাসরি আক্রমণ ও শক্ত প্রতিরক্ষামূলক চেইন।',
      'সাদার কেন্দ্রকে আটকে রেখে পরবর্তীতে c5 ও f6 দিয়ে ভাঙার পরিকল্পনা।',
    ],
    moves: [
      { ply: 1, san: 'e4', uci: 'e2e4', explanationBn: 'সাদা কেন্দ্র দখল করে।' },
      { ply: 2, san: 'e6', uci: 'e7e6', explanationBn: 'ফ্রেঞ্চ ডিফেন্সের প্রস্তুতি চাল।' },
      { ply: 3, san: 'd4', uci: 'd2d4', explanationBn: 'সাদা পূর্ণ কেন্দ্র দখল করে।' },
      { ply: 4, san: 'd5', uci: 'd7d5', explanationBn: 'সাদার e4 সৈন্যকে সরাসরি আক্রমণ।' },
      { ply: 5, san: 'Nc3', uci: 'b1c3', explanationBn: 'পল ডিফেন্স: e4 কে রক্ষা করে ঘোড়ার উন্নতি।' },
      { ply: 6, san: 'Nf6', uci: 'g8f6', explanationBn: 'ক্লাসিক্যাল রূপভেদ: e4 কে আবার আক্রমণ।' },
      { ply: 7, san: 'e5', uci: 'e4e5', explanationBn: 'সাদা সৈন্য এগিয়ে দিয়ে কালোর ঘোড়াকে সরায়।' },
      { ply: 8, san: 'Nfd7', uci: 'f6d7', explanationBn: 'ঘোড়া পিছিয়ে d7 এ নিরাপদ আশ্রয় নেয়।' },
      { ply: 9, san: 'f4', uci: 'f2f4', explanationBn: 'সাদা e5 সৈন্য চেইন মজবুত করে।' },
      { ply: 10, san: 'c5', uci: 'c7c5', explanationBn: 'কালোর পাল্টা আঘাত: সাদার d4 ভিত্তিমূল্যের ওপর আক্রমণ!' },
    ],
    variations: [
      {
        id: 'french-advance',
        name: 'Advance Variation',
        nameBn: 'অ্যাডভান্স ভ্যারিয়েশন',
        movesSan: ['e4', 'e6', 'd4', 'd5', 'e5', 'c5', 'c3', 'Nc6', 'Nf3', 'Qb6'],
        descriptionBn: 'সাদা শুরুতেই e5 ঠেলে কেন্দ্র আটকে দেয়, কালো d4 এর ওপর প্রচণ্ড চাপ তোলে।',
      },
    ],
    middlegamePlans: [
      'c5, Nc6, ও Qb6 দিয়ে সাদার d4 সৈন্য চূর্ণ করা।',
      'সম্ভব হলে f6 ঠেলে সাদার e5 চেইন ভেঙে দেওয়া।',
      'c8 এর খারাপ লাইট-স্কয়ার হাতিকে b6 বা a6 হয়ে খেলায় সক্রিয় করা।',
    ],
    typicalMistakes: [
      'c8 হাতি আটকে রেখে নিষ্ক্রিয় খেলা।',
      'f7 ঘরের প্রতিরক্ষা শিথিল করে সাদার রাজাপক্ষের আক্রমণে পরাস্ত হওয়া।',
    ],
    traps: [
      {
        id: 'french-milner-barry',
        name: 'Milner-Barry Gambit Trap',
        nameBn: 'মিলনার-ব্যারি ট্র্যাপ',
        descriptionBn: 'সাদা d4 সৈন্যের লোভ দেখিয়ে কালোর রানীকে ফাঁদে ফেলে ও আক্রমণ গড়ে তোলে।',
        movesSan: ['e4', 'e6', 'd4', 'd5', 'e5', 'c5', 'c3', 'Nc6', 'Nf3', 'Qb6', 'Bd3', 'cxd4', 'cxd4', 'Bd7', 'O-O', 'Nxd4', 'Nxd4', 'Qxd4', 'Nc3', 'Qxe5', 'Re1', 'Qb8', 'Nxd5'],
      },
      {
        id: 'french-winawer',
        name: 'Winawer Trap',
        nameBn: 'উইনাওয়ার ট্র্যাপ',
        descriptionBn: 'হাতির পিন ও প্রতি-পিন দিয়ে দ্রুত সুবিধা আদায়।',
        movesSan: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4', 'e5', 'c5', 'a3', 'Bxc3+', 'bxc3', 'Ne7', 'Qg4', 'Qc7'],
      },
    ],
  },

  // 5. Caro-Kann Defense
  {
    id: 'caro-kann',
    name: 'Caro-Kann Defense',
    nameBn: 'কারো-কান ডিফেন্স',
    eco: 'B10',
    category: 'opening',
    difficulty: 'beginner',
    difficultyBn: 'সহজ',
    forColor: 'black',
    forColorBn: 'কালো',
    mainIdeaLines: [
      'ফ্রেঞ্চের মতোই শক্ত কেন্দ্র রক্ষা, কিন্তু c8 হাতিকে বাইরে সক্রিয় রাখার অপূর্ব সুবিধা।',
      'কোনো কাঠামোগত দুর্বলতা ছাড়া স্থিতিশীল অ্যান্ডগেমের পথে হাঁটার জন্য সেরা।',
    ],
    moves: [
      { ply: 1, san: 'e4', uci: 'e2e4', explanationBn: 'সাদা কেন্দ্রের দিকে পা বাড়ায়।' },
      { ply: 2, san: 'c6', uci: 'c7c6', explanationBn: 'কারো-কান চাল: d5 ঠেলার দৃঢ় প্রস্তুতি।' },
      { ply: 3, san: 'd4', uci: 'd2d4', explanationBn: 'সাদা আদর্শ কেন্দ্র দখল করে।' },
      { ply: 4, san: 'd5', uci: 'd7d5', explanationBn: 'e4 কে সরাসরি আক্রমণ করে কেন্দ্রে সমতা প্রতিষ্ঠা।' },
      { ply: 5, san: 'Nc3', uci: 'b1c3', explanationBn: 'সাদা সৈন্য রক্ষা ও ঘোড়ার উন্নতি করে।' },
      { ply: 6, san: 'dxe4', uci: 'd5e4', explanationBn: 'ক্লাসিক্যাল লাইন: কেন্দ্রীয় সৈন্য বিনিময়।' },
      { ply: 7, san: 'Nxe4', uci: 'c3e4', explanationBn: 'ঘোড়া দিয়ে সৈন্য ফেরত নেওয়া।' },
      { ply: 8, san: 'Bf5', uci: 'c8f5', explanationBn: 'চমৎকার চাল! হাতিকে সৈন্য চেইনের বাইরে এনে ঘোড়া আক্রমণ।' },
      { ply: 9, san: 'Ng3', uci: 'e4g3', explanationBn: 'সাদা ঘোড়া সরিয়ে উল্টো হাতিকে আক্রমণ করে।' },
      { ply: 10, san: 'Bg6', uci: 'f5g6', explanationBn: 'হাতি g6 তে নিরাপদ পশ্চাদপসরণ করে।' },
    ],
    variations: [
      {
        id: 'caro-advance',
        name: 'Advance Variation',
        nameBn: 'অ্যাডভান্স ভ্যারিয়েশন',
        movesSan: ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'Nf3', 'e6', 'Be2', 'c5'],
        descriptionBn: 'সাদা কেন্দ্র আটকে দিলে কালো c5 ও Bf5 দিয়ে সমানভাবে লড়াই করে।',
      },
    ],
    middlegamePlans: [
      'Bg6 হাতির সুরক্ষা নিশ্চিত করতে h6 খেলে রাখা।',
      'e6 ও c5 ঠেলে সাদার d4 সৈন্যের ভিত্তিমূল ভাঙা।',
      'অ্যান্ডগেমে কোনো স্থায়ী সৈন্য দুর্বলতা না থাকার সুবিধা কাজে লাগানো।',
    ],
    typicalMistakes: [
      'Bg6 হাতির জন্য h6 ঘর তৈরি না করে h4-h5 ঠেলে হাতি বন্দি হতে দেওয়া।',
      'কেন্দ্র উন্মুক্ত হওয়ার মুখে ক্যাসলিং দেরি করা।',
    ],
    traps: [
      {
        id: 'caro-smyslov',
        name: 'Smyslov Smothered Mate Trap',
        nameBn: 'স্মিসলভ স্মাদার্ড মেট ট্র্যাপ',
        descriptionBn: 'কালো ভুল করে ঘোড়ার উন্নতি করলে মাত্র ৬ষ্ঠ চালেই শ্বাসরুদ্ধকর চেকমেট!',
        movesSan: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nd7', 'Qe2', 'Ngf6', 'Nd6#'],
      },
      {
        id: 'caro-tal',
        name: 'Tal Trap',
        nameBn: 'তাল ট্র্যাপ',
        descriptionBn: 'h4-h5 খেলে কালোর লাইট-স্কয়ার হাতিকে কোণঠাসা করার কৌশল।',
        movesSan: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5', 'Ng3', 'Bg6', 'h4', 'h6', 'h5', 'Bh7', 'Bd3', 'Bxd3', 'Qxd3', 'e6'],
      },
    ],
  },

  // 6. Queen's Gambit
  {
    id: 'queens-gambit',
    name: "Queen's Gambit",
    nameBn: 'কুইন্স গ্যাম্বিট',
    eco: 'D06',
    category: 'opening',
    difficulty: 'intermediate',
    difficultyBn: 'মাঝারি',
    forColor: 'white',
    forColorBn: 'সাদা',
    mainIdeaLines: [
      'c4 দিয়ে কালোর কেন্দ্র d5 কে আঘাত করে দীর্ঘমেয়াদী পজিশনাল আধিপত্য তৈরি।',
      'বিশ্বচ্যাম্পিয়নদের সবচেয়ে ক্লাসিক্যাল ও মর্যাদাপূর্ণ ওপেনিং।',
    ],
    moves: [
      { ply: 1, san: 'd4', uci: 'd2d4', explanationBn: 'সাদা d4 ঠেলে সলিড কেন্দ্র নিয়ন্ত্রণ শুরু করে।' },
      { ply: 2, san: 'd5', uci: 'd7d5', explanationBn: 'কালো সমানভাবে কেন্দ্র প্রতিহত করে।' },
      { ply: 3, san: 'c4', uci: 'c2c4', explanationBn: 'কুইন্স গ্যাম্বিট! c4 দিয়ে d5 কে ভাঙার প্রস্তাব।' },
      { ply: 4, san: 'e6', uci: 'e7e6', explanationBn: 'গ্যাম্বিট প্রত্যাখ্যান (QGD): d5 সৈন্য চেইন সুরক্ষিত রাখা।' },
      { ply: 5, san: 'Nc3', uci: 'b1c3', explanationBn: 'd5 ঘরের ওপর অতিরিক্ত চাপ প্রয়োগ।' },
      { ply: 6, san: 'Nf6', uci: 'g8f6', explanationBn: 'ঘোড়া এগিয়ে কেন্দ্র প্রতিরক্ষা আরও শক্ত করা।' },
      { ply: 7, san: 'Bg5', uci: 'c1g5', explanationBn: 'Nf6 ঘোড়াকে পিন করে d5 এর মূল ডিফেন্ডারকে অচল করা।' },
      { ply: 8, san: 'Be7', uci: 'f8e7', explanationBn: 'পিন মুক্ত হওয়া ও রাজাপক্ষ ক্যাসলিংয়ের প্রস্তুতি।' },
      { ply: 9, san: 'e3', uci: 'e2e3', explanationBn: 'f1 হাতির পথ খুলে ক্যাসলিংয়ের রাস্তা পরিষ্কার করা।' },
      { ply: 10, san: 'O-O', uci: 'e8g8', explanationBn: 'কালো রাজাকে নিরাপদে ক্যাসলিং সম্পন্ন করল।' },
    ],
    variations: [
      {
        id: 'qg-slav',
        name: 'Slav Defense',
        nameBn: 'স্লাভ ডিফেন্স',
        movesSan: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'dxc4'],
        descriptionBn: 'c6 দিয়ে কেন্দ্র শক্ত রেখে c8 হাতির রাস্তা খোলা রাখার আধুনিক পছন্দ।',
      },
    ],
    middlegamePlans: [
      'c-ফাইল আংশিক উন্মুক্ত করে রুক সক্রিয় করা।',
      'e4 চালের পরিস্থিতি তৈরি করে সম্পূর্ণ কেন্দ্র কব্জা করা।',
      'কালোর কুইনসাইডের ওপর সংখ্যালঘু আক্রমণ (Minority Attack) পরিচালনা।',
    ],
    typicalMistakes: [
      'c4 সৈন্য খাওয়ার পর অহেতুক b5 দিয়ে তা ধরে রাখার ব্যর্থ চেষ্টা।',
      'কালোর c8 হাতির গতিপথ বন্ধ রেখে প্যাসিভ ডিফেন্স করা।',
    ],
    traps: [
      {
        id: 'qg-elephant',
        name: 'Elephant Trap',
        nameBn: 'এলিফ্যান্ট ট্র্যাপ',
        descriptionBn: 'সাদা অসাবধানে পিন ভেবে d5 সৈন্য খেতে গেলে কালো অসাধারণ ট্যাকটিক্সে রানী জিতে নেয়!',
        movesSan: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Nbd7', 'cxd5', 'exd5', 'Nxd5', 'Nxd5', 'Bxd8', 'Bb4+', 'Qd2', 'Bxd2+', 'Kxd2', 'Kxd8'],
      },
      {
        id: 'qg-rubinstein',
        name: 'Rubinstein Trap',
        nameBn: 'রুবিনস্টাইন ট্র্যাপ',
        descriptionBn: 'সাদা চালের শৃঙ্খলায় কালোর রানীকে ফাঁদে ফেলে জয় নিশ্চিত করে।',
        movesSan: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'cxd5', 'exd5', 'Bg5', 'Be7', 'e3', 'O-O', 'Bd3', 'Nbd7', 'Qc2', 'Re8', 'Nge2', 'Nf8', 'O-O', 'c6'],
      },
    ],
  },

  // 7. London System
  {
    id: 'london-system',
    name: 'London System',
    nameBn: 'লন্ডন সিস্টেম',
    eco: 'D02',
    category: 'opening',
    difficulty: 'beginner',
    difficultyBn: 'সহজ',
    forColor: 'white',
    forColorBn: 'সাদা',
    mainIdeaLines: [
      'Bf4 হাতিকে সৈন্য চেইনের বাইরে রেখে c3-d4-e3 এর অভেদ্য পিরামিড তৈরি।',
      'কঠিন লাইন মুখস্থ না করেও যেকোনো প্রতিপক্ষের বিপক্ষে নিরাপদ ও শক্তিশালী।',
    ],
    moves: [
      { ply: 1, san: 'd4', uci: 'd2d4', explanationBn: 'সাদা কেন্দ্র দখল করে।' },
      { ply: 2, san: 'd5', uci: 'd7d5', explanationBn: 'কালো কেন্দ্র প্রতিহত করে।' },
      { ply: 3, san: 'Bf4', uci: 'c1f4', explanationBn: 'লন্ডন হাতির আগমন! e3 এর আগেই হাতি বাইরে সক্রিয়।' },
      { ply: 4, san: 'Nf6', uci: 'g8f6', explanationBn: 'ঘোড়া এগিয়ে কেন্দ্র নিয়ন্ত্রণ শুরু।' },
      { ply: 5, san: 'e3', uci: 'e2e3', explanationBn: 'সৈন্য চেইন শক্ত করে f1 হাতির পথ খোলা।' },
      { ply: 6, san: 'e6', uci: 'e7e6', explanationBn: 'কালো সলিড ডিফেন্স গঠন করে।' },
      { ply: 7, san: 'Nf3', uci: 'g1f3', explanationBn: 'ঘোড়ার উন্নতি ও Ne5 এর সম্ভাব্য প্রস্তুতি।' },
      { ply: 8, san: 'c5', uci: 'c7c5', explanationBn: 'কালোর কেন্দ্রীয় পাল্টা আঘাত।' },
      { ply: 9, san: 'c3', uci: 'c2c3', explanationBn: 'লন্ডনের বিখ্যাত পিরামিড তৈরি: d4 সৈন্যের অটুট ভিত্তি!' },
      { ply: 10, san: 'Nc6', uci: 'b8c6', explanationBn: 'কালো কেন্দ্রে চাপ বাড়ায়।' },
    ],
    variations: [
      {
        id: 'london-steinitz',
        name: 'Steinitz Counter',
        nameBn: 'স্টেইনিৎস কাউন্টার',
        movesSan: ['d4', 'd5', 'Bf4', 'c5', 'e3', 'Nc6', 'c3', 'Qb6'],
        descriptionBn: 'কালো রানী দিয়ে b2 সৈন্যে চাপ দিয়ে লন্ডনের ভিত নাড়িয়ে দিতে চায়।',
      },
    ],
    middlegamePlans: [
      'Ne5 ঘরে শক্তিশালী ঘোড়া বসিয়ে রাজাপক্ষে আক্রমণ শুরু।',
      'Bd3 দিয়ে h7 দুর্বল ঘরে চোখ রাখা।',
      'কালো Qb6 খেললে Qb3 বা Qc2 দিয়ে শান্তভাবে সামলানো।',
    ],
    typicalMistakes: [
      'Bf4 খেলার আগেই তাড়াহুড়ো করে e3 খেলে নিজের লাইট-স্কয়ার হাতি ভেতরে আটকে ফেলা।',
      'কুইনসাইডে কালোর আক্রমণে বিভ্রান্ত হয়ে কেন্দ্র শিথিল করা।',
    ],
    traps: [
      {
        id: 'london-trap-1',
        name: 'London Knight Trap',
        nameBn: 'লন্ডন নাইট ট্র্যাপ',
        descriptionBn: 'কালো অতিরিক্ত আগ্রাসী হলে সাদার ঘোড়া ও হাতির পাল্টা কাউন্টারে পিন হয়ে যায়।',
        movesSan: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'c5', 'c3', 'Nc6', 'Nd2', 'Qb6', 'Qb3', 'c4', 'Qc2', 'g6', 'e4', 'Nxe4', 'Nxe4', 'Bf5'],
      },
      {
        id: 'london-fork',
        name: 'Queen Trap in London',
        nameBn: 'কুইন ট্র্যাপ ইন লন্ডন',
        descriptionBn: 'কালো b2 সৈন্য খাওয়ার লোভ সামলাতে না পেরে রানী হারিয়ে ফেলে!',
        movesSan: ['d4', 'Nf6', 'Bf4', 'c5', 'e3', 'Qb6', 'Nc3', 'Qxb2', 'Nb5', 'Nd5', 'Rb1', 'Qxa2', 'Ra1', 'Qb2'],
      },
    ],
  },

  // 8. King's Indian Defense
  {
    id: 'kings-indian',
    name: "King's Indian Defense",
    nameBn: 'কিংস ইন্ডিয়ান ডিফেন্স',
    eco: 'E60',
    category: 'opening',
    difficulty: 'advanced',
    difficultyBn: 'অগ্রসর',
    forColor: 'black',
    forColorBn: 'কালো',
    mainIdeaLines: [
      'সাদাকে কেন্দ্র দখল করতে দিয়ে দূর থেকে ফিয়ানকেতো হাতি (g7) দিয়ে আক্রমণ।',
      'মাঝখেলায় f5 ঠেলে সাদার রাজার দিকে সরাসরি বিধ্বংসী ঝড় তোলা।',
    ],
    moves: [
      { ply: 1, san: 'd4', uci: 'd2d4', explanationBn: 'সাদা কেন্দ্র দখল করে।' },
      { ply: 2, san: 'Nf6', uci: 'g8f6', explanationBn: 'ঘোড়া দিয়ে সাদার e4 ঠেকানো।' },
      { ply: 3, san: 'c4', uci: 'c2c4', explanationBn: 'সাদার প্রশস্ত কেন্দ্র দখলের প্রস্তুতি।' },
      { ply: 4, san: 'g6', uci: 'g7g6', explanationBn: 'কিংস ইন্ডিয়ানের প্রতীক: হাতি ফিয়ানকেতো করার চাল।' },
      { ply: 5, san: 'Nc3', uci: 'b1c3', explanationBn: 'সাদা e4 ঠেলার ভিত্তি স্থাপন করে।' },
      { ply: 6, san: 'Bg7', uci: 'f8g7', explanationBn: 'হাতি দীর্ঘ তির্যক লাইনে বসল।' },
      { ply: 7, san: 'e4', uci: 'e2e4', explanationBn: 'সাদা পূর্ণ বৃহৎ কেন্দ্র গড়ে তুলল।' },
      { ply: 8, san: 'd6', uci: 'd7d6', explanationBn: 'e5 সৈন্যের অগ্রগতি ঠেকানো।' },
      { ply: 9, san: 'Nf3', uci: 'g1f3', explanationBn: 'সাদার স্বাভাবিক উন্নতি।' },
      { ply: 10, san: 'O-O', uci: 'e8g8', explanationBn: 'কালো রাজাকে সুরক্ষিত ক্যাসলিং করল।' },
    ],
    variations: [
      {
        id: 'kid-mar-del-plata',
        name: 'Mar del Plata Attack',
        nameBn: 'মার দেল প্লাতা আক্রমণ',
        movesSan: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5'],
        descriptionBn: 'e5 ঠেলে কেন্দ্র বন্ধ করে f5 চালের মাধ্যমে রাজাপক্ষে অল-আউট আক্রমণ।',
      },
    ],
    middlegamePlans: [
      'e5 ঠেলে কেন্দ্র আটকে দিয়ে f5 ও g5 চালের মাধ্যমে সাদার রাজাকে আক্রমণ।',
      'g7 এর ডার্ক-স্কয়ার হাতির শক্তি পুরো বোর্ডে কাজে লাগানো।',
      'সাদার কুইনসাইডের অগ্রগতির বিপরীতে রাজাপক্ষে আগে চেকমেট করার দৌড়।',
    ],
    typicalMistakes: [
      'e5 না ঠেলে প্যাসিভ বসে থাকা এবং সাদার c-ফাইলের চাপে পিষ্ট হওয়া।',
      'সাদার কেন্দ্র বন্ধ হওয়ার পর f5 চাল দিতে দেরি করা।',
    ],
    traps: [
      {
        id: 'kid-trap-1',
        name: 'Arnin Trap',
        nameBn: 'আর্নিন ট্র্যাপ',
        descriptionBn: 'সাদা কেন্দ্র ভেঙে কালোর ডার্ক-স্কয়ার হাতির আক্রমণের মুখোমুখি হয়।',
        movesSan: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'dxe5', 'dxe5', 'Qxd8', 'Rxd8', 'Nxe5', 'Nxe4', 'Nxe4', 'Bxe5'],
      },
      {
        id: 'kid-charbis',
        name: 'Charbis Trap',
        nameBn: 'চার্বিস ট্র্যাপ',
        descriptionBn: 'রানী পিন এড়িয়ে বিপরীত আক্রমণ গড়ে তোলার সুন্দর কৌশল।',
        movesSan: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Be2', 'O-O', 'Bg5', 'c5', 'd5', 'Qa5', 'Bd2', 'e6'],
      },
    ],
  },

  // 9. Scandinavian Defense
  {
    id: 'scandinavian-defense',
    name: 'Scandinavian Defense',
    nameBn: 'স্ক্যান্ডিনেভিয়ান ডিফেন্স',
    eco: 'B01',
    category: 'opening',
    difficulty: 'beginner',
    difficultyBn: 'সহজ',
    forColor: 'black',
    forColorBn: 'কালো',
    mainIdeaLines: [
      '১ম চালেই সাদার e4 কে d5 দিয়ে চূর্ণ করে খেলা উন্মুক্ত করা।',
      'রানীকে নিরাপদ ঘরে (Qa5 বা Qd6) রেখে দ্রুত ঘুঁটি সক্রিয় করা।',
    ],
    moves: [
      { ply: 1, san: 'e4', uci: 'e2e4', explanationBn: 'সাদা কেন্দ্র দখল করে।' },
      { ply: 2, san: 'd5', uci: 'd7d5', explanationBn: 'স্ক্যান্ডিনেভিয়ান চাল: ১ম চালেই কেন্দ্র আক্রমণ!' },
      { ply: 3, san: 'exd5', uci: 'e4d5', explanationBn: 'সাদা সৈন্য খায়।' },
      { ply: 4, san: 'Qxd5', uci: 'd8d5', explanationBn: 'রানী দিয়ে সৈন্য ফেরত নেওয়া।' },
      { ply: 5, san: 'Nc3', uci: 'b1c3', explanationBn: 'ঘোড়ার উন্নতি ও কালোর রানীর ওপর টেম্পো আক্রমণ।' },
      { ply: 6, san: 'Qa5', uci: 'd5a5', explanationBn: 'রানী a5 ঘরে নিরাপদ ও সক্রিয় আশ্রয়ে সরে।' },
      { ply: 7, san: 'd4', uci: 'd2d4', explanationBn: 'সাদা কেন্দ্রে পূর্ণ আধিপত্য নেয়।' },
      { ply: 8, san: 'Nf6', uci: 'g8f6', explanationBn: 'ঘোড়া কেন্দ্র নিয়ন্ত্রণে অংশ নেয়।' },
      { ply: 9, san: 'Nf3', uci: 'g1f3', explanationBn: 'সাদার স্বাভাবিক উন্নতি।' },
      { ply: 10, san: 'c6', uci: 'c7c6', explanationBn: 'রানীর পশ্চাদপসরণের রাস্তা রাখা ও কেন্দ্র শক্ত করা।' },
    ],
    variations: [
      {
        id: 'scan-modern',
        name: 'Modern 2...Nf6',
        nameBn: 'মডার্ন ভ্যারিয়েশন',
        movesSan: ['e4', 'd5', 'exd5', 'Nf6', 'd4', 'Nxd5', 'Nf3', 'g6'],
        descriptionBn: 'রানী তাড়াতাড়ি না বের করে ঘোড়া দিয়ে সৈন্য ফেরত নেওয়ার চমৎকার পথ।',
      },
    ],
    middlegamePlans: [
      'Bf5 হাতিকে বের করে e6 ও c6 সৈন্য কাঠামোতে শক্ত থাকা।',
      'প্রয়োজনে দীর্ঘ ক্যাসলিং (O-O-O) করে রাজাপক্ষে আক্রমণ শুরু করা।',
      'সাদার বাড়তি কেন্দ্রকে প্রতিহত করে পজিশনাল ভারসাম্য রক্ষা।',
    ],
    typicalMistakes: [
      'রানী নিয়ে বোর্ডে অতিরিক্ত দৌড়াদৌড়ি করে মূল্যবান টেম্পো নষ্ট করা।',
      'সাদার ঘোড়াগুলোর আক্রমণের নিশানা বুঝতে না পারা।',
    ],
    traps: [
      {
        id: 'scan-tennison',
        name: 'Tennison Gambit Trap',
        nameBn: 'টেনিসন গ্যাম্বিট ট্র্যাপ',
        descriptionBn: 'কালো অতিরিক্ত লোভ করে সৈন্য খেতে গিয়ে রাজাকে বের করে এনে রানী হারিয়ে ফেলে!',
        movesSan: ['e4', 'd5', 'Nf3', 'dxe4', 'Ng5', 'Nf6', 'd3', 'exd3', 'Bxd3', 'h6', 'Nxf7', 'Kxf7', 'Bg6+', 'Kxg6', 'Qxd8'],
      },
      {
        id: 'scan-blue',
        name: 'Blue Trap',
        nameBn: 'ব্লু ট্র্যাপ',
        descriptionBn: 'কেন্দ্রের সৈন্যের দুর্বলতা কাজে লাগিয়ে পিনের মাধ্যমে জয়।',
        movesSan: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5', 'd4', 'e5', 'dxe5', 'Bb4', 'Bd2', 'Nc6', 'Nf3', 'Bg4', 'a3', 'O-O-O'],
      },
    ],
  },

  // 10. English Opening
  {
    id: 'english-opening',
    name: 'English Opening',
    nameBn: 'ইংলিশ ওপেনিং',
    eco: 'A10',
    category: 'opening',
    difficulty: 'intermediate',
    difficultyBn: 'মাঝারি',
    forColor: 'white',
    forColorBn: 'সাদা',
    mainIdeaLines: [
      'c4 দিয়ে কেন্দ্র d5 ঘরের ওপর দূরপাল্লার আধিপত্য প্রতিষ্ঠা।',
      'জটিল সরাসরি সংঘর্ষ এড়িয়ে ধীরে ধীরে পজিশনাল শ্রেষ্ঠত্ব বৃদ্ধি।',
    ],
    moves: [
      { ply: 1, san: 'c4', uci: 'c2c4', explanationBn: 'ইংলিশ ওপেনিং: ফ্ল্যাঙ্ক থেকে কেন্দ্র d5 নিয়ন্ত্রণ।' },
      { ply: 2, san: 'e5', uci: 'e7e5', explanationBn: 'রিভার্সড সিসিলিয়ান: কালো কেন্দ্র দখল করে।' },
      { ply: 3, san: 'Nc3', uci: 'b1c3', explanationBn: 'ঘোড়ার উন্নতি ও d5 ঘর আরও শক্ত করা।' },
      { ply: 4, san: 'Nf6', uci: 'g8f6', explanationBn: 'কালোর স্বাভাবিক ঘুঁটি বিকাশ।' },
      { ply: 5, san: 'g3', uci: 'g2g3', explanationBn: 'Bg2 ফিয়ানকেতোর প্রস্তুতি।' },
      { ply: 6, san: 'd5', uci: 'd7d5', explanationBn: 'কালোর কেন্দ্রীয় ধাক্কা।' },
      { ply: 7, san: 'cxd5', uci: 'c4d5', explanationBn: 'সাদা কেন্দ্রীয় সৈন্য বিনিময় করল।' },
      { ply: 8, san: 'Nxd5', uci: 'f6d5', explanationBn: 'ঘোড়া দিয়ে সৈন্য ফেরত নেওয়া।' },
      { ply: 9, san: 'Bg2', uci: 'f1g2', explanationBn: 'শক্তিশালী হাতি দীর্ঘ তির্যক লাইনে বসে ঘোড়া আক্রমণ করে।' },
      { ply: 10, san: 'Nb6', uci: 'd5b6', explanationBn: 'ঘোড়া সরে গিয়ে নিরাপদ অবস্থান নিল।' },
    ],
    variations: [
      {
        id: 'english-symmetrical',
        name: 'Symmetrical English',
        nameBn: 'সিমেট্রিক্যাল ইংলিশ',
        movesSan: ['c4', 'c5', 'Nc3', 'Nc6', 'g3', 'g6', 'Bg2', 'Bg7'],
        descriptionBn: 'উভয় পক্ষ একই কাঠামোতে অত্যন্ত ভারসাম্যপূর্ণ পজিশনাল চাল দেয়।',
      },
    ],
    middlegamePlans: [
      'Bg2 হাতি ও রুক দিয়ে কুইনসাইডে চাপ অব্যাহত রাখা।',
      'd3 ও e4 খেলে কেন্দ্র সুসংহত করা।',
      'তাড়াহুড়ো না করে সঠিক সময় Rb1 ও b4 কুইনসাইড বিস্তার।',
    ],
    typicalMistakes: [
      'কেন্দ্রের কোনো প্রতিরক্ষা না রেখে কালোকে সহজে আক্রমণ করতে দেওয়া।',
      'g2 হাতির তির্যক লাইন ভুল করে নিজের ঘুঁটি দিয়ে আটকে ফেলা।',
    ],
    traps: [
      {
        id: 'english-belgrade',
        name: 'Belgrade Gambit Trap',
        nameBn: 'বেলগ্রেড ট্র্যাপ',
        descriptionBn: 'সাদা অসাবধানে পিন তৈরি করতে গিয়ে কালোর অসাধারণ পাল্টা চেকমেটের মুখে পড়ে!',
        movesSan: ['c4', 'e5', 'Nc3', 'Nf6', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Bb4', 'Bg5', 'h6', 'Bh4', 'Ne4', 'Bxd8', 'Nxc3', 'Qd3', 'Ne4+'],
      },
      {
        id: 'english-botvinnik',
        name: 'Botvinnik Trap',
        nameBn: 'বোতভিনিক ট্র্যাপ',
        descriptionBn: 'রানীর দ্রুত বিনিময় করিয়ে প্রতিপক্ষের রাজাকে মাঝে আটকে রাখা।',
        movesSan: ['c4', 'e5', 'Nc3', 'Nf6', 'g3', 'c6', 'd4', 'exd4', 'Qxd4', 'd5', 'Bg2', 'Be7', 'cxd5', 'cxd5', 'Nxd5', 'Nxd5', 'Qxd5', 'Bb4+', 'Bd2', 'Bxd2+', 'Qxd2', 'Qxd2+', 'Kxd2'],
      },
    ],
  },

  // 11. Vienna Game
  {
    id: 'vienna-game',
    name: 'Vienna Game',
    nameBn: 'ভিয়েনা গেম',
    eco: 'C25',
    category: 'opening',
    difficulty: 'beginner',
    difficultyBn: 'সহজ',
    forColor: 'white',
    forColorBn: 'সাদা',
    mainIdeaLines: [
      'Nf3 এর বদলে ২য় চালেই Nc3 খেলে f4 ঠেলার রাস্তা উন্মুক্ত রাখা।',
      'f-ফাইল উন্মুক্ত করে কালোর দুর্বল f7 ঘরে দ্রুত আক্রমণ নামিয়ে আনা।',
    ],
    moves: [
      { ply: 1, san: 'e4', uci: 'e2e4', explanationBn: 'সাদা কেন্দ্র দখল করে।' },
      { ply: 2, san: 'e5', uci: 'e7e5', explanationBn: 'কালোর কেন্দ্রীয় প্রতিদ্বন্দিতা।' },
      { ply: 3, san: 'Nc3', uci: 'b1c3', explanationBn: 'ভিয়েনা গেম! Nc3 খেলে কেন্দ্র রক্ষা ও f4 এর পথ রাখা।' },
      { ply: 4, san: 'Nf6', uci: 'g8f6', explanationBn: 'কালোর সেরা চাল: স্বাভাবিক ঘোড়ার উন্নতি।' },
      { ply: 5, san: 'f4', uci: 'f2f4', explanationBn: 'ভিয়েনা গ্যাম্বিট! কেন্দ্র ভাঙার আক্রমণাত্মক প্রস্তাব।' },
      { ply: 6, san: 'd5', uci: 'd7d5', explanationBn: 'কালোর আদর্শ প্রতি-আক্রমণ (Counter-strike)।' },
      { ply: 7, san: 'fxe5', uci: 'f4e5', explanationBn: 'সাদা ঘোড়া আক্রমণ করে সৈন্য খেল।' },
      { ply: 8, san: 'Nxe4', uci: 'f6e4', explanationBn: 'কালোর ঘোড়া কেন্দ্রে শক্তিশালী অবস্থান নিল।' },
      { ply: 9, san: 'Qf3', uci: 'd1f3', explanationBn: 'রানী সক্রিয় করে e4 ঘোড়ার ওপর চাপ সৃষ্টি।' },
      { ply: 10, san: 'Nc6', uci: 'b8c6', explanationBn: 'কালো ঘোড়া উন্নতি করে d4 ও e5 ঘরে চাপ বাড়াল।' },
    ],
    variations: [
      {
        id: 'vienna-max-lange',
        name: 'Max Lange Defense',
        nameBn: 'ম্যাক্স লাঙ্গে ডিফেন্স',
        movesSan: ['e4', 'e5', 'Nc3', 'Nc6', 'Bc4', 'Bc5', 'Qg4', 'g6', 'Qf3', 'Nf6'],
        descriptionBn: 'Bc4 ও Qg4 দিয়ে কালোর g7 ও f7 ঘরে আকস্মিক আক্রমণের ভিয়েনা স্টাইল।',
      },
    ],
    middlegamePlans: [
      'Nf3 ও d3 খেলে e4 ঘোড়া সরানো এবং রাজাপক্ষে রুক সক্রিয় করা।',
      'Bc4 হাতি দিয়ে f7 ঘরে ক্রমাগত হুমকি বজায় রাখা।',
      'দ্রুত O-O করে উন্মুক্ত f-ফাইলের পূর্ণ ফায়দা নেওয়া।',
    ],
    typicalMistakes: [
      'কালোর d5 পাল্টা ধাক্কায় ভীত হয়ে ভুল সৈন্য খাওয়া।',
      'নিজের রাজা উন্মুক্ত করে রেখে অযৌক্তিক আক্রমণ পরিচালনা।',
    ],
    traps: [
      {
        id: 'vienna-queen-trap',
        name: 'Vienna Queen Trap',
        nameBn: 'ভিয়েনা কুইন ট্র্যাপ',
        descriptionBn: 'কালো অসাবধানে খেলে সাদার সুসংগঠিত পাল্টা আক্রমণে রানী আটকা পড়ে!',
        movesSan: ['e4', 'e5', 'Nc3', 'Nc6', 'Bc4', 'Bc5', 'Qg4', 'Qf6', 'Nd5', 'Qxf2+', 'Kd1', 'Kf8', 'Nh3', 'Qd4', 'd3', 'd6', 'Qf3', 'Bxh3', 'Rf1'],
      },
      {
        id: 'vienna-hammerschlag',
        name: 'Hammerschlag Trap',
        nameBn: 'হ্যামারশ্লাগ ট্র্যাপ',
        descriptionBn: 'e5 সৈন্য ঠেলে কালোর ঘোড়াকে কোণঠাসা করার সহজ টেকনিক।',
        movesSan: ['e4', 'e5', 'Nc3', 'Nf6', 'f4', 'exf4', 'e5', 'Qe7', 'Qe2', 'Ng8', 'Nf3', 'c6', 'd4'],
      },
    ],
  },

  // 12. King's Gambit (Gambit 1)
  {
    id: 'kings-gambit',
    name: "King's Gambit",
    nameBn: 'কিংস গ্যাম্বিট',
    eco: 'C30',
    category: 'gambit',
    difficulty: 'advanced',
    difficultyBn: 'অগ্রসর',
    forColor: 'white',
    forColorBn: 'সাদা',
    mainIdeaLines: [
      '২য় চালেই f4 সৈন্য বিসর্জন দিয়ে কালোর e5 সৈন্যকে কেন্দ্রচ্যুত করা।',
      'দাবার ইতিহাসের সবচেয়ে রোমান্টিক ও শ্বাসরুদ্ধকর আক্রমণাত্মক ওপেনিং।',
    ],
    gambitDetails: {
      sacrificeBn: 'সাদা f2-f4 ঠেলে একটি সৈন্য বিসর্জন দেয় যাতে কেন্দ্র থেকে কালোর e5 সৈন্য সরে যায়।',
      compensationBn: 'দখলে আসে সম্পূর্ণ কেন্দ্র (d4), উন্মুক্ত f-ফাইল, এবং Bc4 হাতির সাহায্যে কালোর দুর্বল f7 ঘরে চরম আক্রমণ।',
      refutationBn: 'নিরাপদ পথ হলো ২...d5 (Falkbeer Counter-Gambit) অথবা ২...Bc5 খেলে গ্যাম্বিট প্রত্যাখ্যান করা।',
    },
    moves: [
      { ply: 1, san: 'e4', uci: 'e2e4', explanationBn: 'সাদা কেন্দ্র দখল করে।' },
      { ply: 2, san: 'e5', uci: 'e7e5', explanationBn: 'কালোর কেন্দ্রীয় প্রতিদ্বন্দিতা।' },
      { ply: 3, san: 'f4', uci: 'f2f4', explanationBn: 'কিংস গ্যাম্বিট! f4 সৈন্যের দুঃসাহসিক বলিদান।' },
      { ply: 4, san: 'exf4', uci: 'e5f4', explanationBn: 'কালো সৈন্য খেল (King’s Gambit Accepted)।' },
      { ply: 5, san: 'Nf3', uci: 'g1f3', explanationBn: 'ঘোড়ার উন্নতি এবং সবচেয়ে জরুরি: Qh4+ চেক প্রতিরোধ।' },
      { ply: 6, san: 'g5', uci: 'g7g5', explanationBn: 'কালো f4 সৈন্যকে পাহারা দিতে g5 এগিয়ে দিল।' },
      { ply: 7, san: 'Bc4', uci: 'f1c4', explanationBn: 'f7 দুর্বল ঘরে হাতির লক্ষ্যভেদ।' },
      { ply: 8, san: 'g4', uci: 'g5g4', explanationBn: 'কালো ঘোড়া আক্রমণ করে সরাতে চায়।' },
      { ply: 9, san: 'O-O', uci: 'e1g1', explanationBn: 'মুজিও গ্যাম্বিট (Muzio)! ঘোড়া বিসর্জন দিয়েও রাজাকে ক্যাসলিং ও আক্রমণ জোরদার।' },
      { ply: 10, san: 'gxf3', uci: 'g4f3', explanationBn: 'কালো ঘোড়া খেয়ে অতিরিক্ত ঘুঁটির সুবিধা নিল।' },
    ],
    variations: [
      {
        id: 'kg-falkbeer',
        name: 'Falkbeer Counter-Gambit',
        nameBn: 'ফকবীর কাউন্টার-গ্যাম্বিট',
        movesSan: ['e4', 'e5', 'f4', 'd5', 'exd5', 'e4', 'd3', 'Nf6', 'dxe4', 'Nxe4'],
        descriptionBn: 'কালো সৈন্য না খেয়ে পাল্টা d5 ঠেলে কেন্দ্র ভেঙে সাদার প্রস্তুতি ভেস্তে দেয়।',
      },
    ],
    middlegamePlans: [
      'f-ফাইলে রুক ও Qxf3 রানী এনে f7 ঘরে অবিরাম আঘাত করা।',
      'd4 ঠেলে কেন্দ্রে স্থায়ী আধিপত্য প্রতিষ্ঠা করা।',
      'কালো অতিরিক্ত ঘুঁটি সামলে রাজাকে নিরাপদে ক্যাসলিং করানো।',
    ],
    typicalMistakes: [
      'সাদার Qh4+ চেক প্রতিরোধ না করে খেলা এবং রাজা খোলা রেখে মেট হওয়া।',
      'সৈন্য বাঁচাতে গিয়ে কালো ঘুঁটির উন্নতি একেবারেই ভুলে যাওয়া।',
    ],
    traps: [
      {
        id: 'kg-cunningham',
        name: 'Cunningham Trap',
        nameBn: 'কানিংহাম ট্র্যাপ',
        descriptionBn: 'হাতির চেক দিয়ে রাজাকে ফাঁদে ফেলার ব্যর্থ চেষ্টা ও সাদার পাল্টা আক্রমণ।',
        movesSan: ['e4', 'e5', 'f4', 'exf4', 'Nf3', 'Be7', 'Bc4', 'Bh4+', 'g3', 'fxg3', 'O-O', 'gxh2+', 'Kh1'],
      },
      {
        id: 'kg-falkbeer-mate',
        name: 'Falkbeer Mate Trap',
        nameBn: 'ফকবীর মেট ট্র্যাপ',
        descriptionBn: 'সাদা অসতর্কভাবে খেললে কালোর হাতি ও ঘোড়া মিলে সাদার মাঝমাঠে মেট উপহার দেয়!',
        movesSan: ['e4', 'e5', 'f4', 'd5', 'exd5', 'c6', 'dxc6', 'Nxc6', 'd3', 'Bc5', 'Nf3', 'Nf6', 'fxe5', 'Ng4', 'd4', 'Nxd4', 'Nxd4', 'Bxd4'],
      },
    ],
  },

  // 13. Queen's Gambit Accepted (Gambit 2)
  {
    id: 'queens-gambit-accepted',
    name: "Queen's Gambit Accepted",
    nameBn: 'কুইন্স গ্যাম্বিট অ্যাক্সেপ্টেড',
    eco: 'D20',
    category: 'gambit',
    difficulty: 'intermediate',
    difficultyBn: 'মাঝারি',
    forColor: 'black',
    forColorBn: 'কালো',
    mainIdeaLines: [
      'c4 সৈন্য খেয়ে সাদার কেন্দ্র বিস্তারকে সাদরে গ্রহণ করা।',
      'সৈন্য ধরে রাখার লোভ না করে c5 ও a6 দিয়ে দ্রুত সমতা আনা।',
    ],
    gambitDetails: {
      sacrificeBn: 'সাদা c2-c4 সৈন্য দেয় কালোর মূল d5 সৈন্যকে কেন্দ্র থেকে অপসারণ করার জন্য।',
      compensationBn: 'সাদা খুব সহজেই Bxc4 দিয়ে সৈন্য ফেরত পায় এবং কেন্দ্রে e4 ঠেলে পূর্ণ নিয়ন্ত্রণ পায়।',
      refutationBn: 'কালো c4 ধরে রাখার কোনো চেষ্টা করবে না; বরং c5 ঠেলে সাদার d4 কেন্দ্র ধ্বংস করবে।',
    },
    moves: [
      { ply: 1, san: 'd4', uci: 'd2d4', explanationBn: 'সাদা d4 কেন্দ্র দখল করে।' },
      { ply: 2, san: 'd5', uci: 'd7d5', explanationBn: 'কালোর কেন্দ্রীয় অংশগ্রহণ।' },
      { ply: 3, san: 'c4', uci: 'c2c4', explanationBn: 'কুইন্স গ্যাম্বিটের আহ্বান।' },
      { ply: 4, san: 'dxc4', uci: 'd5c4', explanationBn: 'কালো সৈন্য খেল (QGA)।' },
      { ply: 5, san: 'Nf3', uci: 'g1f3', explanationBn: 'e5 প্রতিরোধ ও স্বাভাবিক ঘোড়ার উন্নতি।' },
      { ply: 6, san: 'Nf6', uci: 'g8f6', explanationBn: 'কালোর স্বাভাবিক উন্নতি।' },
      { ply: 7, san: 'e3', uci: 'e2e3', explanationBn: 'Bxc4 দিয়ে সৈন্য ফেরত নেওয়ার প্রস্তুতি।' },
      { ply: 8, san: 'e6', uci: 'e7e6', explanationBn: 'কালো সলিড ডিফেন্স ও ফিয়ানকেতো প্রস্তুতি নেয়।' },
      { ply: 9, san: 'Bxc4', uci: 'f1c4', explanationBn: 'হাতি দিয়ে c4 সৈন্য ফেরত নিল সাদা।' },
      { ply: 10, san: 'c5', uci: 'c7c5', explanationBn: 'সবচেয়ে সেরা চাল! সাদার d4 কেন্দ্রের ওপর তীব্র আঘাত।' },
    ],
    variations: [
      {
        id: 'qga-central',
        name: 'Central Push 3.e4',
        nameBn: 'সেন্ট্রাল পুশ ৩.e4',
        movesSan: ['d4', 'd5', 'c4', 'dxc4', 'e4', 'e5', 'Nf3', 'exd4', 'Bxc4', 'Nc6'],
        descriptionBn: 'সাদা সাথে সাথে পুরো কেন্দ্র দখল করতে চাইলে কালো e5 দিয়ে প্রতি-আক্রমণ করে।',
      },
    ],
    middlegamePlans: [
      'সাদা O-O ও Qe2 খেলে Rd1 দিয়ে কালোর কেন্দ্রের ওপর চাপ রাখবে।',
      'কালো a6 ও b5 ঠেলে কুইনসাইডে জায়গা তৈরি করে Bb7 হাতি সক্রিয় করবে।',
      'অ্যান্ডগেমে কোনো ত্রুটি না থাকায় কালো আত্মবিশ্বাসের সাথে খেলতে পারে।',
    ],
    typicalMistakes: [
      'b5 খেলে c4 সৈন্য বাঁচানোর চেষ্টা করে a4 চালের পর পুরো কুইনসাইড ও রুক হারানো।',
      'c5 না ঠেলে অলসভাবে বসে থাকা।',
    ],
    traps: [
      {
        id: 'qga-trap-rook',
        name: 'Queenside Rook Trap',
        nameBn: 'কুইনসাইড রুক ট্র্যাপ',
        descriptionBn: 'কালো লোভ করে b5 দিয়ে সৈন্য রক্ষা করতে গিয়ে Qf3 চালে আস্ত রুক হারায়!',
        movesSan: ['d4', 'd5', 'c4', 'dxc4', 'e3', 'b5', 'a4', 'c6', 'axb5', 'cxb5', 'Qf3'],
      },
      {
        id: 'qga-trap-bishop',
        name: 'Central Bishop Trap',
        nameBn: 'সেন্ট্রাল বিশপ ট্র্যাপ',
        descriptionBn: 'e5 পিনের মাধ্যমে মাঝমাঠে কালোর অসাবধানতা ধরে ফেলা।',
        movesSan: ['d4', 'd5', 'c4', 'dxc4', 'e4', 'e5', 'Nf3', 'exd4', 'Bxc4', 'Bb4+', 'Bd2', 'Bxd2+', 'Nbxd2', 'Nc6', 'O-O', 'Nf6', 'e5', 'Nd5'],
      },
    ],
  },

  // 14. Evans Gambit (Gambit 3)
  {
    id: 'evans-gambit',
    name: 'Evans Gambit',
    nameBn: 'ইভান্স গ্যাম্বিট',
    eco: 'C51',
    category: 'gambit',
    difficulty: 'advanced',
    difficultyBn: 'অগ্রসর',
    forColor: 'white',
    forColorBn: 'সাদা',
    mainIdeaLines: [
      'ইতালিয়ান গেমে ৪...Bc5 এর পর b4 ঠেলে সৈন্য বিসর্জন দিয়ে গতি লাভ।',
      'কাসপারভ ও অ্যান্ডারসনের প্রিয় গ্যাম্বিট যা বিদ্যুৎগতির আক্রমণ তৈরি করে।',
    ],
    gambitDetails: {
      sacrificeBn: 'সাদা b2-b4 সৈন্য বলি দেয় কালোর c5 হাতিকে বিচলিত ও টেম্পো হারানোর জন্য।',
      compensationBn: 'c3 ঠেলে d4 এর পূর্ণ প্রস্তুতি, টেম্পো লাভ, এবং Ba3 বা Qb3 দিয়ে কালোর ক্যাসলিং চিরতরে রোধ করা।',
      refutationBn: '৪...Bb6 খেলে গ্যাম্বিট পরিহার করা, অথবা লস্কর ডিফেন্স (Lasker Defense: d6 ও Bb6) খেলে অতিরিক্ত সৈন্য ফেরত দিয়ে খেলা।',
    },
    moves: [
      { ply: 1, san: 'e4', uci: 'e2e4', explanationBn: 'সাদা কেন্দ্র দখল করে।' },
      { ply: 2, san: 'e5', uci: 'e7e5', explanationBn: 'কালোর কেন্দ্রীয় প্রতিদ্বন্দিতা।' },
      { ply: 3, san: 'Nf3', uci: 'g1f3', explanationBn: 'ঘোড়ার উন্নতি ও e5 আক্রমণ।' },
      { ply: 4, san: 'Nc6', uci: 'b8c6', explanationBn: 'ঘোড়া দিয়ে সৈন্য রক্ষা।' },
      { ply: 5, san: 'Bc4', uci: 'f1c4', explanationBn: 'f7 ঘরের ওপর নজর।' },
      { ply: 6, san: 'Bc5', uci: 'f8c5', explanationBn: 'কালোর হাতি বিকাশ।' },
      { ply: 7, san: 'b4', uci: 'b2b4', explanationBn: 'ইভান্স গ্যাম্বিট! সাহসী b4 সৈন্যের ত্যাগ।' },
      { ply: 8, san: 'Bxb4', uci: 'c5b4', explanationBn: 'কালো হাতি দিয়ে সৈন্য খেল।' },
      { ply: 9, san: 'c3', uci: 'c2c3', explanationBn: 'হাতিকে আক্রমণ করে d4 এর ক্ষেত্র তৈরি।' },
      { ply: 10, san: 'Ba5', uci: 'b4a5', explanationBn: 'হাতি a5 ঘরে পিন বজায় রেখে সরে বসল।' },
    ],
    variations: [
      {
        id: 'evans-declined',
        name: 'Evans Declined',
        nameBn: 'ইভান্স ডিক্লাইন্ড',
        movesSan: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bb6', 'a4', 'a6', 'c3', 'Nf6'],
        descriptionBn: 'সৈন্য না খেয়ে হাতি Bb6 তে রেখে ঝামেলামুক্ত পজিশনাল খেলা।',
      },
    ],
    middlegamePlans: [
      'd4 ঠেলে কেন্দ্রে বিস্ফোরণ ঘটিয়ে Qb3 দিয়ে f7 আক্রমণ করা।',
      'Ba3 খেলে কালোর ক্যাসলিং আটকে রাজাকে মাঝমাঠে একাকী করা।',
      'কালো লস্কর প্ল্যান মতো d6 ও Bb6 খেলে সাদার গতি থামিয়ে দেওয়া।',
    ],
    typicalMistakes: [
      'অতিরিক্ত লোভ করে dxc3 ও cxb2 খেয়ে রাজার নিরাপত্তা সম্পূর্ণ বিলীন করা।',
      'Qb3 আসার পর f7 রক্ষায় ভুল ঘুঁটি চালানো।',
    ],
    traps: [
      {
        id: 'evans-trap-1',
        name: 'Evans Center Trap',
        nameBn: 'ইভান্স সেন্টার ট্র্যাপ',
        descriptionBn: 'd5 পিনের সাহায্যে কালোর অপ্রস্তুত নাইটকে মাঝমাঠে ফাঁদে ফেলা।',
        movesSan: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bxb4', 'c3', 'Bc5', 'd4', 'exd4', 'O-O', 'd6', 'cxd4', 'Bb6', 'Nc3', 'Bg4', 'Qa4', 'Bxf3', 'd5'],
      },
      {
        id: 'evans-compromised',
        name: 'Compromised Defense Trap',
        nameBn: 'কম্প্রোমাইজড ডিফেন্স ট্র্যাপ',
        descriptionBn: 'তিনটি সৈন্য খেয়েও রক্ষা না পেয়ে রানী ও রাজার ওপর সাদার যুগপৎ ধ্বংসযজ্ঞ।',
        movesSan: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bxb4', 'c3', 'Ba5', 'd4', 'exd4', 'O-O', 'dxc3', 'Qb3', 'Qf6', 'e5', 'Qg6', 'Nxc3'],
      },
    ],
  },

  // 15. Danish Gambit (Gambit 4)
  {
    id: 'danish-gambit',
    name: 'Danish Gambit',
    nameBn: 'ড্যানিশ গ্যাম্বিট',
    eco: 'C21',
    category: 'gambit',
    difficulty: 'intermediate',
    difficultyBn: 'মাঝারি',
    forColor: 'white',
    forColorBn: 'সাদা',
    mainIdeaLines: [
      'পরপর দুটি সৈন্য (c3 ও b2) বলি দিয়ে দুটি হাতিকে দুটি কামানের মতো সাজানো।',
      'সঠিকভাবে আক্রমণ চালাতে পারলে প্রতিপক্ষ ১০ চালের আগেই চেকমেট হতে পারে।',
    ],
    gambitDetails: {
      sacrificeBn: 'সাদা c3 ও b2 দুটি সৈন্যই বিলিয়ে দেয় সম্পূর্ণ গতি ও লাইনের জন্য।',
      compensationBn: 'সাদার দুটি হাতি (c4 ও b2) কালোর রাজাপক্ষের দিকে তাক করা সাক্ষাৎ দুটি মৃত্যুদূত হয়ে ওঠে।',
      refutationBn: 'শ্লেখটার ডিফেন্স (Schlechter Defense): কালো ৩...d5 ঠেলে একটি সৈন্য ফেরত দিয়ে সহজেই সমতা আনতে পারে।',
    },
    moves: [
      { ply: 1, san: 'e4', uci: 'e2e4', explanationBn: 'সাদা কেন্দ্র দখল করে।' },
      { ply: 2, san: 'e5', uci: 'e7e5', explanationBn: 'কালোর কেন্দ্রীয় প্রতিদ্বন্দিতা।' },
      { ply: 3, san: 'd4', uci: 'd2d4', explanationBn: 'সেন্টার গেম: সাথে সাথে কেন্দ্র আক্রমণ।' },
      { ply: 4, san: 'exd4', uci: 'e5d4', explanationBn: 'কালো সৈন্য খেল।' },
      { ply: 5, san: 'c3', uci: 'c2c3', explanationBn: 'ড্যানিশ গ্যাম্বিট! প্রথম সৈন্যের বলিদান।' },
      { ply: 6, san: 'dxc3', uci: 'd4c3', explanationBn: 'কালো সৈন্য গ্রহণ করল।' },
      { ply: 7, san: 'Bc4', uci: 'f1c4', explanationBn: 'হাতির উন্নতি ও f7 এ নিশানা।' },
      { ply: 8, san: 'cxb2', uci: 'c3b2', explanationBn: 'কালো দ্বিতীয় সৈন্যও খেল।' },
      { ply: 9, san: 'Bxb2', uci: 'c1b2', explanationBn: 'সাদার দুই ভয়ঙ্কর হাতি দুটি দীর্ঘ তির্যক লাইনে বসল!' },
      { ply: 10, san: 'd5', uci: 'd7d5', explanationBn: 'শ্লেখটার চাল: সৈন্য ফেরত দিয়ে কেন্দ্র মুক্ত করা ও সমতা আনা।' },
    ],
    variations: [
      {
        id: 'danish-declined',
        name: 'Danish Declined',
        nameBn: 'ড্যানিশ ডিক্লাইন্ড',
        movesSan: ['e4', 'e5', 'd4', 'exd4', 'c3', 'd5', 'exd5', 'Qxd5', 'cxd4', 'Nc6'],
        descriptionBn: 'কালো লোভ সামলে d5 ঠেলে সাদার গ্যাম্বিট পরিকল্পনা নস্যাৎ করে দেয়।',
      },
    ],
    middlegamePlans: [
      'সাদার মূল লক্ষ্য: Qb3 এনে f7 ও g7 ঘরে একযোগে আক্রমণ করা।',
      'কালোর মূল কৌশল: বাড়তি সৈন্যের লোভ না করে দ্রুত ক্যাসলিং সম্পন্ন করা।',
      'অ্যান্ডগেমে সাদার দুই হাতির বিপরীতে কালোর সৈন্য সংখ্যার আধিক্য কাজে লাগানো।',
    ],
    typicalMistakes: [
      'অতিরিক্ত সৈন্য খাওয়ার নেশায় মত্ত হয়ে Bc4 ও Bb2 এর ক্রসফায়ারে পিষ্ট হওয়া।',
      'f7 বলির মুখে পাল্টা Bb4+ চেক না দেখতে পাওয়া।',
    ],
    traps: [
      {
        id: 'danish-mate-trap',
        name: 'Danish Mate Trap',
        nameBn: 'ড্যানিশ মেট ট্র্যাপ',
        descriptionBn: 'কালো অসাবধানে খেললে সাদার রানী ও হাতির ক্রস আক্রমণে রাজা মাঝমাঠে খতম হয়!',
        movesSan: ['e4', 'e5', 'd4', 'exd4', 'c3', 'dxc3', 'Bc4', 'cxb2', 'Bxb2', 'Bb4+', 'Nd2', 'Nf6', 'Bxf7+', 'Kxf7', 'Qb3+', 'd5', 'Qxb4'],
      },
      {
        id: 'danish-double-bishop',
        name: 'Double Bishop Strike',
        nameBn: 'ডাবল বিশপ স্ট্রাইক',
        descriptionBn: 'e5 সৈন্য ঠেলে কালোর রাজাপক্ষের দুর্গ গুঁড়িয়ে দেওয়া।',
        movesSan: ['e4', 'e5', 'd4', 'exd4', 'c3', 'dxc3', 'Bc4', 'cxb2', 'Bxb2', 'Nf6', 'e5', 'Qe7', 'Ne2', 'Ng4', 'O-O', 'Nxe5', 'Re1'],
      },
    ],
  },

  // 16. Smith-Morra Gambit (Gambit 5)
  {
    id: 'smith-morra',
    name: 'Smith-Morra Gambit',
    nameBn: 'স্মিথ-মোরা গ্যাম্বিট',
    eco: 'B21',
    category: 'gambit',
    difficulty: 'intermediate',
    difficultyBn: 'মাঝারি',
    forColor: 'white',
    forColorBn: 'সাদা',
    mainIdeaLines: [
      'সিসিলিয়ান ডিফেন্সের জটিল থিওরি এড়িয়ে ২য় ও ৩য় চালেই সৈন্য বিসর্জন দিয়ে উন্মুক্ত খেলা।',
      'c ও d ফাইল উন্মুক্ত করে কালোকে এক মুহূর্তও শ্বাস নিতে না দেওয়া।',
    ],
    gambitDetails: {
      sacrificeBn: 'সাদা ২য় চালেই d4 এবং ৩য় চালেই c3 ঠেলে সৈন্য বিসর্জন দেয়।',
      compensationBn: 'সাদার c ও d ফাইল উন্মুক্ত, দ্রুত Bc4 ও Nc3 উন্নতি এবং কালোর স্বাভাবিক খেলার ওপর তুমুল আক্রমণ।',
      refutationBn: '৩...Nf6 অথবা ৩...d5 ঠেলে গ্যাম্বিট প্রত্যাখ্যান করা, অথবা শিকাগো ডিফেন্স সাজানো।',
    },
    moves: [
      { ply: 1, san: 'e4', uci: 'e2e4', explanationBn: 'সাদা কেন্দ্র দখল করে।' },
      { ply: 2, san: 'c5', uci: 'c7c5', explanationBn: 'সিসিলিয়ান ডিফেন্স।' },
      { ply: 3, san: 'd4', uci: 'd2d4', explanationBn: 'সাদা কেন্দ্রে আঘাত করে।' },
      { ply: 4, san: 'cxd4', uci: 'c5d4', explanationBn: 'কালো সৈন্য খেল।' },
      { ply: 5, san: 'c3', uci: 'c2c3', explanationBn: 'স্মিথ-মোরা গ্যাম্বিট! c3 সৈন্যের উপহার।' },
      { ply: 6, san: 'dxc3', uci: 'd4c3', explanationBn: 'কালো সৈন্য গ্রহণ করল।' },
      { ply: 7, san: 'Nxc3', uci: 'b1c3', explanationBn: 'ঘোড়া দ্রুত কেন্দ্রে আবির্ভূত হলো।' },
      { ply: 8, san: 'Nc6', uci: 'b8c6', explanationBn: 'কালোর স্বাভাবিক ঘোড়ার উন্নতি।' },
      { ply: 9, san: 'Nf3', uci: 'g1f3', explanationBn: 'সাদার দ্বিতীয় ঘোড়ার উন্নতি।' },
      { ply: 10, san: 'd6', uci: 'd7d6', explanationBn: 'কালো e5 ঠেকিয়ে নিজের কাঠামো শক্ত করল।' },
    ],
    variations: [
      {
        id: 'morra-declined',
        name: 'Morra Declined',
        nameBn: 'মোরা ডিক্লাইন্ড',
        movesSan: ['e4', 'c5', 'd4', 'cxd4', 'c3', 'Nf6', 'e5', 'Nd5', 'cxd4', 'd6'],
        descriptionBn: 'কালো সৈন্য না খেয়ে Nf6 খেলে সাদার গ্যাম্বিট নস্যাৎ করে দেয়।',
      },
    ],
    middlegamePlans: [
      'Bc4, O-O, Qe2, এবং Rd1 সাজিয়ে d-ফাইলের ওপর কালোর রাজার দিকে বন্দুক তাক করা।',
      'e5 বা Nd5 ব্রেকের মাধ্যমে কালোর সৈন্য প্রাচীর চূর্ণ করা।',
      'কালো e6, a6, Qc7 খেলে সলিড থাকার চেষ্টা করে অ্যান্ডগেমে যাওয়া।',
    ],
    typicalMistakes: [
      'd-ফাইলে রুক আসার পরেও d6 ঘর অরক্ষিত রেখে সাদার e5 ব্রেকের মুখে ভেঙে পড়া।',
      'রাজাকে মাঝমাঠে রেখে কুইনসাইডে অপ্রয়োজনীয় সৈন্য চালানো।',
    ],
    traps: [
      {
        id: 'morra-siberian',
        name: 'Siberian Trap in Morra',
        nameBn: 'মোরায় সাইবেরিয়ান ট্র্যাপ',
        descriptionBn: 'সাদা অসাবধানে Qe2 ও h3 খেলে কালোর Nd4 ও Qh2 চেকমেটে ধ্বংস হয়ে যায়!',
        movesSan: ['e4', 'c5', 'd4', 'cxd4', 'c3', 'dxc3', 'Nxc3', 'Nc6', 'Nf3', 'e6', 'Bc4', 'Qc7', 'O-O', 'Nf6', 'Qe2', 'Ng4', 'h3', 'Nd4'],
      },
      {
        id: 'morra-phantom',
        name: 'Phantom Mate Trap',
        nameBn: 'ফ্যান্টম মেট ট্র্যাপ',
        descriptionBn: 'Nd5 স্যাক্রিফাইস দিয়ে কালোর রাজাকে আক্রমণ করার দুর্দান্ত কৌশল।',
        movesSan: ['e4', 'c5', 'd4', 'cxd4', 'c3', 'dxc3', 'Nxc3', 'Nc6', 'Nf3', 'e6', 'Bc4', 'a6', 'O-O', 'Nge7', 'Bg5', 'f6', 'Be3', 'b5', 'Bb3', 'Bb7', 'Re1', 'Na5', 'Nd5', 'exd5', 'exd5'],
      },
    ],
  },

  // 17. Blackmar-Diemer Gambit (Gambit 6)
  {
    id: 'blackmar-diemer',
    name: 'Blackmar-Diemer Gambit',
    nameBn: 'ব্ল্যাকমার-ডিয়েমার গ্যাম্বিট',
    eco: 'D00',
    category: 'gambit',
    difficulty: 'advanced',
    difficultyBn: 'অগ্রসর',
    forColor: 'white',
    forColorBn: 'সাদা',
    mainIdeaLines: [
      '১.d4 d5 ২.e4 dxe4 ৩.Nc3 Nf6 ৪.f3 দিয়ে সাদা f-ফাইল উন্মুক্ত করতে সৈন্য বলি দেয়।',
      'কালোর স্বাভাবিক বিকাশ ব্যাহত করে বিদ্যুৎগতির আক্রমণ চালানোর অস্ত্র।',
    ],
    gambitDetails: {
      sacrificeBn: 'সাদা ৪.f3 খেলে e4 ও f3 দুটি সৈন্যের পথ খুলে f-ফাইল উন্মুক্ত করতে বলি দেয়।',
      compensationBn: 'কেন্দ্র নিয়ন্ত্রণ, দ্রুত Bc4 ও Bg5 উন্নতি, এবং কালোর রাজাপক্ষে বিদ্যুৎগতির আক্রমণ।',
      refutationBn: '৪...Bf5 অথবা ৪...e3 ঠেলে সাদার হাতির পথ আটকে দেওয়া।',
    },
    moves: [
      { ply: 1, san: 'd4', uci: 'd2d4', explanationBn: 'সাদা কেন্দ্র দখল করে।' },
      { ply: 2, san: 'd5', uci: 'd7d5', explanationBn: 'কালোর কেন্দ্রীয় অংশগ্রহণ।' },
      { ply: 3, san: 'e4', uci: 'e2e4', explanationBn: 'ব্ল্যাকমার গ্যাম্বিট! ২য় চালেই e4 এর সাহসী বলিদান।' },
      { ply: 4, san: 'dxe4', uci: 'd5e4', explanationBn: 'কালো সৈন্য খেল।' },
      { ply: 5, san: 'Nc3', uci: 'b1c3', explanationBn: 'ঘোড়া দিয়ে e4 সৈন্য আক্রমণ।' },
      { ply: 6, san: 'Nf6', uci: 'g8f6', explanationBn: 'কালো ঘোড়া দিয়ে সৈন্য রক্ষা করল।' },
      { ply: 7, san: 'f3', uci: 'f2f3', explanationBn: 'ডিয়েমার গ্যাম্বিট চাল: f3 দিয়ে f-ফাইল খোলার প্রস্তাব।' },
      { ply: 8, san: 'exf3', uci: 'e4f3', explanationBn: 'কালো সৈন্য গ্রহণ করল।' },
      { ply: 9, san: 'Nxf3', uci: 'g1f3', explanationBn: 'ঘোড়া দিয়ে সৈন্য ফেরত নিয়ে f-ফাইল পুরোপুরি মুক্ত করল সাদা।' },
      { ply: 10, san: 'e6', uci: 'e7e6', explanationBn: 'কালো সলিড ডিফেন্স গঠন করল।' },
    ],
    variations: [
      {
        id: 'bdg-vienna',
        name: 'Vienna Defense',
        nameBn: 'ভিয়েনা ডিফেন্স',
        movesSan: ['d4', 'd5', 'e4', 'dxe4', 'Nc3', 'Nf6', 'f3', 'Bf5', 'fxe4', 'Nxe4', 'Qf3', 'Nd6'],
        descriptionBn: 'Bf5 খেলে সাদার f3 পরিকল্পনাকে সরাসরি চ্যালেঞ্জ করা।',
      },
    ],
    middlegamePlans: [
      'Bd3 ও Bg5 খেলে কালোর মূল ডিফেন্ডার Nf6 দূর করে h7 ও f7 ঘরে চেকমেট করা।',
      'Qe1-Qh4 চালের মাধ্যমে রানীকে রাজাপক্ষে আক্রমণে যুক্ত করা।',
      'কালো e6, Be7, O-O খেলে সাদার ঝড় সামলে অ্যান্ডগেমে জয় ছিনিয়ে নেওয়া।',
    ],
    typicalMistakes: [
      'সাদার Qe1-Qh4 আক্রমণের সময় অসাবধানে h7 ঘরে চেকমেট খাওয়া।',
      'ঘুঁটি না সাজিয়ে অলসভাবে বসে থাকা।',
    ],
    traps: [
      {
        id: 'bdg-halsar',
        name: 'Halsar Trap',
        nameBn: 'হ্যালসার ট্র্যাপ',
        descriptionBn: 'Ne5 ও g4 দিয়ে কালোর লাইট-স্কয়ার হাতিকে কোণঠাসা করার চমৎকার কৌশল।',
        movesSan: ['d4', 'd5', 'e4', 'dxe4', 'Nc3', 'Nf6', 'f3', 'exf3', 'Nxf3', 'Bf5', 'Ne5', 'e6', 'g4', 'Bg6', 'h4', 'h6', 'Nxg6', 'fxg6', 'Bd3', 'Kf7'],
      },
      {
        id: 'bdg-diemer',
        name: 'Diemer Queen Sacrifice Trap',
        nameBn: 'ডিয়েমার স্যাক্রিফাইস ট্র্যাপ',
        descriptionBn: 'সাদা রানী বিসর্জন দিয়েও কালোর রাজাকে মাঝমাঠে পরাস্ত করে।',
        movesSan: ['d4', 'd5', 'e4', 'dxe4', 'Nc3', 'Nf6', 'f3', 'exf3', 'Nxf3', 'c6', 'Bc4', 'Bf5', 'O-O', 'e6', 'Ne5', 'Bxc2', 'Nxf7', 'Bxd1', 'Nxd8'],
      },
    ],
  },

  // 18. Stafford Gambit (Gambit 7)
  {
    id: 'stafford-gambit',
    name: 'Stafford Gambit',
    nameBn: 'স্ট্যাফোর্ড গ্যাম্বিট',
    eco: 'C42',
    category: 'gambit',
    difficulty: 'intermediate',
    difficultyBn: 'মাঝারি',
    forColor: 'black',
    forColorBn: 'কালো',
    mainIdeaLines: [
      'পেট্রফ ডিফেন্সে ৩...Nc6 খেলে একটি সৈন্য বিসর্জন দিয়ে গতি লাভ করা।',
      'Bc5, Ng4, Qh4 সাজিয়ে সাদার f2 ঘরে বিদ্যুৎগতির ট্র্যাপের জাল বোনা।',
    ],
    gambitDetails: {
      sacrificeBn: 'কালো ৩...Nc6 খেলে সাদার e5 ঘোড়াকে সৈন্য খাওয়ার আমন্ত্রণ জানায়।',
      compensationBn: 'খোলার সাথে সাথে d-ফাইল মুক্ত, Bc5 হাতির f2 ঘরের দিকে নিশানা, এবং দ্রুত Ng4 ও Qh4 আক্রমণ।',
      refutationBn: 'সাদা লোভ না করে d3, Be2, O-O খেলে শান্তভাবে অতিরিক্ত সৈন্য ধরে রাখতে পারে।',
    },
    moves: [
      { ply: 1, san: 'e4', uci: 'e2e4', explanationBn: 'সাদা কেন্দ্র দখল করে।' },
      { ply: 2, san: 'e5', uci: 'e7e5', explanationBn: 'কালোর কেন্দ্রীয় প্রতিদ্বন্দিতা।' },
      { ply: 3, san: 'Nf3', uci: 'g1f3', explanationBn: 'ঘোড়ার উন্নতি ও e5 আক্রমণ।' },
      { ply: 4, san: 'Nf6', uci: 'g8f6', explanationBn: 'পেট্রফ ডিফেন্স।' },
      { ply: 5, san: 'Nxe5', uci: 'f3e5', explanationBn: 'সাদা সৈন্য খেল।' },
      { ply: 6, san: 'Nc6', uci: 'b8c6', explanationBn: 'স্ট্যাফোর্ড গ্যাম্বিট! ঘোড়া এগিয়ে দিয়ে সৈন্যের বলিদান।' },
      { ply: 7, san: 'Nxc6', uci: 'e5c6', explanationBn: 'সাদা ঘোড়া খেল।' },
      { ply: 8, san: 'dxc6', uci: 'd7c6', explanationBn: 'কালো d-ফাইল উন্মুক্ত করে সৈন্য ফেরত নিল।' },
      { ply: 9, san: 'd3', uci: 'd2d3', explanationBn: 'সাদা e4 সৈন্য রক্ষা করে ও সলিড থাকার চেষ্টা করে।' },
      { ply: 10, san: 'Bc5', uci: 'f8c5', explanationBn: 'হাতির চরম আক্রমণ! কালোর লক্ষ্য সাদার দুর্বল f2 ঘর।' },
    ],
    variations: [
      {
        id: 'stafford-refutation',
        name: 'Solid Refutation Line',
        nameBn: 'সলিড রিফিউটেশন লাইন',
        movesSan: ['e4', 'e5', 'Nf3', 'Nf6', 'Nxe5', 'Nc6', 'Nxc6', 'dxc6', 'd3', 'Bc5', 'Be2', 'O-O', 'O-O', 'Re8'],
        descriptionBn: 'সাদা Be2 খেলে কালোর Ng4 আক্রমণ থামিয়ে সহজেই খেলা নিয়ন্ত্রণে রাখে।',
      },
    ],
    middlegamePlans: [
      'কালোর একমাত্র লক্ষ্য: সাদার f2 ও h2 ঘরে চেকমেট নামিয়ে আনা।',
      'Ng4 ও Qh4 এনে সাদার ক্যাসলিং চূর্ণ করা।',
      'সাদা শান্তভাবে Be2 ও c3 খেলে কালোর আক্রমণ স্তিমিত করে অতিরিক্ত সৈন্যে জেতা।',
    ],
    typicalMistakes: [
      'সাদা ভুল করে h3 খেললে কালোর Bxf2+ বা Nxf2 এর মুখে সম্পূর্ণ চূর্ণ হওয়া।',
      'Be2 না খেলে অকারণে আক্রমণাত্মক হতে যাওয়া।',
    ],
    traps: [
      {
        id: 'stafford-classic-mate',
        name: 'Classical Stafford Mate',
        nameBn: 'ক্লাসিক্যাল স্ট্যাফোর্ড মেট',
        descriptionBn: 'সাদা Bg5 পিন করতে গিয়ে কালোর Nxe4 ও Bg4# চেকমেটে স্তম্ভিত হয়ে যায়!',
        movesSan: ['e4', 'e5', 'Nf3', 'Nf6', 'Nxe5', 'Nc6', 'Nxc6', 'dxc6', 'd3', 'Bc5', 'Bg5', 'Nxe4', 'Bxd8', 'Bxf2+', 'Ke2', 'Bg4#'],
      },
      {
        id: 'stafford-ohio',
        name: 'Ohio Trap',
        nameBn: 'ওহাইয়ো ট্র্যাপ',
        descriptionBn: 'Qh4 ও Nxf2 দিয়ে সাদার রাজাকে ক্যাসলিংয়ের ভেতরই চেকমেট দেওয়া।',
        movesSan: ['e4', 'e5', 'Nf3', 'Nf6', 'Nxe5', 'Nc6', 'Nxc6', 'dxc6', 'Nc3', 'Bc5', 'Bc4', 'Ng4', 'O-O', 'Qh4', 'h3', 'Nxf2', 'Qf3', 'Nxh3+', 'Kh1', 'Nf2+', 'Kg1', 'Qh1#'],
      },
    ],
  },
];

/**
 * Validates all openings, variations, and traps at initialization using chess.js.
 * Throws a descriptive error if any move is illegal.
 */
export function validateAllOpenings(): void {
  for (const opening of OPENINGS_DATA) {
    // 1. Validate main line moves
    const mainChess = new Chess();
    for (let i = 0; i < opening.moves.length; i++) {
      const move = opening.moves[i];
      try {
        const res = mainChess.move(move.san);
        if (!res) {
          throw new Error(`Invalid move: ${move.san}`);
        }
      } catch (err) {
        throw new Error(
          `Illegal main-line move in "${opening.name}": "${move.san}" at ply ${move.ply}. Details: ${err}`
        );
      }
    }

    // 2. Validate variations
    for (const v of opening.variations) {
      const varChess = new Chess();
      for (let i = 0; i < v.movesSan.length; i++) {
        const san = v.movesSan[i];
        try {
          const res = varChess.move(san);
          if (!res) {
            throw new Error(`Invalid move: ${san}`);
          }
        } catch (err) {
          throw new Error(
            `Illegal variation move in "${opening.name}" (${v.name}): "${san}" at move ${i + 1}. Details: ${err}`
          );
        }
      }
    }

    // 3. Validate traps
    for (const trap of opening.traps) {
      const trapChess = new Chess();
      for (let i = 0; i < trap.movesSan.length; i++) {
        const san = trap.movesSan[i];
        try {
          const res = trapChess.move(san);
          if (!res) {
            throw new Error(`Invalid move: ${san}`);
          }
        } catch (err) {
          throw new Error(
            `Illegal trap move in "${opening.name}" (${trap.name}): "${san}" at move ${i + 1}. Details: ${err}`
          );
        }
      }
    }
  }
}

// Execute validation on module import
validateAllOpenings();
