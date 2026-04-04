export const WORD_BANKS = {
  easy: [
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',
    'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how',
    'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did',
    'its', 'let', 'put', 'say', 'she', 'too', 'use', 'big', 'car', 'cat',
    'dog', 'eat', 'end', 'fun', 'got', 'had', 'has', 'hat', 'her', 'hot'
  ],
  medium: [
    'about', 'after', 'again', 'because', 'before', 'being', 'between', 'call', 'come', 'could',
    'every', 'first', 'found', 'great', 'group', 'little', 'might', 'never', 'other', 'place',
    'right', 'should', 'small', 'still', 'their', 'these', 'think', 'those', 'three', 'time',
    'under', 'until', 'water', 'where', 'which', 'while', 'world', 'would', 'write', 'years',
    'school', 'number', 'system', 'person', 'people', 'government', 'problem', 'question'
  ],
  hard: [
    'absolute', 'abstract', 'accelerate', 'accommodate', 'accumulate', 'acknowledge', 'acquire', 'adamant',
    'adjacent', 'adjunct', 'admonish', 'adolescent', 'adorn', 'adversary', 'advertise', 'aesthetic',
    'affable', 'affectation', 'affinity', 'affluence', 'afford', 'aforementioned', 'affront', 'aggregate',
    'aggression', 'agile', 'agitate', 'agonize', 'agrarian', 'agriculture', 'algorithm', 'alienate',
    'alignment', 'alleviate', 'alliteration', 'allocate', 'allusion', 'almighty', 'altercation', 'alternate',
    'altimeter', 'altruism', 'amalgamate', 'amateur', 'ambiguous', 'ambition', 'ambulance', 'amendment',
    'amenity', 'amiable', 'amicable', 'ammunition', 'amnesia', 'amnesty', 'amphibian', 'amphitheater'
  ],
  insane: [
    'syzygy', 'pneumonoultramicroscopicsilicovolcanoconiosis', 'onomatopoeia', 'pseudopseudohypoparathyroidism',
    'floccinaucinilicilification', 'antidisestablishmentarianism', 'hippopotomonstrosesquippedaliophobia',
    'supercalifragilisticexpialidocious', 'incomprehensibility', 'sesquipedalian', 'gobbledygook',
    'gobbledygookers', 'bumbershoot', 'collywobbles', 'gobbledygook', 'collywobbles', 'gobbledygookers',
    'gobbledygook', 'bumbershoots', 'widdershins', 'gobbledygook', 'collywobbles', 'gobbledygookers',
    'gobbledygook', 'floccinaucinilicilification', 'pneumonoultramicroscopicsilicovolcanoconiosis',
    'incomprehensibilities', 'antidisestablishmentarianisms', 'pseudopseudohypoparathyroidisms',
    'sesquipedalian', 'sesquipedalianism', 'sesquipedalianism', 'gobbledygook', 'collywobbles'
  ]
};

export const QUOTES = {
  easy: [
    'The quick brown fox jumps over the lazy dog.',
    'Practice makes perfect.',
    'All good things must come to an end.',
    'Better late than never.',
    'Do your best and forget the rest.',
    'Easy come, easy go.',
    'Every cloud has a silver lining.',
    'Good morning and good night.',
    'Happy as a clam.',
    'I love to read and write.'
  ],
  medium: [
    'The early bird gets the worm, but the second mouse gets the cheese.',
    'Opportunities are like sunrises. If you wait too long, you miss them.',
    'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    'The only way to do great work is to love what you do.',
    'Innovation distinguishes between a leader and a follower.',
    'Life is what happens when you are busy making other plans.',
    'The future belongs to those who believe in the beauty of their dreams.',
    'Technology is best when it brings people together.',
    'Stay hungry, stay foolish.',
    'The only true wisdom is in knowing you know nothing.'
  ],
  hard: [
    'It is a truth universally acknowledged that a single man in possession of a good fortune must be in want of a wife.',
    'Call me Ishmael. Some years ago, never mind how long precisely, having little or no money in my purse.',
    'Whether I shall turn out to be the hero of my own life depends wholly on these pages.',
    'All this happened, more or less. The war parts, anyway, are pretty much true.',
    'It was the best of times, it was the worst of times, it was the age of wisdom.',
    'Mother died today. Or maybe yesterday; I do not know anymore than I can tell about the time.',
    'Somewhere in La Mancha, in a place whose name I care not to remember, a gentleman lived.',
    'You do not know about me without you have read a book called the Adventures of Tom Sawyer.',
    'Once upon a time and a very good time it was, there was a boy named Stephen.',
    'I am an invisible man, not because of any biochemical accident but because of the particular position.'
  ],
  insane: [
    'The instantaneous, uncoordinated firing of cortical neurons is an electroencephalographic signature of an epileptic seizure.',
    'Supercalifragilisticexpialidocious is a word that means wonderful, and it is usually used by children.',
    'Antidisestablishmentarianism is a political position that developed in 19th-century Britain.',
    'Pneumonoultramicroscopicsilicovolcanoconiosis is considered the longest word in the English dictionary.',
    'Floccinaucinihilipilification is the act or habit of describing or regarding something as unimportant.',
    'Hippopotomonstrosesquippedaliophobia is one of the longest words in the dictionary, and, in an ironic twist, is the name for a fear of long words.',
    'Pseudopseudohypoparathyroidism is an inherited disorder that closely simulates the symptoms but not the consequences of pseudohypoparathyroidism.',
    'Incomprehensibilities is a word that means things that are impossible to understand.',
    'Honorificabilitudinitatibus is the longest word in the English language featuring alternating consonants and vowels.',
    'Thyroparathyroidectomized is a medical term that defines the excision of both the thyroid and parathyroid glands.'
  ]
};

type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'insane';

const PARAGRAPH_SUBJECTS = [
  'A focused developer', 'The design team', 'A curious student', 'The support engineer', 'A patient researcher',
  'The product manager', 'A careful analyst', 'The startup founder', 'The operations lead', 'A thoughtful writer',
  'The QA specialist', 'A dedicated learner'
];

const PARAGRAPH_VERBS = [
  'reviews', 'improves', 'documents', 'tests', 'refines', 'explains', 'tracks', 'rebuilds', 'optimizes', 'evaluates',
  'compares', 'summarizes'
];

const PARAGRAPH_OBJECTS = [
  'the workflow', 'the release notes', 'the deployment plan', 'the user journey', 'the data model', 'the test strategy',
  'the error logs', 'the API response', 'the build pipeline', 'the design system', 'the typing session', 'the quality checklist'
];

const PARAGRAPH_OUTCOMES = [
  'so the next decision is easier and clearer', 'so the team can move faster without losing quality',
  'so users feel confident while finishing their tasks', 'so edge cases are handled before release',
  'so performance remains stable under pressure', 'so everyone understands what to improve next',
  'so the final result feels reliable and polished', 'so future maintenance becomes simpler and safer'
];

const QUOTE_OPENERS = [
  'Great products improve when teams', 'Reliable software appears when engineers', 'Progress compounds when people',
  'Strong habits are built when developers', 'Meaningful velocity happens when teams', 'Clear thinking emerges when builders',
  'Long-term quality improves when organizations', 'Technical confidence grows when contributors',
  'Healthy systems evolve when maintainers', 'Sustainable delivery happens when teams',
  'Better outcomes arrive when creators', 'Winning execution starts when teams',
  'User trust grows when products', 'Craftsmanship improves when coders', 'Resilient architecture forms when engineers',
  'Learning accelerates when teams', 'Innovation becomes practical when makers', 'Consistent progress appears when teams',
  'Impact increases when builders', 'Collaboration improves when teams', 'Focus deepens when contributors',
  'Shipping gets easier when teams', 'Momentum rises when engineers', 'Systems stay healthy when teams',
  'Clarity scales when teams'
];

const QUOTE_MIDDLES = [
  'measure real behavior', 'document assumptions', 'review feedback early', 'simplify complex paths',
  'fix root causes', 'test critical flows', 'share context openly', 'protect user attention',
  'refactor with purpose', 'validate ideas quickly', 'prioritize reliability', 'design for readability',
  'automate repetitive checks', 'watch production signals', 'keep interfaces predictable',
  'treat failures as data', 'write clear acceptance criteria', 'reduce unnecessary dependencies',
  'keep experiments reversible', 'align on outcomes', 'maintain healthy defaults', 'reduce cognitive load',
  'practice deliberate iteration', 'own quality together', 'stabilize first, optimize second'
];

const QUOTE_ENDINGS = [
  'because trust is earned one decision at a time.', 'because clarity prevents expensive confusion.',
  'because speed without quality eventually slows down.', 'because consistency is a competitive advantage.',
  'because simple systems are easier to improve.', 'because evidence beats opinion in the long run.',
  'because maintainability protects future momentum.', 'because users remember dependable experiences.',
  'because thoughtful defaults reduce hidden risk.', 'because small improvements compound every week.',
  'because resilient teams prepare for change.', 'because readable code enables faster collaboration.',
  'because clear ownership reduces delivery friction.', 'because healthy processes reduce avoidable rework.',
  'because deliberate practice improves execution.', 'because feedback loops sharpen product judgment.',
  'because robust testing enables confident releases.', 'because good architecture supports rapid learning.',
  'because measurable goals keep efforts aligned.', 'because durable solutions outlast quick fixes.',
  'because careful tradeoffs protect user value.', 'because quality and velocity are partners.',
  'because focus turns effort into outcomes.', 'because dependable systems create real leverage.',
  'because disciplined teams ship better work.'
];

export const QUOTE_POOL_SIZE = QUOTE_OPENERS.length * QUOTE_MIDDLES.length * QUOTE_ENDINGS.length;

function pickSeeded(words: string[], seed: number): string {
  const index = Math.abs(seed) % words.length;
  return words[index];
}

function normalizeDictionaryWords(words: string[]): string[] {
  return words
    .map((word) => word.toLowerCase().trim())
    .filter((word) => /^[a-z]+$/.test(word) && word.length >= 3 && word.length <= 14);
}

function resolveDifficultyWords(difficulty: DifficultyLevel): string[] {
  return WORD_BANKS[difficulty] || WORD_BANKS.medium;
}

export function generateDynamicQuote(seed: number, dictionaryWords: string[] = []): string {
  const a = Math.imul(seed + 17, 1103515245);
  const b = Math.imul(seed + 31, 1664525);
  const c = Math.imul(seed + 73, 1013904223);

  const opener = pickSeeded(QUOTE_OPENERS, a);
  const middle = pickSeeded(QUOTE_MIDDLES, b);
  const ending = pickSeeded(QUOTE_ENDINGS, c);

  const dictionary = normalizeDictionaryWords(dictionaryWords);
  const optionalTerm = dictionary.length > 0 ? pickSeeded(dictionary, a ^ b ^ c) : '';

  if (optionalTerm && optionalTerm.length > 6) {
    return `${opener} ${middle}, especially around ${optionalTerm}, ${ending}`;
  }

  return `${opener} ${middle}, ${ending}`;
}

export function generateMeaningfulParagraph(
  targetWords: number,
  difficulty: DifficultyLevel,
  dictionaryWords: string[] = [],
  seed = Date.now()
): string {
  const fallback = resolveDifficultyWords(difficulty);
  const dictionary = normalizeDictionaryWords(dictionaryWords);
  const paragraph: string[] = [];

  let cursor = seed;
  while (paragraph.join(' ').split(/\s+/).filter(Boolean).length < targetWords) {
    const subject = pickSeeded(PARAGRAPH_SUBJECTS, cursor++);
    const verb = pickSeeded(PARAGRAPH_VERBS, cursor++);
    const object = pickSeeded(PARAGRAPH_OBJECTS, cursor++);
    const outcome = pickSeeded(PARAGRAPH_OUTCOMES, cursor++);

    const optionalWord = dictionary.length > 0
      ? pickSeeded(dictionary, cursor++)
      : pickSeeded(fallback, cursor++);

    paragraph.push(`${subject} ${verb} ${object} with ${optionalWord}, ${outcome}.`);

    if (paragraph.length > 24) break;
  }

  return paragraph.join(' ');
}
