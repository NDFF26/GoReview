export interface ReviewOption {
  id: string;
  text: string;
  category?: string;
}

export interface ReviewTopicData {
  topic: string;
  languages: {
    [languageName: string]: string[];
  };
}

export interface BusinessReviewDataMap {
  [username: string]: {
    businessName: string;
    topics: string[];
    languages?: string[];
    reviews: {
      [topic: string]: {
        [language: string]: string[];
      };
    };
  };
}

export interface BusinessUser {
  id: string;
  username: string; // Slug e.g. "velocityi2", "khushiagency"
  businessName: string; // e.g. "Velocity i2 Solutions"
  tagline: string; // e.g. "IT & Digital Growth Partner"
  logoUrl?: string;
  coverUrl?: string;
  googleReviewUrl: string; // Direct Google Place review URL
  googlePlaceId?: string;
  ratingScore: number; // e.g. 4.9
  reviewCount: number; // e.g. 128
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  mapUrl: string;
  description: string;
  operatingHours: string;
  
  // Social Media Links
  instagram?: string;
  facebook?: string;
  website?: string;
  youtube?: string;
  twitter?: string;
  linkedin?: string;

  // Custom Topics & Multi-language Reviews Data
  topics?: string[];
  languages?: string[];
  reviewTopics?: ReviewTopicData[];

  // Custom Positive Review Templates
  reviewOptions: ReviewOption[];
  
  // Private Feedback Configuration for rating <= 3
  enablePrivateFeedback: boolean;
  privateFeedbackEmail?: string;
  privateFeedbackPhone?: string;

  // Analytics counters
  pageViews: number;
  reviewClicks: number;
  contactClicks: number;

  // Subscription & Account Status
  isDisabled?: boolean;
  subscriptionStartDate?: string;
  subscriptionExpiryDate?: string;

  createdAt: string;
  updatedAt: string;
}
