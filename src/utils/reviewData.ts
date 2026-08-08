import defaultReviewsMap from '../data/defaultReviews.json';
import { BusinessReviewDataMap, BusinessUser } from '../types/user';

const REVIEWS_STORAGE_KEY = 'goreview_business_topics_reviews_v1';

export function getStoredReviewDataMap(): BusinessReviewDataMap {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...defaultReviewsMap, ...parsed };
      }
    }
  } catch (e) {
    console.error('Failed to parse stored review data map:', e);
  }
  return defaultReviewsMap as BusinessReviewDataMap;
}

export function saveReviewDataMap(map: BusinessReviewDataMap): void {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save review data map:', e);
  }
}

export function getBusinessTopicsAndLanguages(userOrUsername: BusinessUser | string) {
  let userObj: BusinessUser | undefined;
  let username = '';

  if (typeof userOrUsername === 'string') {
    username = userOrUsername;
  } else {
    userObj = userOrUsername;
    username = userObj.username;
  }

  const map = getStoredReviewDataMap();
  const cleanUser = username.trim().toLowerCase();
  const storedData = map[cleanUser];

  // Topics priority: userObj.topics -> storedData.topics -> empty []
  let topics: string[] = [];
  if (userObj && Array.isArray(userObj.topics)) {
    topics = userObj.topics;
  } else if (storedData && Array.isArray(storedData.topics)) {
    topics = storedData.topics;
  } else {
    topics = [];
  }

  // Languages priority: userObj.languages -> storedData.languages -> defaults
  let languages: string[] = [];
  if (userObj?.languages && userObj.languages.length > 0) {
    languages = userObj.languages;
  } else if (storedData?.languages && storedData.languages.length > 0) {
    languages = storedData.languages;
  } else {
    languages = ['English', 'Gujarati', 'Hindi'];
  }

  const reviews = storedData?.reviews || {};

  return { topics, languages, reviews };
}

export function getRandomReviewForTopicAndLanguage(
  userOrUsername: BusinessUser | string,
  topic: string,
  language: string,
  businessName: string
): string {
  let userObj: BusinessUser | undefined;
  let username = '';

  if (typeof userOrUsername === 'string') {
    username = userOrUsername;
  } else {
    userObj = userOrUsername;
    username = userObj.username;
  }

  const { reviews } = getBusinessTopicsAndLanguages(userOrUsername);

  const langLower = language.toLowerCase();
  const isGuj = langLower.includes('guj');
  const isHin = langLower.includes('hin');
  const isEng = langLower.includes('eng') || (!isGuj && !isHin);

  // Pool of reviews strictly matching selected language
  const candidateList: string[] = [];

  // 1. From stored review map for topic & language
  const topicObj = reviews[topic];
  if (topicObj) {
    Object.keys(topicObj).forEach((k) => {
      const kLower = k.toLowerCase();
      if (
        (isGuj && kLower.includes('guj')) ||
        (isHin && kLower.includes('hin')) ||
        (isEng && kLower.includes('eng'))
      ) {
        if (Array.isArray(topicObj[k])) {
          candidateList.push(...topicObj[k]);
        }
      }
    });
  }

  // 2. From userObj.reviewOptions ONLY if language matches
  if (userObj?.reviewOptions && userObj.reviewOptions.length > 0) {
    userObj.reviewOptions.forEach((opt) => {
      if (!opt.category || opt.category.toLowerCase().includes(topic.toLowerCase())) {
        const textLower = opt.text.toLowerCase();
        if (isGuj && (textLower.includes('chhe') || textLower.includes('khub') || textLower.includes('saras') || textLower.includes('ni '))) {
          candidateList.push(opt.text);
        } else if (isHin && (textLower.includes('hai') || textLower.includes('bahut') || textLower.includes('ki ') || textLower.includes('ke '))) {
          candidateList.push(opt.text);
        } else if (isEng && !textLower.includes('chhe') && !textLower.includes('hai')) {
          candidateList.push(opt.text);
        }
      }
    });
  }

  // Filter valid candidates
  const validCandidates = candidateList.filter((str) => str && str.trim().length > 0);

  if (validCandidates.length > 0) {
    const chosen = validCandidates[Math.floor(Math.random() * validCandidates.length)];
    return chosen;
  }

  // Short 3-15 word realistic fallbacks per language (Gujlish & Hinglish)
  if (isGuj) {
    const gujlishTemplates = [
      `${businessName} ni ${topic} service and quality khub j saras chhe!`,
      `Khub j fast and reliable ${topic} work done by ${businessName}.`,
      `Well trained team and completely satisfying ${topic} results!`,
      `${businessName} sathe ${topic} mate kaam karvano khub saras anubhav rahyo.`
    ];
    return gujlishTemplates[Math.floor(Math.random() * gujlishTemplates.length)];
  }

  if (isHin) {
    const hinglishTemplates = [
      `${businessName} ki ${topic} service aur quality bahut hi badhiya hai!`,
      `Bahut hi fast aur trustworthy ${topic} work. Highly recommended!`,
      `Excellent service and extremely supportive team at ${businessName}.`,
      `${businessName} ke saath ${topic} ke liye bahut accha experience raha.`
    ];
    return hinglishTemplates[Math.floor(Math.random() * hinglishTemplates.length)];
  }

  // Default English 3-15 word templates
  const engTemplates = [
    `Flawless quality and top notch service for ${topic}!`,
    `Extremely fast turnaround time and reliable ${topic} work.`,
    `Highly professional team at ${businessName}. Great experience!`,
    `Outstanding performance and component quality in ${topic}.`,
    `Superb customer support and transparent process. Highly recommended!`
  ];
  return engTemplates[Math.floor(Math.random() * engTemplates.length)];
}

export async function fetchAiReview(
  businessName: string,
  topic: string,
  language: string,
  tagline?: string
): Promise<string[]> {
  try {
    const response = await fetch('/api/generate-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessName, topic, language, tagline })
    });

    if (!response.ok) {
      throw new Error(`Server status ${response.status}`);
    }

    const data = await response.json();
    if (data && Array.isArray(data.reviews) && data.reviews.length > 0) {
      return data.reviews;
    }
  } catch (err) {
    console.warn('AI review generation fallback to review.json:', err);
  }
  return [];
}
