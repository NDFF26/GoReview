import { BusinessUser } from '../types/user';

export const INITIAL_USERS: BusinessUser[] = [
  {
    id: 'user_rectospizzanikol',
    username: 'rectos-pizza-nikol',
    businessName: "Recto's Pizza Nikol",
    tagline: 'Pizza restaurant',
    logoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=1200&auto=format&fit=crop&q=80',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJ0wyzA-KHXjkRzQOAWeLaXJQ',
    googlePlaceId: 'ChIJ0wyzA-KHXjkRzQOAWeLaXJQ',
    ratingScore: 4.9,
    reviewCount: 230,
    phone: '+91 98989 89898',
    whatsapp: '919898989898',
    email: 'rectospizza.nikol@gmail.com',
    address: 'Opp. Rajhans Cinema, Pujan Shopping Mall, Nikol, Ahmedabad, Gujarat 382350',
    mapUrl: 'https://maps.google.com/?q=Recto+Pizza+Nikol+Ahmedabad',
    description: "Gujarat’s first rectangle pizza has officially arrived in Nikol! 🍕 At Recto's Pizza Nikol, we break the mold of traditional round pizzas by serving crispy, delicious rectangle pizzas loaded with fresh ingredients and premium melted cheese. Located right opposite Rajhans Cinema in Pujan Shopping Mall, we are the ultimate hangout spot for food lovers, families, and friends. Beyond our signature square slices, our extensive menu features mouthwatering burgers, cheesy garlic bread, pastas, sizzling French fries, and rich Choco Lava cakes. Complete your meal with our refreshing mocktails, thick milkshakes, or ice-cold coffee. Whether you are catching a quick bite before a movie or looking for an affordable, delicious dining experience, Recto's Pizza delivers incredible taste in every square inch. Visit us today to experience the rectangle pizza revolution!",
    operatingHours: 'Mon - Sun: 11:00 AM - 11:00 PM',
    instagram: 'https://instagram.com/rectospizzanikol',
    facebook: 'https://facebook.com/rectospizzanikol',
    website: 'https://goreview.in/user/rectos-pizza-nikol/',
    topics: [],
    languages: ['English', 'Gujarati', 'Hindi'],
    reviewOptions: [
      {
        id: 'rev_r1',
        text: 'Best rectangle pizza in Nikol! Super crispy crust, extra cheese, and mouthwatering taste.',
        category: 'Food Quality'
      },
      {
        id: 'rev_r2',
        text: 'Awesome hangout spot opposite Rajhans Cinema. Loved the cheesy garlic bread & Choco Lava cake!',
        category: 'Ambiance'
      },
      {
        id: 'rev_r3',
        text: 'Delicious food, fast service, and great prices. Must visit with family & friends!',
        category: 'Service'
      }
    ],
    enablePrivateFeedback: true,
    privateFeedbackEmail: 'rectospizza.nikol@gmail.com',
    privateFeedbackPhone: '+91 98989 89898',
    pageViews: 1250,
    reviewClicks: 480,
    contactClicks: 320,
    isDisabled: false,
    subscriptionStartDate: '2026-01-01',
    subscriptionExpiryDate: '2027-01-01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user_goreview',
    username: 'goreview',
    businessName: 'GoReview.in',
    tagline: 'Google Review writing solution',
    logoUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJ_goreview_in',
    googlePlaceId: 'ChIJ_goreview_in',
    ratingScore: 4.8,
    reviewCount: 310,
    phone: '+91 83203 44204',
    whatsapp: '918320344204',
    email: 'contact@goreview.in',
    address: 'Ahmedabad, Gujarat, India',
    mapUrl: 'https://maps.google.com/?q=Ahmedabad+Gujarat',
    description: 'GoReview.in helps businesses multiply their genuine 5-star Google reviews effortlessly with smart direct landing pages and automated review tools.',
    operatingHours: 'Mon - Sat: 09:00 AM - 08:00 PM',
    topics: ['GoogleReview', 'Review writing'],
    languages: ['English', 'Gujarati', 'Hindi'],
    reviewOptions: [
      {
        id: 'rev_g1',
        text: 'Superb platform for boosting 5-star Google reviews! Fast setup and awesome features.',
        category: 'GoogleReview'
      },
      {
        id: 'rev_g2',
        text: 'Highly effective tool for client review collection. Excellent customer support!',
        category: 'Review writing'
      }
    ],
    enablePrivateFeedback: true,
    privateFeedbackEmail: 'contact@goreview.in',
    privateFeedbackPhone: '+91 83203 44204',
    pageViews: 546,
    reviewClicks: 190,
    contactClicks: 218,
    isDisabled: false,
    subscriptionStartDate: '2026-08-07',
    subscriptionExpiryDate: '2026-09-07',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user_velocityi2',
    username: 'velocityi2',
    businessName: 'Velocity - Igniting Innovation',
    tagline: 'PCB Design, Hardware & Product Development',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_velocity_i2_solutions',
    googlePlaceId: 'ChIJN1t_velocity_i2_solutions',
    ratingScore: 4.9,
    reviewCount: 142,
    phone: '+91 98765 43210',
    whatsapp: '919876543210',
    email: 'info@velocityi2.com',
    address: 'SF/3, Shivam Complex, nr. Rajhans cinema, New India Colony, Nikol, Ahmedabad, Gujarat-380049',
    mapUrl: 'https://maps.google.com/?q=Nikol+Ahmedabad+Gujarat',
    description: 'Velocity is a pioneer in PCB Design, Hardware Architecture, Microcontroller Firmware, and End-to-End Product Development.',
    operatingHours: 'Mon - Sat: 09:30 AM - 07:00 PM',
    instagram: 'https://instagram.com/velocityi2',
    facebook: 'https://facebook.com/velocityi2',
    website: 'https://goreview.in/user/velocityi2/',
    youtube: 'https://youtube.com/@velocityi2',
    linkedin: 'https://linkedin.com/company/velocityi2',
    topics: [],
    languages: [
      'English',
      'Gujarati',
      'Hindi'
    ],
    reviewOptions: [
      {
        id: 'rev_v1',
        text: 'Flawless track clearance and spacing configuration. Outstanding PCB routing skills!',
        category: 'PCB Design'
      },
      {
        id: 'rev_v2',
        text: 'Exceptional hardware architecture with reliable performance and top quality components.',
        category: 'Hardware'
      },
      {
        id: 'rev_v3',
        text: 'Robust firmware implementation with zero bugs and smooth execution.',
        category: 'Firmware'
      }
    ],
    enablePrivateFeedback: true,
    privateFeedbackEmail: 'feedback@velocityi2.com',
    privateFeedbackPhone: '+91 98765 43210',
    pageViews: 520,
    reviewClicks: 184,
    contactClicks: 210,
    isDisabled: false,
    subscriptionStartDate: '2026-01-01',
    subscriptionExpiryDate: '2027-01-01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user_khushiagency',
    username: 'khushiagency',
    businessName: 'Khushi Agency',
    tagline: 'Insurance Advisory, Documentation & Financial Services',
    logoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJ_khushi_agency_place_id',
    googlePlaceId: 'ChIJ_khushi_agency_place_id',
    ratingScore: 4.8,
    reviewCount: 98,
    phone: '+91 98123 45678',
    whatsapp: '919812345678',
    email: 'support@khushiagency.com',
    address: 'Shop 12, Commercial Complex, Near Main Station, City Center',
    mapUrl: 'https://maps.google.com/?q=Khushi+Agency',
    description: 'Khushi Agency provides trusted financial consultancy, health & life insurance advisory, property documentation, and hassle-free agency services.',
    operatingHours: 'Mon - Sun: 09:00 AM - 08:00 PM',
    instagram: 'https://instagram.com/khushiagency',
    facebook: 'https://facebook.com/khushiagency',
    website: 'https://goreview.in/user/khushiagency/',
    topics: [],
    languages: [
      'English',
      'Gujarati',
      'Hindi'
    ],
    reviewOptions: [
      {
        id: 'rev_k1',
        text: 'Trustworthy and quick financial guidance! Very helpful staff and completely transparent process.',
        category: 'Insurance'
      },
      {
        id: 'rev_k2',
        text: 'Excellent agency for all documentation and insurance advisory. 10/10 service!',
        category: 'Documentation'
      }
    ],
    enablePrivateFeedback: true,
    privateFeedbackEmail: 'khushiagency@gmail.com',
    privateFeedbackPhone: '+91 98123 45678',
    pageViews: 380,
    reviewClicks: 112,
    contactClicks: 145,
    isDisabled: false,
    subscriptionStartDate: '2026-01-01',
    subscriptionExpiryDate: '2027-01-01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
