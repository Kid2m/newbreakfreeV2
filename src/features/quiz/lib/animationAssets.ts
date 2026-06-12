// Animation images for intro and inter-chapter break screens
// Mapped to available images in /public/images/quiz/

export const heroImage = '/images/quiz/image_1761938892892.png';
export const heroImageAlt = '/images/quiz/image_1761939241488.png';

// Boy animation frames per chapter
export const boyFrames: Record<string, string[]> = {
  past: [
    '/images/quiz/image (1)_1761843912323.png',
    '/images/quiz/image (2)_1761843912322.png',
    '/images/quiz/image (3)_1761843912322.png',
  ],
  patterns: [
    '/images/quiz/image (4)_1761843912321.png',
    '/images/quiz/image (5)_1761843912320.png',
    '/images/quiz/image (6)_1761843912319.png',
  ],
  healing: [
    '/images/quiz/image (7)_1761843912318.png',
    '/images/quiz/image (8)_1761844180444.png',
    '/images/quiz/image (9)_1761845243203.png',
  ],
  future: [
    '/images/quiz/image (10)_1761845281803.png',
    '/images/quiz/image (11)_1761849655292.png',
    '/images/quiz/image (12)_1761849655291.png',
  ],
};

// Girl animation frames per chapter
export const girlFrames: Record<string, string[]> = {
  past: [
    '/images/quiz/image (13)_1761849655291.png',
    '/images/quiz/image (14)_1761849655290.png',
    '/images/quiz/image (15)_1761849655289.png',
  ],
  patterns: [
    '/images/quiz/image (16)_1761849655289.png',
    '/images/quiz/image (17)_1761849655288.png',
    '/images/quiz/image (18)_1761865180223.png',
  ],
  healing: [
    '/images/quiz/ChatGPT Image 3 nov. 2025, 15_52_05_1762181570565.png',
    '/images/quiz/ChatGPT Image 3 nov. 2025, 15_56_30_1762181821528.png',
    '/images/quiz/ChatGPT Image 3 nov. 2025, 17_43_30_1762207670426.png',
  ],
  future: [
    '/images/quiz/ChatGPT Image 3 nov. 2025, 17_45_30_1762210333526.png',
    '/images/quiz/ChatGPT Image 3 nov. 2025, 17_45_30_1762221432155.png',
    '/images/quiz/ChatGPT Image 3 nov. 2025, 23_00_18_1762209169225.png',
  ],
};

// Chapter message shown on break screens
export const chapterMessages: Record<string, { title: string; subtitle: string }> = {
  patterns: {
    title: 'Your patterns are becoming clearer',
    subtitle: 'The way you were loved shapes the way you love',
  },
  healing: {
    title: 'Your healing is possible',
    subtitle: 'Understanding your past is the first step to freedom',
  },
  future: {
    title: 'Your future starts now',
    subtitle: 'You have the power to break free from what held you back',
  },
};
