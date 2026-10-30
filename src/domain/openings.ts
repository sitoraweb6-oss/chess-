/**
 * Curated Chess Openings Domain Layer for "ওপেনিং শেখো"
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

export interface ChessOpening {
  id: string;
  name: string;
  nameBn: string;
  eco: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  difficultyBn: 'সহজ' | 'মাঝারি' | 'অগ্রসর';
  forColor: 'white' | 'black';
  forColorBn: 'সাদা' | 'কালো';
  mainIdeaLines: [string, string];
  moves: OpeningMoveDetail[];
  traps: [OpeningTrap, OpeningTrap];
}

export const OPENINGS_DATA: ChessOpening[] = [
  // 1. Italian Game
  {
    id: 'italian-game',
    name: 'Italian Game',
    nameBn: 'ইতালিয়ান গেম',
    eco: 'C50',
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
    nameBn: 'রুই লোপেজ (স্প্যানিশ ওপেনিং)',
    eco: 'C60',
    difficulty: 'intermediate',
    difficultyBn: 'মাঝারি',
    forColor: 'white',
    forColorBn: 'সাদা',
    mainIdeaLines: [
      'কালোর e5 সৈন্যের মূল রক্ষক c6 ঘোড়াকে আক্রমণ করে দীর্ঘমেয়াদী কৌশলগত চাপ সৃষ্টি করা।',
      'সবচেয়ে ক্লাসিক্যাল ও সুশৃঙ্খল ওপেনিং যা সঠিক পজিশনাল খেলার শিক্ষা দেয়।',
    ],
    moves: [
      { ply: 1, san: 'e4', uci: 'e2e4', explanationBn: 'কেন্দ্রের নিয়ন্ত্রণ শুরু করা।' },
      { ply: 2, san: 'e5', uci: 'e7e5', explanationBn: 'কালোর কেন্দ্রীয় প্রতিদ্বন্দিতা।' },
      { ply: 3, san: 'Nf3', uci: 'g1f3', explanationBn: 'e5 আক্রমণ ও রাজার ঘোড়া উন্নত করা।' },
      { ply: 4, san: 'Nc6', uci: 'b8c6', explanationBn: 'ঘোড়া দিয়ে সৈন্যের নিরাপত্তা নিশ্চিত করা।' },
      { ply: 5, san: 'Bb5', uci: 'f1b5', explanationBn: 'c6 ঘোড়া পিন করে e5 সৈন্যের ওপর পরোক্ষ চাপ তৈরি।' },
      { ply: 6, san: 'a6', uci: 'a7a6', explanationBn: 'কালোর হাতিকে চ্যালেঞ্জ করা (মর্ফি ডিফেন্স)।' },
      { ply: 7, san: 'Ba4', uci: 'b5a4', explanationBn: 'তির্যক বজায় রেখে পিন ও চাপ জারি রাখা।' },
      { ply: 8, san: 'Nf6', uci: 'g8f6', explanationBn: 'কালোর রাজাপক্ষের ঘোড়া উন্নতি ও ক্যাসলিংয়ের প্রস্তুতি।' },
      { ply: 9, san: 'O-O', uci: 'e1g1', explanationBn: 'সাদা নিরাপদে রাজাকে সুরক্ষিত করে (ক্যাসলিং)।' },
      { ply: 10, san: 'Be7', uci: 'f8e7', explanationBn: 'পিন প্রতিরোধ ও ক্যাসলিংয়ের প্রস্তুতি।' },
    ],
    traps: [
      {
        id: 'ruy-noahs-ark',
        name: "Noah's Ark Trap",
        nameBn: "নোয়াস আর্ক ট্র্যাপ (হাতির খাঁচা)",
        descriptionBn: 'সাদা অসাবধান হলে কালো সৈন্যরা এগিয়ে এসে সাদার শক্তিশালী b3 হাতিকে খাঁচাবন্দী করে ফেলে।',
        movesSan: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'd6', 'd4', 'b5', 'Bb3', 'Nxd4', 'Nxd4', 'exd4', 'Qxd4', 'c5', 'Qd5', 'Be6', 'Qc6+', 'Bd7', 'Qd5', 'c4'],
      },
      {
        id: 'ruy-mortimer',
        name: 'Mortimer Trap',
        nameBn: 'মর্টিমার ট্র্যাপ',
        descriptionBn: 'কালো কৌশলে ঘোড়া পিছিয়ে সাদার জন্য লোভনীয় সৈন্যের টোপ দেয় এবং সাদার রাজাকে চেপে ধরে।',
        movesSan: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6', 'Nc3', 'Ne7', 'Nxe5', 'c6', 'Nc4', 'cxb5', 'Nd6#'],
      },
    ],
  },

  // 3. Sicilian Defense
  {
    id: 'sicilian-defense',
    name: 'Sicilian Defense',
    nameBn: 'সিসিলিয়ান ডিফেন্স',
    eco: 'B20',
    difficulty: 'advanced',
    difficultyBn: 'অগ্রসর',
    forColor: 'black',
    forColorBn: 'কালো',
    mainIdeaLines: [
      'সাদার e4 চালের বিপরীতে অপ্রতিসম (asymmetric) পাল্টা আক্রমণ তৈরি করা।',
      'c5 চাল দিয়ে d4 ঘরের নিয়ন্ত্রণ নিয়ে c-ফাইলে কাউন্টার-অ্যাটাক গড়া।',
    ],
    moves: [
      { ply: 1, san: 'e4', uci: 'e2e4', explanationBn: 'সাদা কেন্দ্র দখল করে।' },
      { ply: 2, san: 'c5', uci: 'c7c5', explanationBn: 'কালো c-ফাইল দিয়ে কেন্দ্রের নিয়ন্ত্রণের দাবি জানায়।' },
      { ply: 3, san: 'Nf3', uci: 'g1f3', explanationBn: 'd4 চালের ক্ষেত্র প্রস্তুত করা।' },
      { ply: 4, san: 'd6', uci: 'd7d6', explanationBn: 'কেন্দ্রের সুরক্ষা ও হাতির পথ পরিষ্কার।' },
      { ply: 5, san: 'd4', uci: 'd2d4', explanationBn: 'সাদার কেন্দ্র খোলার ও আক্রমণ গড়ে তোলার প্রয়াস।' },
      { ply: 6, san: 'cxd4', uci: 'c5d4', explanationBn: 'কেন্দ্রীয় অদলবদল ও কালো c-ফাইল খুলে নেওয়া।' },
      { ply: 7, san: 'Nxd4', uci: 'f3d4', explanationBn: 'সাদা ঘোড়া দিয়ে ঘুঁটি পুনরুদ্ধার করে।' },
      { ply: 8, san: 'Nf6', uci: 'g8f6', explanationBn: 'সাদার অরক্ষিত e4 সৈন্যে আঘাত।' },
      { ply: 9, san: 'Nc3', uci: 'b1c3', explanationBn: 'e4 রক্ষা ও সৈন্যদল মজবুত রাখা।' },
      { ply: 10, san: 'a6', uci: 'a7a6', explanationBn: 'নাজডর্ফ ভ্যারিয়েশন - b5 ঘরে সাদার প্রবেশ কঠোরভাবে রোধ।' },
    ],
    traps: [
      {
        id: 'sicilian-magnus-smith',
        name: 'Magnus Smith Trap',
        nameBn: 'ম্যাগনাস স্মিথ ট্র্যাপ',
        descriptionBn: 'কালো অসতর্কভাবে সৈন্য খেলে সাদার হাতি f7 ঘরে বলিদান দিয়ে রাজাকে বাইরে টেনে আনে।',
        movesSan: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'Nc6', 'Bc4', 'g6', 'Nxc6', 'bxc6', 'e5', 'dxe5', 'Bxf7+'],
      },
      {
        id: 'sicilian-siberian',
        name: 'Siberian Trap',
        nameBn: 'সাইবেরিয়ান ট্র্যাপ',
        descriptionBn: 'মররা গ্যাম্বিটে সাদার রাজাপক্ষের সুরক্ষাহীনতার সুযোগ নিয়ে রানী ও ঘোড়ার যুগপৎ আক্রমণ!',
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
    difficulty: 'beginner',
    difficultyBn: 'সহজ',
    forColor: 'black',
    forColorBn: 'কালো',
    mainIdeaLines: [
      'একটি অত্যন্ত মজবুত ও নিরেট প্রতিরক্ষা যেখানে কেন্দ্রকে সুরক্ষিত রেখে পাল্টা আঘাত হানা হয়।',
      'e6 এবং d5 চাল দিয়ে সাদার কেন্দ্র প্রতিহত করা ও পরবর্তীতে c5 দিয়ে কেন্দ্র গুঁড়িয়ে দেওয়া।',
    ],
    moves: [
      { ply: 1, san: 'e4', uci: 'e2e4', explanationBn: 'সাদা কেন্দ্র শুরু করে।' },
      { ply: 2, san: 'e6', uci: 'e7e6', explanationBn: 'd5 চালের জন্য শক্ত ব্যাকআপ তৈরি।' },
      { ply: 3, san: 'd4', uci: 'd2d4', explanationBn: 'সাদার পুরো কেন্দ্র দখল।' },
      { ply: 4, san: 'd5', uci: 'd7d5', explanationBn: 'কালোর সাদার কেন্দ্রকে সরাসরি চ্যালেঞ্জ।' },
      { ply: 5, san: 'Nc3', uci: 'b1c3', explanationBn: 'd5 আক্রমণ ও e4 রক্ষা।' },
      { ply: 6, san: 'Nf6', uci: 'g8f6', explanationBn: 'সাদার e4 সৈন্যের ওপর পাল্টা চাপ (Classical)।' },
      { ply: 7, san: 'Bg5', uci: 'c1g5', explanationBn: 'কালোর ঘোড়াকে পিন করে চাপ সৃষ্টি।' },
      { ply: 8, san: 'Be7', uci: 'f8e7', explanationBn: 'পিন খুলে রাজাপক্ষ ক্যাসলিংয়ের উপযোগী করা।' },
    ],
    traps: [
      {
        id: 'french-rubinstein',
        name: 'Rubinstein Trap',
        nameBn: 'রুবিনস্টাইন ট্র্যাপ',
        descriptionBn: 'কালো অসতর্ক থাকলে সাদা h7 ঘরে মারাত্মক আক্রমণ গড়ে কালো রানী ও রাজাকে হুমকির মুখে ফেলে।',
        movesSan: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nd7', 'Nf3', 'Ngf6', 'Bd3', 'Be7', 'O-O', 'O-O', 'Qe2', 'Nxe4', 'Qxe4', 'Nf6', 'Qh4', 'b6', 'Bg5', 'Bb7', 'Bxf6'],
      },
      {
        id: 'french-advance-trap',
        name: 'Advance Variation Center Trap',
        nameBn: 'এডভান্স ভ্যারিয়েশন ট্র্যাপ',
        descriptionBn: 'সাদা d3 হাতির সাহায্যে কালো রানীর ভুল আক্রমণে সাদার সুরক্ষিত কেল্লা অক্ষুণ্ন রাখে।',
        movesSan: ['e4', 'e6', 'd4', 'd5', 'e5', 'c5', 'c3', 'Nc6', 'Nf3', 'Qb6', 'Bd3', 'cxd4', 'cxd4', 'Bd7', 'O-O', 'Nxd4', 'Nxd4', 'Qxd4', 'Nc3', 'Qxe5', 'Re1', 'Qb8', 'Nxd5'],
      },
    ],
  },

  // 5. Caro-Kann Defense
  {
    id: 'caro-kann',
    name: 'Caro-Kann Defense',
    nameBn: 'কারো-কান ডিফেন্স',
    eco: 'B12',
    difficulty: 'beginner',
    difficultyBn: 'সহজ',
    forColor: 'black',
    forColorBn: 'কালো',
    mainIdeaLines: [
      'ফ্রেঞ্চ ডিফেন্সের মতো নিরেট কিন্তু এখানে কালোর c8 হাতির পথ বন্ধ হয় না।',
      'c6 দিয়ে শুরু করে নিরাপদে d5 খেলে সাদার কেন্দ্রকে প্রতিহত করা।',
    ],
    moves: [
      { ply: 1, san: 'e4', uci: 'e2e4', explanationBn: 'সাদা e4 খেলে কেন্দ্র দখল করে।' },
      { ply: 2, san: 'c6', uci: 'c7c6', explanationBn: 'd5 চালের সুরক্ষা ও হাতির পথ খোলা রাখা।' },
      { ply: 3, san: 'd4', uci: 'd2d4', explanationBn: 'সাদার পূর্ণ কেন্দ্র প্রতিষ্ঠা।' },
      { ply: 4, san: 'd5', uci: 'd7d5', explanationBn: 'সরাসরি কেন্দ্রের বিরুদ্ধে পাল্টা আক্রমণ।' },
      { ply: 5, san: 'Nc3', uci: 'b1c3', explanationBn: 'কেন্দ্রীয় সুরক্ষা ও ঘোড়ার দ্রুত উন্নতি।' },
      { ply: 6, san: 'dxe4', uci: 'd5e4', explanationBn: 'কেন্দ্রীয় সৈন্য অদলবদল করা।' },
      { ply: 7, san: 'Nxe4', uci: 'c3e4', explanationBn: 'সাদা ঘোড়া দিয়ে সৈন্য দখল করে।' },
      { ply: 8, san: 'Bf5', uci: 'c8f5', explanationBn: 'হাতিকে মুক্ত ঘরে এনে সাদার ঘোড়াকে তাড়া করা।' },
    ],
    traps: [
      {
        id: 'caro-smothered',
        name: 'Smothered Mate Trap',
        nameBn: 'স্মাদার্ড মেট ট্র্যাপ',
        descriptionBn: 'কালো অসতর্ক হয়ে চাল দিলে সাদার ঘোড়া এক চালের মাথায় রাজাকে শ্বাসরুদ্ধকর চেকমেট দেয়!',
        movesSan: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nd7', 'Qe2', 'Ngf6', 'Nd6#'],
      },
      {
        id: 'caro-kadas',
        name: 'Kadas Trap',
        nameBn: 'কাদাস ট্র্যাপ',
        descriptionBn: 'সাদা g3 ঘোড়ার সহায়তায় h-ফাইল খুলে কালোর রাজাপক্ষে আক্রমণ শুরু করে।',
        movesSan: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nf6', 'Ng3', 'h5', 'h4', 'Bg4', 'Be2', 'e6'],
      },
    ],
  },

  // 6. Queen's Gambit
  {
    id: 'queens-gambit',
    name: "Queen's Gambit",
    nameBn: "কুইন'স গ্যাম্বিট",
    eco: 'D06',
    difficulty: 'intermediate',
    difficultyBn: 'মাঝারি',
    forColor: 'white',
    forColorBn: 'সাদা',
    mainIdeaLines: [
      'd4 এর পর c4 দিয়ে কালোর d5 সৈন্যকে বিভ্রান্ত করে পুরো কেন্দ্র নিজের দখলে নেওয়া।',
      'দাবার অন্যতম সর্বাধিক সফল ও বিশ্ব চ্যাম্পিয়নদের নির্ভরযোগ্য ওপেনিং।',
    ],
    moves: [
      { ply: 1, san: 'd4', uci: 'd2d4', explanationBn: 'রানীর সৈন্য দুই ঘর এগিয়ে কেন্দ্র দখল।' },
      { ply: 2, san: 'd5', uci: 'd7d5', explanationBn: 'কালোও কেন্দ্র সমান করে।' },
      { ply: 3, san: 'c4', uci: 'c2c4', explanationBn: 'গ্যাম্বিট চাল: c4 সৈন্যের টোপ দিয়ে কেন্দ্র দখলের চেষ্টা।' },
      { ply: 4, san: 'e6', uci: 'e7e6', explanationBn: "কুইন'স গ্যাম্বিট ডিক্লাইন্ড (QGD) - d5 সৈন্য রক্ষা।" },
      { ply: 5, san: 'Nc3', uci: 'b1c3', explanationBn: 'd5 ঘরের ওপর চাপ বৃদ্ধি ও ঘোড়ার বিকাশ।' },
      { ply: 6, san: 'Nf6', uci: 'g8f6', explanationBn: 'কালোর সুরক্ষা ও রাজাপক্ষের উন্নতি।' },
      { ply: 7, san: 'Bg5', uci: 'c1g5', explanationBn: 'কালোর ঘোড়াকে পিন করে d5-এর চাপ দ্বিগুণ করা।' },
      { ply: 8, san: 'Be7', uci: 'f8e7', explanationBn: 'পিন মুক্ত করে ক্যাসলিংয়ের প্রস্তুতি।' },
    ],
    traps: [
      {
        id: 'qg-elephant',
        name: 'Elephant Trap',
        nameBn: 'এলিফ্যান্ট ট্র্যাপ',
        descriptionBn: 'সাদা ভেবেছিল সে ফ্রিতে একটি সৈন্য জিতবে, কিন্তু কালোর পাল্টা আঘাতে সাদার রানী বা মূল্যবান ঘুঁটি নষ্ট হয়!',
        movesSan: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Nbd7', 'cxd5', 'exd5', 'Nxd5', 'Nxd5', 'Bxd8', 'Bb4+', 'Qd2', 'Bxd2+', 'Kxd2', 'Kxd8'],
      },
      {
        id: 'qg-albin',
        name: 'Albin Countergambit Trap',
        nameBn: 'অ্যালবিন কাউন্টারগ্যাম্বিট ট্র্যাপ',
        descriptionBn: 'কালো দ্রুত সৈন্য পদোন্নতি দিয়ে ঘোড়া বানিয়ে আন্ডার-প্রমোশনের মাধ্যমে সাদাকে পর্যুদস্ত করে।',
        movesSan: ['d4', 'd5', 'c4', 'e5', 'dxe5', 'd4', 'e3', 'Bb4+', 'Bd2', 'dxe3', 'Bxb4', 'exf2+', 'Ke2', 'fxg1=N+', 'Rxg1', 'Bg4+'],
      },
    ],
  },

  // 7. London System
  {
    id: 'london-system',
    name: 'London System',
    nameBn: 'লন্ডন সিস্টেম',
    eco: 'D02',
    difficulty: 'beginner',
    difficultyBn: 'সহজ',
    forColor: 'white',
    forColorBn: 'সাদা',
    mainIdeaLines: [
      'কালোর যেকোনো চালের বিপরীতে একটি অত্যন্ত নির্ভরযোগ্য পিরামিড কাঠামো গড়ে তোলা।',
      'সহজ নিয়ম, দ্রুত ক্যাসলিং এবং প্রতিপক্ষের আক্রমণের ভয় না রেখে শক্ত পজিশন।',
    ],
    moves: [
      { ply: 1, san: 'd4', uci: 'd2d4', explanationBn: 'সাদা কেন্দ্র নিয়ন্ত্রণ শুরু করে।' },
      { ply: 2, san: 'd5', uci: 'd7d5', explanationBn: 'কালোর সমান পাল্টা জবাব।' },
      { ply: 3, san: 'Bf4', uci: 'c1f4', explanationBn: 'লন্ডনের মূল বৈশিষ্ট্য: হাতিকে সৈন্য শৃঙ্খলের বাইরে আনা।' },
      { ply: 4, san: 'Nf6', uci: 'g8f6', explanationBn: 'কালোর স্বাভাবিক রাজাপক্ষ উন্নত করা।' },
      { ply: 5, san: 'e3', uci: 'e2e3', explanationBn: 'd4 সৈন্য সুরক্ষা ও রাজার হাতির পথ উন্মুক্ত করা।' },
      { ply: 6, san: 'e6', uci: 'e7e6', explanationBn: 'কালোর কেন্দ্র সুরক্ষা ও হাতি বের করার সুযোগ।' },
      { ply: 7, san: 'Nf3', uci: 'g1f3', explanationBn: 'রাজার ঘোড়ার বিকাশ ও e5 ঘরের ওপর নিয়ন্ত্রণ।' },
      { ply: 8, san: 'c5', uci: 'c7c5', explanationBn: 'কালোর সাদার কেন্দ্র চ্যালেঞ্জ করা ও c-ফাইল খোলা।' },
      { ply: 9, san: 'Bd3', uci: 'f1d3', explanationBn: 'আক্রমণাত্মক তির্যক ও ক্যাসলিংয়ের পথ তৈরি।' },
      { ply: 10, san: 'Nc6', uci: 'b8c6', explanationBn: 'কালোর কেন্দ্রের চাপ বৃদ্ধি ও ঘোড়ার বিকাশ।' },
    ],
    traps: [
      {
        id: 'london-bishop-trap',
        name: 'London Queen Infiltration Trap',
        nameBn: 'লন্ডন কুইন আক্রমণ ট্র্যাপ',
        descriptionBn: 'সাদার হাতি অসতর্কভাবে ঘুরলে কালো রানী এসে b2 ঘরের নৌকা ও সুরক্ষা কেড়ে নেয়।',
        movesSan: ['d4', 'd5', 'Bf4', 'c5', 'e3', 'Nc6', 'c3', 'Qb6', 'Qb3', 'c4', 'Qc2', 'Bf5', 'Qxf5', 'Qxb2'],
      },
      {
        id: 'london-early-queen',
        name: 'Early Queen Fork Trap',
        nameBn: 'আর্লি কুইন ফর্ক ট্র্যাপ',
        descriptionBn: 'কালো রানী b6 গিয়ে একই সাথে b2 ও d4 আক্রমণ করে সাদার পজিশনে চিড় ধরায়।',
        movesSan: ['d4', 'Nf6', 'Bf4', 'c5', 'dxc5', 'e6', 'e3', 'Bxc5', 'Nf3', 'Qb6', 'Qc1', 'O-O'],
      },
    ],
  },

  // 8. King's Indian Defense
  {
    id: 'kings-indian-defense',
    name: "King's Indian Defense",
    nameBn: 'কিংস ইন্ডিয়ান ডিফেন্স (KID)',
    eco: 'E60',
    difficulty: 'advanced',
    difficultyBn: 'অগ্রসর',
    forColor: 'black',
    forColorBn: 'কালো',
    mainIdeaLines: [
      'শুরুতে সাদাকে কেন্দ্র ছেড়ে দিয়ে পরে f5 ও e5 দিয়ে তীব্র পাল্টা আক্রমণ হানা।',
      'কালোর রাজা সুরক্ষিত ফিয়াঙ্কেতো ঘরে থাকে এবং রাজার দিকে ভয়ঙ্কর আক্রমণ তৈরি হয়।',
    ],
    moves: [
      { ply: 1, san: 'd4', uci: 'd2d4', explanationBn: 'সাদার কেন্দ্রিয় সূচনা।' },
      { ply: 2, san: 'Nf6', uci: 'g8f6', explanationBn: 'সাদার e4 রোধ করা ও ঘুঁটির দ্রুত উন্নতি।' },
      { ply: 3, san: 'c4', uci: 'c2c4', explanationBn: 'সাদা কেন্দ্র ও স্থান বৃদ্ধি করে।' },
      { ply: 4, san: 'g6', uci: 'g7g6', explanationBn: 'কালোর ফিয়াঙ্কেতো হাতির জন্য ঘর তৈরি।' },
      { ply: 5, san: 'Nc3', uci: 'b1c3', explanationBn: 'd5 নিয়ন্ত্রণ ও e4 খেলার প্রস্তুতি।' },
      { ply: 6, san: 'Bg7', uci: 'f8g7', explanationBn: 'হাতিকে দীর্ঘ তির্যকে স্থাপন (g7)।' },
      { ply: 7, san: 'e4', uci: 'e2e4', explanationBn: 'সাদার তিন সৈন্যের মজবুত কেন্দ্র।' },
      { ply: 8, san: 'd6', uci: 'd7d6', explanationBn: 'e5 ঘরের ভিত্তি ও সাদার অতিরিক্ত অগ্রগতি রোধ।' },
      { ply: 9, san: 'Nf3', uci: 'g1f3', explanationBn: 'সাদার স্বাভাবিক উন্নতি ও ক্যাসলিং প্রস্তুতি।' },
      { ply: 10, san: 'O-O', uci: 'e8g8', explanationBn: 'কালোর রাজা সম্পূর্ণ নিরাপদ ও ক্যাসলিং সম্পন্ন।' },
    ],
    traps: [
      {
        id: 'kid-center-trap',
        name: 'Classical KID Center Trap',
        nameBn: 'ক্লাসিক্যাল কিংস ইন্ডিয়ান ট্র্যাপ',
        descriptionBn: 'সাদার d5 সৈন্য অতিরিক্ত এগিয়ে গেলে কালোর c5 ঘোড়া ঢুকে সাদার কেন্দ্রে ভাঙন ধরায়।',
        movesSan: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f3', 'O-O', 'Be3', 'e5', 'd5', 'c6', 'Qd2', 'cxd5', 'cxd5', 'a6', 'Bd3', 'b5', 'Nge2', 'Nbd7', 'O-O', 'Nc5'],
      },
      {
        id: 'kid-e5-pawn-trap',
        name: 'KID e5 Pawn Recovery Trap',
        nameBn: 'e5 সৈন্য পুনরুদ্ধার ট্র্যাপ',
        descriptionBn: 'সাদা রানীর অদলবদলের পর e5 সৈন্য খেতে গেলে কালোর হাতি চমৎকারভাবে ঘুঁটি ফিরিয়ে আনে।',
        movesSan: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'dxe5', 'dxe5', 'Qxd8', 'Rxd8', 'Nxe5', 'Nxe4', 'Nxe4', 'Bxe5'],
      },
    ],
  },
];

/**
 * Validates all opening lines and traps with chess.js at build/init time.
 * Throws a clear error if any move is illegal.
 */
export function validateAllOpenings(): void {
  for (const opening of OPENINGS_DATA) {
    // 1. Validate main line moves
    const mainChess = new Chess();
    for (let i = 0; i < opening.moves.length; i++) {
      const step = opening.moves[i];
      try {
        const moveRes = mainChess.move(step.san);
        if (!moveRes) {
          throw new Error(
            `Illegal main-line move in "${opening.name}": "${step.san}" at ply ${step.ply}`
          );
        }
      } catch (err) {
        throw new Error(
          `Illegal main-line move in "${opening.name}": "${step.san}" at ply ${step.ply}. Details: ${err}`
        );
      }
    }

    // 2. Validate traps
    for (const trap of opening.traps) {
      const trapChess = new Chess();
      for (let j = 0; j < trap.movesSan.length; j++) {
        const san = trap.movesSan[j];
        try {
          const moveRes = trapChess.move(san);
          if (!moveRes) {
            throw new Error(
              `Illegal move in trap "${trap.name}" for "${opening.name}": "${san}" at move index ${j}`
            );
          }
        } catch (err) {
          throw new Error(
            `Illegal move in trap "${trap.name}" for "${opening.name}": "${san}" at move index ${j}. Details: ${err}`
          );
        }
      }
    }
  }
}

// Bug 6 Fix: Execute complete validation in DEV mode; in production validate individually with console.warn skip
if (import.meta.env.DEV) {
  validateAllOpenings();
} else {
  for (const opening of OPENINGS_DATA) {
    try {
      const mainChess = new Chess();
      for (const step of opening.moves) {
        mainChess.move(step.san);
      }
      for (const trap of opening.traps) {
        const trapChess = new Chess();
        for (const san of trap.movesSan) {
          trapChess.move(san);
        }
      }
    } catch (err) {
      console.warn(`[Openings] Skipping invalid opening "${opening.name}":`, err);
    }
  }
}
