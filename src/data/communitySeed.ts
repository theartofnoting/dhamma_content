import { GoogleFormTab, GroupEvent, MeditationTip } from '../types/dhamma';

export const INITIAL_MEDITATION_TIPS: MeditationTip[] = [
  {
    id: 'tip-anchoring-breath',
    title: 'Establishing a Gentle Anchor at the Abdomen or Nostrils',
    category: 'Breath & Anchor',
    paliTerm: 'Ānāpānasati · Vāyo-dhātu',
    durationHint: '15–30 min sitting',
    authorSayadaw: 'Ven. Mahāsi Sayadaw & Ven. Pa-Auk Sayadaw',
    summary:
      'Observe the natural movement of breathing without controlling its depth or speed, letting awareness rest softly on physical sensations.',
    guidance: [
      'Sit upright with relaxed shoulders and let the eyes close gently. Do not force a deep breath or alter the natural rhythm of the body.',
      'Direct attention either to the rising and falling sensation at the abdomen (Mahāsi method) or to the tactile touch of air at the rim of the nostrils (Ānāpānasati).',
      'Whenever the mind wanders into planning or memory, note "wandering" or "thinking" gently without frustration, and return calmly to the very next breath.',
    ],
    updatedAt: '2026-11-01',
  },
  {
    id: 'tip-walking-cadence',
    title: 'Walking Meditation Cadence: Lifting, Moving, Placing',
    category: 'Posture & Walking',
    paliTerm: 'Caṅkama · Iriyāpatha',
    durationHint: '20–45 min walking',
    authorSayadaw: 'Ven. Mahāsi Sayadaw Tradition',
    summary:
      'Alternating sitting and walking meditation keeps energy balanced, prevents dullness, and trains continuity of mindfulness in motion.',
    guidance: [
      'Choose a quiet straight path of 10 to 15 paces. Stand still for a few breaths, feeling the uprightness and weight of the body.',
      'Walk at a measured, unhurried pace. Keep your gaze lowered a few feet ahead and notice the changing sensations of lightness, movement, and contact in each step.',
      'At the end of the path, pause to notice "standing," turn slowly with clear awareness of the turning motion, and resume walking smoothly.',
    ],
    updatedAt: '2026-11-04',
  },
  {
    id: 'tip-five-hindrances',
    title: 'Meeting Restlessness, Drowsiness, and Doubt Without Resistance',
    category: 'Working with Hindrances',
    paliTerm: 'Pañca Nīvaraṇa',
    durationHint: 'Any sitting session',
    authorSayadaw: 'Ven. Mogok Sayadaw (U Vimala)',
    summary:
      'Hindrances are not failures of meditation; when observed objectively as temporary mental states, they become objects of insight.',
    guidance: [
      'When sleepiness (thīna-middha) clouds awareness, straighten the spine, breathe slightly more briskly for three cycles, or switch to brisk walking meditation.',
      'When restlessness or worry (uddhacca-kukkucca) agitates the mind, stop fighting the thoughts. Recognize the agitated mind itself as an impermanent mental event arising and passing away.',
      'Remember Mogok Sayadaw’s reminder: you do not need to erase yesterday’s thoughts—simply observe the present mental state clearly so craving cannot feed it.',
    ],
    updatedAt: '2026-11-08',
  },
  {
    id: 'tip-daily-transitions',
    title: 'Carrying Clear Comprehension Into Daily Transitions',
    category: 'Daily Mindfulness',
    paliTerm: 'Sampajañña',
    durationHint: 'Throughout the day',
    authorSayadaw: 'Ven. Dr. Nandamālābhivaṃsa',
    summary:
      'Bridge formal cushion practice with ordinary responsibilities by pausing at natural thresholds throughout the day.',
    guidance: [
      'Use everyday transitions—standing up from a chair, opening a door, washing hands, or taking the first spoonful of a meal—as quiet bells for mindfulness.',
      'Notice the intention just before acting (cetanā) and the bodily sensations as the movement unfolds.',
      'End each evening with five minutes of reflecting on wholesome actions of body, speech, and mind, cultivating mettā toward all beings.',
    ],
    updatedAt: '2026-11-12',
  },
];

export const INITIAL_GROUP_EVENTS: GroupEvent[] = [
  {
    id: 'evt-satipatthana-10day',
    title: '10-Day Satipaṭṭhāna Vipassanā Course',
    eventType: 'Retreat Course',
    startDate: '2026-12-04',
    endDate: '2026-12-13',
    timeRange: '05:00 – 21:00 Daily (Noble Silence)',
    locationOrLink: 'Group Retreat Hall · Main Dhamma Sanctuary',
    teacher: 'Ven. Dr. Nandamālābhivaṃsa & Senior Assistant Sayadaw',
    status: 'Registration Open',
    description:
      'Ten-day intensive retreat following the Mahāsatipaṭṭhāna Sutta with alternating sitting and walking periods, evening Abhidhamma & Vipassanā discourses, and daily teacher interviews.',
    linkedFormTabId: 'form-course-registration',
  },
  {
    id: 'evt-weekly-sunday-sitting',
    title: 'Weekly Sunday Group Sitting & Abhidhamma Study',
    eventType: 'Group Sitting',
    startDate: '2026-11-22',
    endDate: '2026-11-22',
    timeRange: '09:00 – 11:30',
    locationOrLink: 'Dhamma Study Room & Online Stream',
    teacher: 'Group Practice Facilitators',
    status: 'Drop-In Welcome',
    description:
      'One-hour silent Vipassanā sitting followed by 30 minutes of walking meditation, chanting of the Mettā Sutta, and guided reading from Fundamental Abhidhamma.',
    linkedFormTabId: 'form-course-registration',
  },
  {
    id: 'evt-paticcasamuppada-seminar',
    title: 'Practical Paṭiccasamuppāda Seminar (Mogok Tradition)',
    eventType: 'Dhamma Talk',
    startDate: '2026-11-29',
    endDate: '2026-11-29',
    timeRange: '14:00 – 16:30',
    locationOrLink: 'Main Hall & Hybrid Q&A',
    teacher: 'Ven. Bhikkhu Uttamo',
    status: 'Registration Open',
    description:
      'Focused afternoon discourse and Q&A exploring how contemplation of consciousness (cittānupassanā) severs the link between feeling (vedanā) and craving (taṇhā).',
    linkedFormTabId: 'form-dhamma-questions',
  },
  {
    id: 'evt-full-moon-uposatha',
    title: 'Full-Moon Uposatha One-Day Mindfulness Retreat',
    eventType: 'Study Circle',
    startDate: '2026-12-20',
    endDate: '2026-12-20',
    timeRange: '08:00 – 17:00',
    locationOrLink: 'Group Dhamma Center',
    teacher: 'Senior Monastic Sangha',
    status: 'Registration Open',
    description:
      'One-day Eight Precepts observance with guided Ānāpānasati sitting, mindful vegetarian lunch, and group sutta recitation.',
    linkedFormTabId: 'form-course-registration',
  },
];

export const INITIAL_FORM_TABS: GoogleFormTab[] = [
  {
    id: 'form-course-registration',
    label: 'Course Registration',
    description:
      'Register for upcoming 10-day Vipassanā retreats, one-day Uposatha sittings, and weekly group meditation courses.',
    rawUrl: '',
    embedUrl: '',
    heightPx: 760,
    isDefault: true,
  },
  {
    id: 'form-dhamma-questions',
    label: 'Questions for Sayadaw',
    description:
      'Submit meditation practice questions or Abhidhamma / Sutta study inquiries for upcoming Sayadaw Q&A sessions.',
    rawUrl: '',
    embedUrl: '',
    heightPx: 680,
    isDefault: true,
  },
  {
    id: 'form-volunteer-dana',
    label: 'Volunteer & Dāna Support',
    description:
      'Offer Dhamma service, course meal coordination, audio transcription, or Pāli translation assistance for the group.',
    rawUrl: '',
    embedUrl: '',
    heightPx: 680,
    isDefault: true,
  },
];
