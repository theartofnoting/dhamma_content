import { DhammaDiscourse, SayadawProfile } from '../types/dhamma';

const BASE = import.meta.env.BASE_URL;

export const HERO_LIBRARY_IMAGE = `${BASE}src/assets/images/hero_monastery_library_1795114132971.jpg`;
export const MANUSCRIPT_IMAGE = `${BASE}src/assets/images/sayadaw_abhidhamma_manuscript_1795114132795.jpg`;
export const VIPASSANA_HALL_IMAGE = `${BASE}src/assets/images/sayadaw_vipassana_hall_1795114134497.jpg`;
export const NIKAYA_SCROLLS_IMAGE = `${BASE}src/assets/images/sayadaw_nikaya_scrolls_1795114133168.jpg`;

export const SAYADAW_PROFILES: SayadawProfile[] = [
  {
    id: 'nandamalabhivamsa',
    name: 'Ven. Dr. Nandamālābhivaṃsa',
    honorificTitle: 'Aggamahāpaṇḍita · Abhidhajamahāraṭṭhaguru',
    chineseName: '南達瑪拉長老（薩亞多）',
    monastery: 'Mahā Subodhayon Monastery',
    location: 'Sagaing Hills, Myanmar',
    lineage: 'Theravāda Tipiṭaka & Abhidhamma Scholarship',
    years: 'b. 1940',
    biography:
      'Former Rector of the International Theravada Buddhist Missionary University (ITBMU) and Sitagu International Buddhist Academy. Renowned worldwide for systematic expositions of the Abhidhamma Piṭaka, Paṭṭhāna conditional relations, and the integration of scriptural pariyatti with meditative paṭipatti.',
    primaryTexts: [
      'Fundamental Abhidhamma (I–III)',
      'The Bodhipakkhiya Dīpanī Expositions',
      'Kamma & Conditional Relations (Paṭṭhāna)',
    ],
    imageUrl: MANUSCRIPT_IMAGE,
  },
  {
    id: 'mogok-sayadaw',
    name: 'Ven. Mogok Sayadaw (U Vimala)',
    honorificTitle: 'Aggamahāpaṇḍita',
    chineseName: '莫哥薩亞多（Mogok Sayadaw）',
    monastery: 'Mingala Taik Monastery',
    location: 'Mogok & Mandalay, Myanmar',
    lineage: 'Paṭiccasamuppāda & Cittānupassanā Vipassanā',
    years: '1899–1962',
    biography:
      'Master exponent of Dependent Origination (Paṭiccasamuppāda) applied directly to contemplative insight. His recorded discourses—extensively preserved and translated within the twnanda / online-dhamma.net archive—emphasize discerning the arising and passing away of consciousness (citta) to sever the link between feeling (vedanā) and craving (taṇhā).',
    primaryTexts: [
      'Practical Dependent Origination Wheel',
      'Cittānupassanā — Contemplation of Mind',
      'Cutting the Cycle Between Vedanā and Taṇhā',
    ],
    imageUrl: VIPASSANA_HALL_IMAGE,
  },
  {
    id: 'mahasi-sayadaw',
    name: 'Ven. Mahāsi Sayadaw (U Sobhana)',
    honorificTitle: 'Aggamahāpaṇḍita · Chaṭṭha Saṅgāyana Pucchaka',
    chineseName: '馬哈希薩亞多',
    monastery: 'Mahāsi Sāsana Yeiktha',
    location: 'Yangon, Myanmar',
    lineage: 'Satipaṭṭhāna Vipassanā Tradition',
    years: '1904–1982',
    biography:
      'Questioner (Pucchaka) at the Sixth Buddhist Council and author of the foundational Manual of Insight (Vipassanā Shuphwè Kyan). Taught direct observation of rising-and-falling bodily phenomena and mental noting grounded strictly in the Mahāsatipaṭṭhāna Sutta and Visuddhimagga.',
    primaryTexts: [
      'Manual of Insight (Vipassanā Ñāṇa)',
      'Discourse on the Mālukyaputta Sutta',
      'Practical Insight Meditation',
    ],
    imageUrl: NIKAYA_SCROLLS_IMAGE,
  },
  {
    id: 'pa-auk-sayadaw',
    name: 'Ven. Pa-Auk Sayadaw (U Āciṇṇa)',
    honorificTitle: 'Aggamahāpaṇḍita · Abhidhajamahāraṭṭhaguru',
    chineseName: '帕奧薩亞多',
    monastery: 'Pa-Auk Tawya Forest Monastery',
    location: 'Mawlamyine, Mon State, Myanmar',
    lineage: 'Visuddhimagga Samatha-Vipassanā Tradition',
    years: 'b. 1934',
    biography:
      'Abbot and meditation teacher guiding systematic cultivation of Ānāpānasati, the four jhānas, analysis of the four elements (dhātuvavatthāna), discernment of ultimate materiality and mentality (rūpa-nāma), and dependent origination across the three periods of time.',
    primaryTexts: [
      'Knowing and Seeing',
      'The Workings of Kamma',
      'Mindfulness of Breathing & Four Elements',
    ],
  },
  {
    id: 'bhikkhu-uttamo',
    name: 'Ven. Bhikkhu Uttamo (Sayadaw U Uttama)',
    honorificTitle: 'Theravāda Dhammakathika',
    chineseName: '鄔達摩長老',
    monastery: 'Dhammavihāra & Translation Circle',
    location: 'Myanmar & Taiwan Dhamma Network',
    lineage: 'Bilingual Burmese–Chinese–English Dhamma Preservation',
    years: 'Contemporary',
    biography:
      'Known in the Chinese-speaking Theravāda community for clear translations and commentaries on Mogok Sayadaw, the Dhammapada stories, and Sutta Piṭaka teachings archived across the Dhamma Page of Tainan (府城佛教網).',
    primaryTexts: [
      'Selected Translations of Mogok Sayadaw',
      'Dhammapada Verse & Commentary Notes',
      'Nāma-Rūpa Analytical Summaries',
    ],
  },
];

export const INITIAL_DISCOURSES: DhammaDiscourse[] = [
  {
    id: 'abhidhamma-four-ultimates',
    accessionCode: 'ACC. ABH.01',
    title: 'The Architecture of Ultimate Reality: Citta, Cetasika, Rūpa, and Nibbāna',
    chineseTitle: '究竟法之結構：心、心所、色與涅槃',
    paliSubtitle: 'Paramattha Dhamma Vibhāga · Abhidhammattha-saṅgaha I',
    sayadawId: 'nandamalabhivamsa',
    sayadawName: 'Ven. Dr. Nandamālābhivaṃsa',
    collection: 'Abhidhamma',
    language: 'Pāli · 繁體中文 · English',
    dateRecorded: '2011 · Sagaing Lectures',
    readingMinutes: 14,
    sourceText: 'Abhidhammattha-saṅgaha, Pariccheda I · Dhammasaṅgaṇī',
    summary:
      'An introductory yet rigorous exposition by Sayadaw Dr. Nandamālābhivaṃsa distinguishing conventional concepts (paññatti) from ultimate realities (paramattha dhamma), establishing why Abhidhamma maps experience before insight meditation begins.',
    pullQuote:
      'When we know mind and matter not as a solid self, but as conditioned processes arising with distinct characteristics, insight ceases to be mere theory and becomes direct observation.',
    coverImage: MANUSCRIPT_IMAGE,
    featuredRank: 'lead',
    repoPath: 'docs/sayadaw/nandamalabhivamsa/paramattha-dhamma-architecture.md',
    audioReferenceUrl: 'https://nanda.online-dhamma.net/',
    sections: [
      {
        heading: '1. Conventional Reality (Sammuti-sacca) and Ultimate Reality (Paramattha-sacca)',
        paliExcerpt:
          'Tattha vutt’ābhidhammatthā catudhā paramatthato: cittaṃ cetasikaṃ rūpaṃ nibbānam iti sabbathā.',
        paliTranslation:
          'Therein, the realities taught in the Abhidhamma are fourfold in the ultimate sense: consciousness, mental factors, materiality, and Nibbāna.',
        paragraphs: [
          'In everyday speech, we speak of persons, houses, mountains, and nations. The Buddha never rejected this conventional language (vohāra-vacana), for without it human communication collapses. Yet when the mind seeks liberation from dukkha, conventional designations obscure the fleeting processes underneath.',
          'Abhidhamma trains the student to look beneath the label "person" and ask: what is actually occurring in this very moment of seeing, hearing, or thinking? What occurs is not an enduring entity, but a rapid stream of conditioned phenomena (saṅkhata-dhamma) alongside the one unconditioned element, Nibbāna.',
          'Sayadaw emphasizes that paramattha does not mean a distant metaphysical realm. It means that which possesses its own intrinsic nature (sabhāva-lakkhaṇa) and cannot be further reduced into smaller conceptual pieces. Heat is felt directly; hardness is contacted directly; knowing an object is experienced directly.',
        ],
      },
      {
        heading: '2. Consciousness (Citta) and Its Companion Mental Factors (Cetasika)',
        paragraphs: [
          'Consciousness (citta) has a single essential function: knowing or cognizing an object (ārammaṇa-vijānana-lakkhaṇa). Never does citta arise alone in bare isolation. Just as a king travels with ministers and attendants, every single moment of consciousness arises together with mental factors (cetasikas) that color and shape the act of knowing.',
          'Among the fifty-two mental factors enumerated in the Abhidhamma, seven universals—contact (phassa), feeling (vedanā), perception (saññā), volition (cetanā), one-pointedness (ekaggatā), life faculty (jīvitindriya), and attention (manasikāra)—accompany every state of consciousness without exception. Beyond these, wholesome factors such as non-greed, non-hatred, mindfulness, and wisdom transform the ethical quality of the mind.',
          'Understanding this partnership relieves a practitioner of fatalism. Because cetasikas are conditioned by wise attention (yoniso manasikāra) and wholesome companionship, the quality of consciousness can be deliberately cultivated moment by moment.',
        ],
      },
      {
        heading: '3. Materiality (Rūpa) and the Unconditioned Element (Nibbāna)',
        paragraphs: [
          'Materiality (rūpa) is defined by its capacity to undergo change and opposition under heat, cold, and external conditions (ruppana-lakkhaṇa). Twenty-eight material phenomena comprise four great primary elements—earth (extension), water (cohesion), fire (temperature), and air (motion)—together with twenty-four derived phenomena such as the five sense organs and nutritive essence.',
          'Standing apart from the three conditioned realities—citta, cetasika, and rūpa—is Nibbāna, the fourth paramattha. It is unconditioned (asaṅkhata), unarisen, and free from aging and dissolution. While the mind conditioned by craving experiences endless becoming, the mind purified through the Noble Eightfold Path takes Nibbāna itself as its object at the moment of supramundane path consciousness (magga-citta).',
        ],
      },
    ],
    marginNotes: [
      {
        id: 'mn-1',
        anchorLabel: 'Note 1.1 · Paramattha',
        termPali: 'Paramattha-dhamma',
        noteText:
          'Derived from parama (highest/ultimate) + attha (truth/reality). In Chinese translations on nanda.online-dhamma.net, rendered as 究竟法 (jiūjìng fǎ) or 第一義諦.',
        sourceCitation: 'Abhidhammattha-saṅgaha I.2',
      },
      {
        id: 'mn-2',
        anchorLabel: 'Note 1.2 · Ekuppāda',
        termPali: 'Ekuppāda-ekanirodha',
        noteText:
          'Cetasikas share four traits with their associated citta: arising together, ceasing together, taking the same object, and sharing the same physical base.',
        sourceCitation: 'Abhidhammattha-saṅgaha II.1',
      },
      {
        id: 'mn-3',
        anchorLabel: 'Note 1.3 · Archival Ref',
        termPali: 'Tainan Study Series',
        noteText:
          'Cross-referenced with Bhikkhu Bodhi’s Comprehensive Manual of Abhidhamma and the Chinese-Pāli study outlines archived in twnanda/twnanda.',
        sourceCitation: 'twnanda/twnanda · Abhidhamma Index',
      },
    ],
    footnotes: [
      {
        index: 1,
        text: 'Recorded during the Sagaing Abhidhamma seminar series and collated for open study on nanda.online-dhamma.net under Creative Commons Dhamma-dāna.',
      },
      {
        index: 2,
        text: 'Pāli quotations follow the Chaṭṭha Saṅgāyana (Sixth Buddhist Council) Burmese Tipiṭaka edition.',
      },
    ],
  },
  {
    id: 'mogok-cutting-paticcasamuppada',
    accessionCode: 'ACC. VIP.02',
    title: 'Severing the Wheel Between Vedanā and Taṇhā in Daily Practice',
    chineseTitle: '在日常觀照中截斷受與愛之間的緣起輪',
    paliSubtitle: 'Paṭiccasamuppāda · Cittānupassanā',
    sayadawId: 'mogok-sayadaw',
    sayadawName: 'Ven. Mogok Sayadaw (U Vimala)',
    collection: 'Satipatthana & Vipassana',
    language: 'Pāli · 繁體中文 · English',
    dateRecorded: '1960 · Mandalay Desanā',
    readingMinutes: 16,
    sourceText: 'Mahānidāna Sutta (DN 15) · Chachakka Sutta (MN 148)',
    summary:
      'Mogok Sayadaw’s signature exposition on why liberation hinges on the precise junction between feeling (vedanā) and craving (taṇhā), using contemplation of consciousness (cittānupassanā) to see impermanence before attachment ignites.',
    pullQuote:
      'You cannot erase yesterday’s ignorance, nor can you block contact at the eye and ear. Yet right at the threshold of feeling, wisdom can stand guard so craving never takes birth.',
    coverImage: VIPASSANA_HALL_IMAGE,
    featuredRank: 'secondary',
    repoPath: 'docs/sayadaw/mogok/vedana-tanha-paticcasamuppada.md',
    sections: [
      {
        heading: '1. Why the Wheel Turns Without Pause',
        paliExcerpt:
          'Phassapaccayā vedanā, vedanāpaccayā taṇhā, taṇhāpaccayā upādānaṃ.',
        paliTranslation:
          'With contact as condition, feeling arises; with feeling as condition, craving arises; with craving as condition, clinging arises.',
        paragraphs: [
          'Throughout beginningless saṃsāra, beings suffer not because the world attacks them from outside, but because an unbroken chain of conditions operates unseen inside each sense door. When eye meets visible form, eye-consciousness arises. The meeting of those three is contact (phassa), and immediately feeling (vedanā) is born—pleasant, unpleasant, or neutral.',
          'For the uninstructed mind, pleasant feeling immediately invites delight and craving (taṇhā); unpleasant feeling provokes aversion and resistance; neutral feeling drifts into dull forgetfulness. From that single spark of taṇhā, clinging (upādāna) solidifies, kammic becoming (bhava) is forged, and future birth and sorrow follow inevitably.',
        ],
      },
      {
        heading: '2. Watching Mind with Mind (Cittānupassanā)',
        paragraphs: [
          'Mogok Sayadaw often pointed to a chart of the twelve links and drew a decisive line between vedanā and taṇhā. We cannot stop sights, sounds, or bodily sensations from producing feeling; even an Arahant experiences pleasant and painful contact while the body endures.',
          'What can be transformed is what follows feeling. When a thought of anger, worry, or greed arises after feeling, do not call it "my anger" or "my worry." Turn awareness back immediately to observe the mental state as an observed object—noting its arising and its vanishing. The mind that knows the previous mind cannot simultaneously indulge it. In that lucid moment of observing impermanence (anicca), the link to taṇhā is broken.',
        ],
      },
    ],
    marginNotes: [
      {
        id: 'mn-mogok-1',
        anchorLabel: 'Note 2.1 · Cittānupassanā',
        termPali: 'Cittānupassanā-satipaṭṭhāna',
        noteText:
          'One of the four foundations of mindfulness (DN 22). Mogok Sayadaw classifies thirteen observable types of consciousness for practical vipassanā.',
        sourceCitation: 'DN 22 · Mahāsatipaṭṭhāna Sutta',
      },
      {
        id: 'mn-mogok-2',
        anchorLabel: 'Note 2.2 · Chinese Archive',
        termPali: '受緣愛 · 觀心無常',
        noteText:
          'Preserved in the Traditional Chinese Mogok Sayadaw anthology translated by Ven. Bhikkhu Uttamo (鄔達摩長老) on nanda.online-dhamma.net.',
        sourceCitation: 'twnanda/twnanda · Mogok Talks',
      },
    ],
    footnotes: [
      {
        index: 1,
        text: 'Translated and compiled from Mandalay tape transcriptions archived in the Tainan Dhamma Page digital collection.',
      },
    ],
  },
  {
    id: 'mahasi-satipatthana-direct-path',
    accessionCode: 'ACC. SUT.03',
    title: 'The Direct Path of Bare Awareness: Notes on the Mahāsatipaṭṭhāna Sutta',
    chineseTitle: '大念處經之直入正道：如實觀照與標記法',
    paliSubtitle: 'Ekāyano ayaṃ bhikkhave maggo',
    sayadawId: 'mahasi-sayadaw',
    sayadawName: 'Ven. Mahāsi Sayadaw (U Sobhana)',
    collection: 'Sutta Pitaka',
    language: 'Pāli · English',
    dateRecorded: '1954 · Rangoon Retreat Instructions',
    readingMinutes: 12,
    sourceText: 'Mahāsatipaṭṭhāna Sutta (DN 22) · Satipaṭṭhāna Sutta (MN 10)',
    summary:
      'Clarifying the Buddha’s declaration of the "one-way direct path" (ekāyana magga) for the purification of beings, with practical guidance on observing the four elements in bodily movement without conceptual fabrication.',
    pullQuote:
      'Mindfulness does not invent reality; it strips away the habit of remembering the past and imagining the future so that present phenomena reveal their true marks.',
    coverImage: NIKAYA_SCROLLS_IMAGE,
    featuredRank: 'secondary',
    repoPath: 'docs/sayadaw/mahasi/satipatthana-direct-path.md',
    sections: [
      {
        heading: '1. The Meaning of Ekāyana Magga',
        paliExcerpt:
          'Ekāyano ayaṃ, bhikkhave, maggo sattānaṃ visuddhiyā, sokaparidevānaṃ samatikkamāya...',
        paliTranslation:
          'Bhikkhus, this is the direct path for the purification of beings, for the surmounting of sorrow and lamentation...',
        paragraphs: [
          'At the opening of the Mahāsatipaṭṭhāna Sutta, the Buddha declares five fruits of practicing the four foundations of mindfulness: purification of mind, overcoming sorrow and lamentation, disappearing of pain and grief, attainment of the noble method, and realization of Nibbāna.',
          'Commentarial tradition explains ekāyana in four ways: a single path (not a forked road), traveled alone in inner stillness, taught by the One Peerless Teacher, leading solely to one destination—Nibbāna.',
        ],
      },
      {
        heading: '2. Observing Rising and Falling as Air Element (Vāyo-dhātu)',
        paragraphs: [
          'When a meditator attends closely to the expansion and contraction of the abdomen—or the touching of the feet while walking—one is not meditating on a body-concept ("my stomach" or "my foot"). Rather, as concentration deepens, the mind directly encounters stiffness, pressure, motion, and warmth.',
          'Mental noting ("rising", "falling", "lifting", "stepping") acts only as a gentle steering oar to anchor mindfulness directly upon the current phenomenon. Once the mind stays steadfastly on the sensation itself, verbal noting falls quiet and pure insight knowledge (vipassanā-ñāṇa) matures naturally.',
        ],
      },
    ],
    marginNotes: [
      {
        id: 'mn-mahasi-1',
        anchorLabel: 'Note 3.1 · Vāyo-dhātu',
        termPali: 'Vāyo-dhātu (Air Element)',
        noteText:
          'Defined in the Abhidhamma as distension, support, and motion (vitthambhana-lakkhaṇa). Directly experienced during breathing and walking.',
        sourceCitation: 'Visuddhimagga XI.37',
      },
    ],
    footnotes: [
      {
        index: 1,
        text: 'Cross-indexed with the Chaṭṭha Saṅgāyana Pāli text of Dīgha Nikāya 22 maintained in the Tipiṭaka index.',
      },
    ],
  },
  {
    id: 'pa-auk-samatha-vipassana',
    accessionCode: 'ACC. VIS.04',
    title: 'From Ānāpānasati to Four-Element Discernment in the Visuddhimagga',
    chineseTitle: '從入出息念至界分別觀：《清淨道論》止觀次第',
    paliSubtitle: 'Samatha-yānika · Dhātuvavatthāna',
    sayadawId: 'pa-auk-sayadaw',
    sayadawName: 'Ven. Pa-Auk Sayadaw (U Āciṇṇa)',
    collection: 'Visuddhimagga',
    language: 'Pāli · 繁體中文 · English',
    dateRecorded: '2006 · Mawlamyine Retreat',
    readingMinutes: 19,
    sourceText: 'Visuddhimagga VIII & XI · Ānāpānasati Sutta (MN 118)',
    summary:
      'A systematic walkthrough of Buddhaghosa’s Path of Purification (Visuddhimagga) showing how strong concentration (samādhi) serves as the luminous microscope for discerning ultimate kalāpas and mental states.',
    pullQuote:
      'Concentration is not the goal; it is the steady light by which the meditator sees through the illusion of compactness.',
    repoPath: 'docs/sayadaw/pa-auk/anapanasati-visuddhimagga.md',
    sections: [
      {
        heading: '1. Establishing Bright Concentration at the Nostril Aperture',
        paragraphs: [
          'In the Visuddhimagga method taught at Pa-Auk Tawya, the meditator sits upright and directs effortless attention to the breath as it touches the rim of the nostrils or the upper lip. Without counting indefinitely or forcing the rhythm of inhalation, one remains purely with the tactile sensation of the breath.',
          'As hindrance thoughts subside, the breath grows subtle and a mental counterpart sign (paṭibhāga-nimitta) gradually clarifies. Sustaining this sign steadily for hours leads to access concentration and ultimately absorption (jhāna), fulfilling the Buddha’s teaching that a concentrated mind knows and sees things as they really are (yathābhūta-ñāṇadassana).',
        ],
      },
      {
        heading: '2. Breaking Down the Illusion of Compactness (Ghana-vinibbhoga)',
        paragraphs: [
          'Emerging from jhāna, the yogi directs that sharp, pliable mind to examine the four great elements throughout the body—hardness, roughness, heaviness (earth); flowing, cohesion (water); heat, cold (fire); pushing, supporting (air).',
          'When all twelve characteristics of the four elements are clearly discerned together, the apparent solidity of the physical body dissolves into tiny, rapidly changing sub-atomic material clusters (rūpa-kalāpas). In this way, the Visuddhimagga bridges tranquil absorption directly into liberating insight.',
        ],
      },
    ],
    marginNotes: [
      {
        id: 'mn-paauk-1',
        anchorLabel: 'Note 4.1 · Ghana',
        termPali: 'Ghana-vinibbhoga',
        noteText:
          'Resolution of compactness: seeing through temporal continuity (santati-ghana), grouping (samūha-ghana), and function (kicca-ghana).',
        sourceCitation: 'Visuddhimagga XVIII–XX',
      },
    ],
    footnotes: [
      {
        index: 1,
        text: 'Prepared alongside the Traditional Chinese Visuddhimagga study materials on nanda.online-dhamma.net.',
      },
    ],
  },
  {
    id: 'uttamo-dhammapada-mind',
    accessionCode: 'ACC. MNK.05',
    title: 'Mind Precedes All Dhammas: Dhammapada Verses 1–2 Commentary',
    chineseTitle: '諸法意先導：《法句經》雙品前二偈要義',
    paliSubtitle: 'Manopubbaṅgamā dhammā, manoseṭṭhā manomayā',
    sayadawId: 'bhikkhu-uttamo',
    sayadawName: 'Ven. Bhikkhu Uttamo (Sayadaw U Uttama)',
    collection: 'Monastic Talks',
    language: 'Pāli · 繁體中文 · English',
    dateRecorded: '2015 · Tainan Dhamma Study Notes',
    readingMinutes: 10,
    sourceText: 'Dhammapada 1–2 (Yamakavagga) · Dhammapada-aṭṭhakathā',
    summary:
      'An exposition preserved in the Dhamma Page of Tainan examining the opening twin verses of the Dhammapada—showing how unwholesome and wholesome mental states shape destiny as faithfully as a wheel follows the ox or a shadow follows the body.',
    pullQuote:
      'The wheel follows the hoof; the shadow never leaves the form. Every quiet intention of today writes the world we inhabit tomorrow.',
    repoPath: 'docs/sayadaw/uttamo/dhammapada-twin-verses.md',
    sections: [
      {
        heading: '1. Why Cetanā (Volition) Is the Chief Architect',
        paliExcerpt:
          'Manopubbaṅgamā dhammā, manoseṭṭhā manomayā; manasā ce paduṭṭhena bhāsati vā karoti vā...',
        paliTranslation:
          'Mind is the forerunner of all mental states; mind is their chief; they are mind-made. If with a corrupted mind one speaks or acts, suffering follows one as the wheel follows the hoof of the draft-ox.',
        paragraphs: [
          'Across the Pāli Canon, no single verse is quoted more warmly to new students and seasoned monastics alike than the opening pair of the Dhammapada. Yet Ven. Bhikkhu Uttamo notes that "mano" here does not refer to an abstract philosophical soul. In the commentary (Dhammapada-aṭṭhakathā), "dhammā" specifically indicates the mental factors and three aggregates—feeling, perception, and volitional formations—while "mano" points to consciousness paired with moral or unwholesome volition (cetanā).',
          'Because cetanā coordinates every bodily deed and spoken word, purifying intention at its inception is vastly wiser than attempting to repair harsh consequences after speech and action have already rippled outward.',
        ],
      },
    ],
    marginNotes: [
      {
        id: 'mn-uttamo-1',
        anchorLabel: 'Note 5.1 · Yamakavagga',
        termPali: 'Yamaka (Twin Verses)',
        noteText:
          'Verses 1 and 2 contrast corrupted mind (paduṭṭha-mano) leading to dukkha with serene, pure mind (pasanna-mano) leading to happiness.',
        sourceCitation: 'Dhp 1–2 · Khuddaka Nikāya',
      },
    ],
    footnotes: [
      {
        index: 1,
        text: 'Archived in honor of the Dhammapada & Commentary bilingual section of nanda.online-dhamma.net (府城佛教網).',
      },
    ],
  },
  {
    id: 'nandamala-patthana-conditions',
    accessionCode: 'ACC. ABH.06',
    title: 'The Twenty-Four Conditional Relations (Paṭṭhāna) in Everyday Life',
    chineseTitle: '二十四緣（發趣論）在日常修行中的觀察',
    paliSubtitle: 'Hetupaccayo · Ārammaṇapaccayo · Adhipatipaccayo',
    sayadawId: 'nandamalabhivamsa',
    sayadawName: 'Ven. Dr. Nandamālābhivaṃsa',
    collection: 'Abhidhamma',
    language: 'Pāli · English',
    dateRecorded: '2014 · Yangon & Sagaing',
    readingMinutes: 15,
    sourceText: 'Paṭṭhāna-pakaraṇa (Mahāpakaraṇa) · Abhidhammattha-saṅgaha VIII',
    summary:
      'Sayadaw Dr. Nandamālābhivaṃsa demystifies the great seventh book of the Abhidhamma—showing how root condition, object condition, and predominance condition govern every habit, memory, and spiritual aspiration.',
    pullQuote:
      'Nothing arises by accident, and nothing arises from a single cause. Wisdom learns to nurture wholesome conditions rather than fighting isolated symptoms.',
    repoPath: 'docs/sayadaw/nandamalabhivamsa/patthana-daily-conditions.md',
    sections: [
      {
        heading: '1. From Mere List to Living Network',
        paliExcerpt:
          'Hetupaccayo, ārammaṇapaccayo, adhipatipaccayo, anantarapaccayo...',
        paliTranslation:
          'Root condition, object condition, predominance condition, proximity condition...',
        paragraphs: [
          'The Paṭṭhāna—the seventh and largest book of the Abhidhamma Piṭaka—is often revered from afar as impenetrable mathematics. Yet Sayadaw Dr. Nandamālābhivaṃsa reminds students that the Buddha contemplated Paṭṭhāna during the fourth week after Enlightenment precisely because it reveals the living web connecting every mental and physical event.',
          'Consider reading a single Dhamma verse: the printed letters act as object condition (ārammaṇa-paccaya) for eye-consciousness; your prior aspiration acts as decisive-support condition (upanissaya-paccaya); non-delusion and faith act as root conditions (hetu-paccaya). When we understand conditions, we cease blaming fate and quietly arrange better causes.',
        ],
      },
    ],
    marginNotes: [
      {
        id: 'mn-patthana-1',
        anchorLabel: 'Note 6.1 · Upanissaya',
        termPali: 'Upanissaya-paccaya',
        noteText:
          'Decisive-support condition: how repeated habits, teachers, climate, and past wholesome deeds powerfully incline the mind toward future insight.',
        sourceCitation: 'Paṭṭhāna · Paccaya-niddesa',
      },
    ],
    footnotes: [
      {
        index: 1,
        text: 'Compiled for the Abhidhamma study curriculum hosted at nanda.online-dhamma.net.',
      },
    ],
  },
];
