/**
 * Bangla (বাংলা) Internationalization Strings and Helpers
 * "দাবা শিক্ষক" - Daba Shikkhok
 */

export const BANGLA_NUMERALS: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

export function toBanglaNumeral(val: number | string): string {
  const str = String(val);
  return str.replace(/[0-9]/g, (digit) => BANGLA_NUMERALS[digit] || digit);
}

export const PIECE_NAMES: Record<string, string> = {
  k: 'রাজা',
  q: 'মন্ত্রী',
  r: 'নৌকা',
  b: 'হাতি',
  n: 'ঘোড়া',
  p: 'সৈন্য',
  K: 'রাজা',
  Q: 'মন্ত্রী',
  R: 'নৌকা',
  B: 'হাতি',
  N: 'ঘোড়া',
  P: 'সৈন্য',
};

export const COLOR_NAMES = {
  white: 'সাদা',
  black: 'কালো',
  random: 'যেকোনো',
} as const;

export const bn = {
  appName: 'দাবা শিক্ষক',
  tagline: 'বাংলায় শিখুন আনন্দের সাথে দাবা',

  // Navigation
  nav: {
    home: 'হোম',
    play: 'খেলুন',
    review: 'রিভিউ',
    openings: 'ওপেনিং শেখো',
    puzzles: 'পাজল',
    settings: 'সেটিংস',
    soon: 'শীঘ্রই আসছে',
  },

  // Onboarding
  onboarding: {
    step1Title: 'স্বাগতম "দাবা শিক্ষক"-এ!',
    step1Desc: 'এখানে আপনি শুধু দাবা খেলবেন না, প্রতিটি চালের গভীরে গিয়ে শিক্ষকের মতো শিখতে পারবেন। ভুলগুলোই এখানে জয়ের সিঁড়ি!',
    step2Title: 'তুমি দাবায় কতটা অভিজ্ঞ?',
    step2Desc: 'তোমার উপযোগী বট ও শিক্ষণীয় বিশ্লেষণ বেছে নিতে এটি সাহায্য করবে।',
    levels: {
      beginner: {
        title: 'নতুন (Beginner)',
        desc: 'দাবার চালগুলো জানি, কিন্তু কীভাবে আক্রমণ বা প্রতিরক্ষা করতে হয় শিখতে চাই।',
        rating: '৬০০',
      },
      intermediate: {
        title: 'কিছুটা খেলি (Casual)',
        desc: 'বন্ধুদের সাথে খেলি, কিন্তু প্রায়ই ভুল বা ব্লান্ডার করে ফেলি।',
        rating: '৯০০',
      },
      advanced: {
        title: 'নিয়মিত খেলি (Club / Regular)',
        desc: 'কৌশল ও ট্যাকটিক্স বুঝি, নিজের সঠিক খেলার গভীর বিশ্লেষণ চাই।',
        rating: '১২০০',
      },
    },
    step3Title: 'কীভাবে দাবা শিক্ষক কাজ করে?',
    step3Desc: 'খেলার প্রতিটি পদক্ষেপ বিশ্লেষণ করে একজন শিক্ষক আপনাকে দেখাবেন কোন চালটি সেরা ছিল, কেন অসাবধানতা হয়েছে এবং কীভাবে ভবিষ্যতের খেলায় উন্নতি করবেন।',
    step3Point1: 'বন্ধুত্বপূর্ণ বট: যেকোনো স্তরে খেলতে পারবেন',
    step3Point2: 'শিক্ষকসুলভ রিভিউ: ভুল চালগুলোর সুন্দর সহজ ব্যাখ্যা',
    step3Point3: 'উন্নত রেটিং: প্রতি জয়ে আত্মবিশ্বাস ও রেটিং বাড়বে',
    btnNext: 'পরবর্তী',
    btnStart: 'শুরু করা যাক',
    btnBack: 'পেছনে',
  },

  // Home Screen
  home: {
    greetingMorning: 'শুভ সকাল!',
    greetingAfternoon: 'শুভ দুপুর!',
    greetingEvening: 'শুভ সন্ধ্যা!',
    currentRating: 'বর্তমান রেটিং',
    gamesPlayed: 'মোট খেলা',
    accuracyAvg: 'গড় নির্ভুলতা',
    startPlayCTA: 'খেলা শুরু করো',
    startPlaySub: 'বন্ধুত্বপূর্ণ রোবটের সাথে খেলা অনুশীলন করো',
    lastGame: 'সর্বশেষ খেলা',
    noGamesYet: 'এখনও কোনো খেলা সম্পন্ন হয়নি। একটি নতুন খেলা খেলে রিভিউ দেখো!',
    viewReview: 'রিভিউ দেখো',
    featuresTitle: 'শিখুন ও অনুশীলন করুন',
    featureOpenings: 'ওপেনিং শেখো',
    featureOpeningsDesc: 'ইতালিয়ান, সিসিলিয়ান ও কুইন্স গ্যাম্বিট',
    featurePuzzles: 'ট্যাকটিক্স পাজল',
    featurePuzzlesDesc: 'দৈনিক চেকমেট ও ফর্ক সমস্যা সমাধান',
    comingSoonBadge: 'শীঘ্রই আসছে',
    gameHistory: 'খেলার ইতিহাস',
    emptyHistory: 'কোনো পুরনো খেলা পাওয়া যায়নি।',
    resultWin: 'জয়',
    resultLoss: 'পরাজয়',
    resultDraw: 'ড্র',
  },

  // Play Screen
  play: {
    title: 'বটের সাথে খেলা',
    setupTitle: 'খেলার প্রস্তুতি',
    botLevel: 'বটের স্তর',
    botLevelDesc: 'লেভেল ১ থেকে ১০ বেছে নিন',
    chooseColor: 'আপনার ঘুঁটি',
    colorWhite: 'সাদা',
    colorBlack: 'কালো',
    colorRandom: 'যেকোনো',
    startGame: 'খেলা শুরু',
    botThinking: 'বট ভাবছে...',
    yourTurn: 'তোমার চাল (সাদা)',
    yourTurnBlack: 'তোমার চাল (কালো)',
    botTurn: 'বটের চাল',
    controls: {
      hint: 'হিন্ট',
      hintsRemaining: 'টি বাকি',
      undo: 'চাল ফেরত',
      undosRemaining: 'টি বাকি',
      resign: 'হার মানো',
      newGame: 'নতুন খেলা',
    },
    modals: {
      resignConfirmTitle: 'আপনি কি নিশ্চিত যে হার মানতে চান?',
      resignConfirmText: 'এই খেলাটি পরাজয় হিসেবে নথিবদ্ধ হবে।',
      confirmYes: 'হ্যাঁ, হার মানছি',
      confirmCancel: 'না, খেলা চালিয়ে যাই',
      newGameConfirmTitle: 'খেলা অসমাপ্ত রেখে নতুন খেলা শুরু করবেন?',
      newGameConfirmText: 'বর্তমান খেলার অগ্রগতি হারিয়ে যাবে।',
      newGameYes: 'নতুন খেলা শুরু করো',
    },
    promotion: {
      title: 'সৈন্য পদোন্নতি (Promotion)',
      choosePiece: 'কোন ঘুঁটি নিতে চান বেছে নিন:',
    },
    gameEnd: {
      winTitle: 'দারুণ! তুমি জিতেছ! 🎉',
      lossTitle: 'খেলাটি হেরে গেছ, তবে এখান থেকেই শেখার শুরু! 🤝',
      drawTitle: 'খেলাটি ড্র হয়েছে! ⚖️',
      checkmateWin: 'চেকমেট! আপনি অসাধারণ বুদ্ধিমত্তা দেখিয়েছেন।',
      checkmateLoss: 'চেকমেট! প্রতিপক্ষ জয়ী হয়েছে। চলুন রিভিউ দেখে ভুলগুলো শোধরাই।',
      stalemate: 'স্টেলমেট! রাজার কোনো বৈধ চাল নেই এবং কোনো চেক নেই।',
      threefold: 'একই অবস্থান তিনবার পুনরাবৃত্তি হওয়ায় খেলাটি ড্র হয়েছে।',
      insufficient: 'উভয় পক্ষেরই চেকমেট দেওয়ার মতো পর্যাপ্ত ঘুঁটি নেই।',
      fiftyMoves: '৫০ চালে কোনো সৈন্য চলেনি বা ঘুঁটি খাওয়া হয়নি।',
      resignation: 'আপনি হার মেনে নিয়েছেন।',
      btnReview: 'খেলা রিভিউ করো',
      btnPlayAgain: 'আবার খেলো',
      btnHome: 'হোমে ফিরে যাও',
      ratingChange: 'রেটিং পরিবর্তন',
      yourAccuracy: 'তোমার নির্ভুলতা',
    },
  },

  // Review Screen
  review: {
    title: 'শিক্ষকসুলভ রিভিউ',
    analyzingTitle: 'বিশ্লেষণ চলছে...',
    analyzingSubtitle: 'প্রতিটি চাল স্টকফিশ ইঞ্জিন দিয়ে সতর্কভাবে পরীক্ষা করা হচ্ছে',
    summaryTitle: 'খেলার সামগ্রিক ফলাফল',
    accuracyLabel: 'নির্ভুলতা',
    evalTitle: 'পজিশন মূল্যায়ন',
    playedMove: 'দেওয়া চাল',
    bestMove: 'সেরা চাল',
    showBestLine: 'সঠিক চালটা দেখাও',
    showingLine: 'সেরা লাইন দেখানো হচ্ছে...',
    prevMove: 'পূর্ববর্তী',
    nextMove: 'পরবর্তী',
    firstMove: 'শুরুতে',
    lastMove: 'শেষে',
    teacherSaid: 'শিক্ষকের পরামর্শ',
    noMovesToReview: 'রিভিউ করার মতো কোনো চাল নেই।',
    encouragement: {
      excellent: 'অসাধারণ খেলেছ! তোমার চালগুলো ছিল অত্যন্ত নিখুঁত ও তীক্ষ্ণ। গ্র্যান্ডমাস্টারদের মতো নিয়ন্ত্রণ ছিল!',
      great: 'খুব ভালো খেলেছ! মৌলিক নীতিগুলো সুন্দরভাবে মেনে চলেছ। সামান্য অসাবধানতা কাটিয়ে উঠলে আরও ভালো হবে।',
      good: 'ভালো চেষ্টা ছিল! বেশ কিছু চমৎকার চাল ছিল, তবে কয়েকটি ভুল চাল খেলার গতি পরিবর্তন করে দিয়েছে। ব্যাখ্যাগুলো খেয়াল করো।',
      learning: 'হতাশ হয়ো না! দাবা শেখার প্রথম ধাপই হলো ভুল থেকে শিক্ষা নেওয়া। প্রতিটি ভুল চিহ্নিত করে পুনরায় চেষ্টা করো।',
    },
    qualities: {
      brilliant: { label: 'দারুণ চাল', icon: '✨', desc: 'ইঞ্জিনের সেরা চাল' },
      good: { label: 'ভালো চাল', icon: '✅', desc: 'কার্যকর চাল' },
      inaccuracy: { label: 'অসাবধানতা', icon: '⚠️', desc: 'সামান্য দুর্বল চাল' },
      mistake: { label: 'ভুল', icon: '❌', desc: 'পজিশন বেশ পিছিয়ে গেছে' },
      blunder: { label: 'বড় ভুল', icon: '💥', desc: 'গুরুতর অসতর্কতা' },
    },
  },

  // Openings Feature
  openings: {
    title: 'ওপেনিং শেখো',
    subtitle: 'দাবার সেরা ৮টি উদ্বোধনী চাল, কৌশলগত ধারণা এবং প্রতিপক্ষের ফাঁদ এড়ানোর সহজ পাঠ',
    lessonTab: 'পাঠ (Lesson)',
    practiceTab: 'অনুশীলন (Practice)',
    trapsTab: 'বিপদজনক ফাঁদ (Traps)',
    difficultyLabel: 'কঠিন্যতা',
    colorSideLabel: 'ঘুঁটি',
    forWhite: 'সাদা পক্ষের ওপেনিং',
    forBlack: 'কালো পক্ষের ওপেনিং',
    whyThisMove: 'কেন এই চাল?',
    mainIdeaTitle: 'মূল কৌশল ও পরিকল্পনা',
    progressCompleted: 'পাঠ সম্পন্ন',
    practiceBestScore: 'সর্বোচ্চ স্কোর',
    notStarted: 'শুরু হয়নি',
    btnStartLesson: 'পাঠ শুরু করো',
    btnStartPractice: 'অনুশীলন করো',
    lessonCompleteTitle: 'অভিনন্দন! পাঠটি সম্পন্ন হয়েছে! 🎓',
    lessonCompleteDesc: 'আপনি এই ওপেনিংয়ের মূল চালগুলো সফলভাবে দেখে নিয়েছেন। এবার অনুশীলন মোডে পরীক্ষা দিয়ে হাত পাকাও!',
    practiceGoal: 'তোমার দিক থেকে সঠিক চালটি চালুন। ভুল হলে শিক্ষক তোমাকে পথ দেখাবেন!',
    yourMovePrompt: 'তোমার চাল:',
    correctMoveFeedback: 'চমৎকার! সঠিক চাল!',
    wrongMoveHint1: 'ভুল চাল! ইঙ্গিত: ঘুঁটিগুলোর নিয়ন্ত্রণ ও কেন্দ্রের সুরক্ষার কথা ভাবুন।',
    wrongMoveHint2: 'সঠিক চালটি ছিল: {move}। এবার চালটি দিয়ে সামনে এগোন!',
    practiceSuccessTitle: 'অসাধারণ! সফলভাবে অনুশীলন সম্পন্ন! 🏆',
    practiceScoreLabel: 'অনুশীলন স্কোর:',
    trapsTitle: 'প্রতিপক্ষের সাধারণ ফাঁদ',
    trapsDesc: 'এই ওপেনিংয়ে যে বিপজ্জনক ভুল বা ফাঁদে বেশিরভাগ খেলোয়াড় পা দেন:',
    viewTrapLine: 'ফাঁদ দেখুন',
  },

  // Settings Screen
  settings: {
    title: 'সেটিংস ও প্রোফাইল',
    sound: 'শব্দ প্রভাব (Sound FX)',
    soundDesc: 'চাল ও সতর্কবার্তার জন্য মৃদু অডিও',
    showLegalMoves: 'বৈধ চালের বিন্দু দেখাও',
    showLegalMovesDesc: 'ঘুঁটিতে চাপ দিলে সম্ভাব্য ঘরগুলো নির্দেশিত হবে',
    boardTheme: 'বোর্ডের থিম',
    themes: {
      classic: 'সবুজ ও ক্রিম (ডিফল্ট)',
      wood: 'উডেন ও বাদামি',
      green: 'ডার্ক অলিভ',
    },
    dangerZone: 'তথ্য পরিষ্কার (Reset)',
    resetBtn: 'সকল রেকর্ড মুছুন',
    resetConfirm: 'আপনি কি নিশ্চিত? সব খেলার ইতিহাস ও রেটিং মুছে প্রাথমিক অবস্থায় ফিরে যাবে।',
    savedSuccess: 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে।',
  },

  // Common UI
  ui: {
    loading: 'লোড হচ্ছে...',
    errorTitle: 'একটি সমস্যা হয়েছে',
    engineLoading: 'দাবা ইঞ্জিন প্রস্তুত করা হচ্ছে...',
    engineError: 'ইঞ্জিন লোড হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।',
    engineRetry: 'পুনরায় চেষ্টা করো',
    back: 'ফিরে যান',
    save: 'সংরক্ষণ',
    cancel: 'বাতিল',
    close: 'বন্ধ করুন',
    white: 'সাদা',
    black: 'কালো',
    advantage: 'সুবিধা',
    equality: 'সমান সমান',
  },
} as const;
