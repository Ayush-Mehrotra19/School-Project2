// app/(marketing)/landing/Landing.constants.ts
import type {
  Feature,
  Benefit,
  Testimonial,
  ComparisonFeature,
  FAQItem,
  FooterLink,
  SocialLink,
} from './Landing.types';

export const NAVIGATION_LINKS: FooterLink[] = [
  { label: 'Features', href: '#features' },
];

export const HERO_TITLE = 'Learning, Re invented';
export const HERO_DESCRIPTION =
  'Revolutionising learning with artificial intelligence, GrowMyIQ is the best way to learn in the 21st century.';
export const HERO_CTA = 'Get Started Now';

export const FEATURES_ROW_1: Feature[] = [
  {
    title: 'Smart Daily Quizzing, Tailored to You',
    description:
      'GrowMyIQ uses AI to quiz you regularly. Every quiz adapts to your strengths and weaknesses, helping you master topics faster.',
    badges: [
      { icon: 'star', text: 'Achieve Mastery' },
      { icon: 'check-circle', text: 'Catch mistakes before they real test' },
      { icon: 'chart-line', text: 'Perform well in tests' },
    ],
  },
  {
    title: 'Your Personalised Study Schedule – Done for You',
    description:
      'No more guesswork. GrowMyIQ auto-generates a smart study plan based on your syllabus, learning speed, and available time. Stay consistent, stay on track.',
  },
];

export const FEATURES_ROW_2: Feature[] = [
  {
    title: 'NCERT Integrated – Master Every Chapter',
    description:
      'Built-in NCERT content means you get quizzes, summaries, and insights directly mapped to the official curriculum. Ideal for CBSE students aiming for concept clarity and top scores.',
    hasChart: true,
  },
  {
    title: 'AI That Grows With You',
    description:
      'As you learn, so does GrowMyIQ. The more you use it, the better it understands your learning style—adapting content, difficulty, and timing to maximise your progress.',
    stats: [
      { icon: 'users', text: 'Better scores' },
      { icon: 'clock', text: 'Last 24 hrs' },
      { icon: 'trophy', text: 'Retention' },
      { icon: 'heart', text: 'More love from friends' },
    ],
  },
];

export const BENEFITS: Benefit[] = [
  {
    title: 'Save Time and Energy',
    description:
      'No more planning, no more searching for resources. GrowMyIQ handles scheduling and content delivery so you can focus 100% on learning.',
  },
  {
    title: 'Confidence You Can Feel',
    description:
      'Seeing your progress visualized, day by day, builds real confidence. You\'ll walk into every test knowing you\'re prepared.',
  },
  {
    title: 'Retain More, Forget Less',
    description:
      'Spaced repetition and smart revision cycles ensure knowledge sticks. You won\'t just cram—you\'ll remember long-term.',
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'Highly intuitive and polished. It\'s everything I needed and more!',
    rating: 5,
    name: 'Ishita',
    role: 'Student, NPS INR',
  },
  {
    quote: 'This is truly incredible and has saved me from so much stress!',
    rating: 5,
    name: 'Daksh Saxena',
    role: 'Student, NPS INR',
  },
  {
    quote: 'Pure brilliance! This has streamlined my life massively.',
    rating: 5,
    name: 'Daksh Jain',
    role: 'Student, NPS INR',
  },
  {
    quote: 'A top-notch solution! It\'s been transformative for our entire team.',
    rating: 5,
    name: 'Tapan Kaur',
    role: 'PO Marketing',
  },
  {
    quote: 'Amazing product! It\'s made our processes seamless and effective.',
    rating: 5,
    name: 'Jack Sharma',
    role: 'CEO',
  },
  {
    quote: 'Incredible design and functionality! This has exceeded my expectations.',
    rating: 5,
    name: 'Advait',
    role: 'Student, NPS INR',
  },
];

export const COMPARISON_GROWMYIQ: ComparisonFeature[] = [
  { feature: 'Effortless integration of co-curriculars', hasFeature: true },
  { feature: 'Take regular quizzes for better understanding', hasFeature: true },
  { feature: 'Visualise your progress', hasFeature: true },
  { feature: 'AI driven learning', hasFeature: true },
  { feature: 'Less stress', hasFeature: true },
];

export const COMPARISON_TRADITIONAL: ComparisonFeature[] = [
  { feature: 'Intense stress for co-curriculars', hasFeature: false },
  { feature: 'No scope of quizzing', hasFeature: false },
  { feature: 'No visualisation possible', hasFeature: false },
  { feature: 'Outdated and tedious', hasFeature: false },
  { feature: 'More stress', hasFeature: false },
];

export const FAQS: FAQItem[] = [
  {
    question: 'How is GrowMyIQ better than other platforms?',
    answer:
      'This template is designed to streamline your SaaS or startup\'s online presence with modern, user-centric design and seamless functionality, ensuring you stand out from competitors.',
  },
  {
    question: 'Can I customize the template to match my brand?',
    answer: '',
  },
  {
    question: 'Is this template optimized for SEO and speed?',
    answer: '',
  },
  {
    question: 'Is the template mobile-friendly?',
    answer: '',
  },
  {
    question: 'Can I use this template for commercial projects?',
    answer: '',
  },
];

export const CTA_TITLE = 'Grow Now with GrowMyIQ';
export const CTA_DESCRIPTION =
  'Unlock the power of data to drive smarter decisions and faster growth with our platform.';
export const CTA_PRIMARY = 'Get Started Now';
export const CTA_SECONDARY = 'Book a Demo';

export const FOOTER_LINKS: FooterLink[] = [
  { label: 'Pricing', href: '#pricing' },
  { label: 'Benefits', href: '#benefits' },
  { label: 'Contact', href: '#contact' },
  { label: 'Blog', href: '#blog' },
  { label: 'Privacy', href: '#privacy' },
  { label: 'landery@mail.com', href: 'mailto:landery@mail.com' },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { platform: 'instagram', href: '#' },
  { platform: 'twitter', href: '#' },
  { platform: 'facebook', href: '#' },
];

export const FOOTER_COPYRIGHT =
  '© 2023 — Copyright | GrowMyIQ does not guarantee any of the claims made';
