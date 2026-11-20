import {
  EventStatus,
  EventType,
  TipCategory,
  TraditionCollection,
} from '../types/dhamma';

export interface LocaleDictionary {
  meta: {
    pageTitle: string;
    pageDescription: string;
    languageLabel: string;
    languageSwitcherAria: string;
  };
  nav: {
    discourses: string;
    sayadaws: string;
    tips: string;
    events: string;
    forms: string;
    readingRoom: string;
    storeTeaching: string;
    primaryAria: string;
    mobileAria: string;
  };
  hero: {
    kicker: string;
    headline: string;
    description: string;
    imageAlt: string;
    imageCaption: string;
    browseArchive: string;
    openReadingRoom: string;
    upcomingCourses: string;
    utilityNote: string;
    kpiDiscoursesLabel: string;
    kpiDiscoursesValueSuffix: string;
    kpiSayadawsLabel: string;
    kpiSayadawsValueSuffix: string;
    kpiTipsLabel: string;
    kpiTipsValueSuffix: string;
    kpiEventsLabel: string;
    kpiEventsValueSuffix: string;
    kpiGithubAction: string;
  };
  catalog: {
    kicker: string;
    title: string;
    description: string;
    addTeaching: string;
    searchPlaceholder: string;
    allCollections: string;
    allSayadaws: string;
    allLanguages: string;
    savedOnly: string;
    groupBySayadaw: string;
    lightMode: string;
    darkMode: string;
    emptyTitle: string;
    emptyVisitorHint: string;
    emptyOwnerHint: string;
    clearFilters: string;
    leadStoryBadge: string;
    readDiscourse: string;
    save: string;
    saved: string;
    exportMd: string;
    catalogueBySayadaw: string;
    completeCatalogue: string;
    entriesUnitSingular: string;
    entriesUnitPlural: string;
    minStudySuffix: string;
    minReadSuffix: string;
    addUnderSayadaw: string;
    discourseUnitSingular: string;
    discourseUnitPlural: string;
    edit: string;
    confirmDelete: string;
  };
  sayadaws: {
    kicker: string;
    title: string;
    description: string;
    addSayadaw: string;
    emptyText: string;
    viewDiscoursesPrefix: string;
    viewDiscoursesSuffix: string;
    edit: string;
    deleteWithTalksSuffix: string;
    modalKicker: string;
    createTitle: string;
    editTitle: string;
    fieldName: string;
    fieldSlug: string;
    fieldHonorific: string;
    fieldVietnameseName: string;
    fieldMonastery: string;
    fieldLocation: string;
    fieldLineage: string;
    fieldYears: string;
    fieldPortrait: string;
    fieldBiography: string;
    fieldPrimaryTexts: string;
    uploadBtn: string;
    saveBtn: string;
    updateBtn: string;
    cancelBtn: string;
    nameRequiredError: string;
  };
  tips: {
    kicker: string;
    title: string;
    description: string;
    addTip: string;
    allCategories: string;
    emptyText: string;
    modalKicker: string;
    createTitle: string;
    editTitle: string;
  };
  events: {
    kicker: string;
    title: string;
    description: string;
    addEvent: string;
    calendarView: string;
    listView: string;
    allTypes: string;
    emptyText: string;
    downloadIcs: string;
    registerBtn: string;
    monthNames: readonly string[];
    weekdays: readonly string[];
  };
  forms: {
    kicker: string;
    title: string;
    description: string;
    addTab: string;
    configureUrl: string;
    openInNewTab: string;
    emptyTabs: string;
    noUrlPlaceholder: string;
  };
  readingRoom: {
    backToIndex: string;
    textSizeLabel: string;
    lightMode: string;
    darkMode: string;
    exportMd: string;
    save: string;
    saved: string;
    edit: string;
    marginGlossaryTitle: string;
    footnotesTitle: string;
    permalinkTitle: string;
    copyUrl: string;
    copiedUrl: string;
    sayadawIndexTitle: string;
    viewAllBySayadaw: string;
    continueStudy: string;
    paliLabel: string;
    recordingsTitle: string;
  };
  footer: {
    subtitle: string;
    licenseFooter: string;
    githubPages: string;
    ownerLogin: string;
    restoreDefaults: string;
    confirmReset: string;
    cancel: string;
  };
  notFound: {
    kicker: string;
    headline: string;
    returnHome: string;
  };
  taxonomyLabels: {
    collections: Record<TraditionCollection, string>;
    tipCategories: Record<TipCategory, string>;
    eventTypes: Record<EventType, string>;
    eventStatuses: Record<EventStatus, string>;
  };
}
