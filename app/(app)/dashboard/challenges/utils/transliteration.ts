// Transliteration to Arabic converter
const transliterationMap: Record<string, string> = {
  // Basic letters
  a: 'ا',
  b: 'ب',
  t: 'ت',
  th: 'ث',
  j: 'ج',
  h: 'ح',
  kh: 'خ',
  d: 'د',
  dh: 'ذ',
  r: 'ر',
  z: 'ز',
  s: 'س',
  sh: 'ش',
  S: 'ص',
  D: 'ض',
  T: 'ط',
  Z: 'ظ',
  aa: 'ع',
  gh: 'غ',
  f: 'ف',
  q: 'ق',
  k: 'ك',
  l: 'ل',
  m: 'م',
  n: 'ن',
  w: 'و',
  y: 'ي',
  H: 'ه',

  // Special characters
  "'": 'ء',
  '3': 'ع',
  '2': 'أ',
  '7': 'ح',
  '6': 'ط',
  '9': 'ق',

  // Common words
  allah: 'الله',
  Allah: 'الله',
  al: 'ال',
  Al: 'ال',
  wa: 'و',
  bi: 'ب',
  li: 'ل',
  fi: 'ف',
  min: 'من',
  ila: 'إلى',
  an: 'أن',
  ma: 'ما',
  la: 'لا',
  inna: 'إن',
  anna: 'أن'
};

export function transliterateToArabic(input: string): string {
  if (!input) return '';

  // If already Arabic, return as is
  if (/[\u0600-\u06FF]/.test(input)) {
    return input;
  }

  let result = input.toLowerCase().trim();

  // Sort by length (longest first) to match multi-character patterns first
  const sortedKeys = Object.keys(transliterationMap).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const regex = new RegExp(key, 'gi');
    result = result.replace(regex, transliterationMap[key]);
  }

  return result;
}

export function normalizeArabic(text: string): string {
  return text
    .replace(/[ًٌٍَُِّْ]/g, '') // Remove diacritics
    .replace(/[أإآ]/g, 'ا') // Normalize alif
    .replace(/ة/g, 'ه') // Normalize taa marbouta
    .replace(/ى/g, 'ي') // Normalize alif maqsura
    .trim();
}

export function compareArabicText(input: string, answer: string): boolean {
  const normalizedInput = normalizeArabic(input);
  const normalizedAnswer = normalizeArabic(answer);
  return normalizedInput === normalizedAnswer;
}
