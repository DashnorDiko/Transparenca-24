/** i18n for Albanian (default) and English – consistent across the app */

export type Locale = "sq" | "en";

export type TranslationKeys = {
  signIn: string;
  searchPlaceholder: string;
  heroTitle: string;
  heroSubtitle: string;
  openDashboard: string;
  viewTransactions: string;
  totalBudget: string;
  activeContracts: string;
  flaggedAnomalies: string;
  reportAnomaly: string;
  selectMunicipality: string;
  recentTransactions: string;
  recentTransactionsSubtitle: string;
  reportCta: string;
  reportCtaQuestion: string;
  dashboard: string;
  dashboardSubtitle: string;
  filters: string;
  municipality: string;
  category: string;
  year: string;
  all: string;
  spendingByCategory: string;
  spendingByCategorySubtitle: string;
  transactionTable: string;
  transactionTableSubtitle: string;
  close: string;
  mapHint: string;
  selected: string;
  totalBudgetSubtitle: string;
  activeContractsSubtitle: string;
  flaggedSubtitle: string;
  institution: string;
  amount: string;
  date: string;
  status: string;
  actions: string;
  reportDialogTitle: string;
  reportDialogDescription: string;
  reportStep1: string;
  reportStep2: string;
  reportStep3: string;
  reportPlaceholder: string;
  reportEvidence: string;
  reportEvidenceHint: string;
  reportContact: string;
  reportContactOptional: string;
  reportBack: string;
  reportNext: string;
  reportSubmit: string;
  reportCancel: string;
  reportSuccess: string;
  statusApproved: string;
  statusPending: string;
  statusRejected: string;
  statusCancelled: string;
};

export const t: Record<Locale, TranslationKeys> = {
  sq: {
    signIn: "Identifikohu",
    searchPlaceholder: "Kërko transaksione, bashki...",
    heroTitle: "Ndjekim Paranë Publike",
    heroSubtitle:
      "Shikoni buxhetet e 61 bashkive, transaksionet në kohë reale dhe kontratat publike. Transparencë për çdo qytetar.",
    openDashboard: "Hap Dashboard",
    viewTransactions: "Shiko transaksionet",
    totalBudget: "Buxheti Total",
    activeContracts: "Kontrata Aktive",
    flaggedAnomalies: "Anomalitë të Flaguara",
    reportAnomaly: "Raporto Anomali",
    selectMunicipality: "Zgjedh bashkinë",
    recentTransactions: "Transaksione të fundit",
    recentTransactionsSubtitle: "Rrjedha e drejtpërdrejtë e shpenzimeve publike",
    reportCta: "Raportoni një anomali",
    reportCtaQuestion: "Keni vënë re një transaksion të dyshimtë?",
    dashboard: "Dashboard",
    dashboardSubtitle: "Filtroni dhe analizoni transaksionet e buxhetit publik",
    filters: "Filtra",
    municipality: "Bashkia",
    category: "Kategoria",
    year: "Viti",
    all: "Të gjitha",
    spendingByCategory: "Shpenzimet sipas kategorisë",
    spendingByCategorySubtitle: "Totali i transaksioneve të filtruara në Lek",
    transactionTable: "Tabela e transaksioneve",
    transactionTableSubtitle: 'Transaksione. Klikoni "Raporto Anomali" për të dërguar një raport.',
    close: "Mbyll",
    mapHint: "Klikoni një rajon për të filtruar bashkinë",
    selected: "E zgjedhur",
    totalBudgetSubtitle: "61 bashki",
    activeContractsSubtitle: "Kontrata të fundit të nënshkruara",
    flaggedSubtitle: "Në rishikim nga auditimi",
    institution: "Institucioni",
    amount: "Shuma",
    date: "Data",
    status: "Statusi",
    actions: "Veprime",
    reportDialogTitle: "Raporto Anomali",
    reportDialogDescription: "Transaksioni",
    reportStep1: "Përshkrimi i anomalisë",
    reportStep2: "Dëshmi (opsionale)",
    reportStep3: "Informacioni i kontaktit",
    reportPlaceholder: "Përshkruani çfarë keni vënë re...",
    reportEvidence: "Dëshmi",
    reportEvidenceHint: "Ngjitni skedarë (PDF, imazhe) ose shkruani një link",
    reportContact: "Informacioni i kontaktit",
    reportContactOptional: "Mund të na kontaktoni anonimisht; emaili është opsional.",
    reportBack: "Prapa",
    reportNext: "Vazhdo",
    reportSubmit: "Dërgo raportin",
    reportCancel: "Anulo",
    reportSuccess: "Faleminderit! Raporti u dërgua. Do të kontaktoheni nga ekipi ynë.",
    statusApproved: "Aprovuar",
    statusPending: "Në pritje",
    statusRejected: "Refuzuar",
    statusCancelled: "Anuluar",
  },
  en: {
    signIn: "Sign in",
    searchPlaceholder: "Search transactions, municipality...",
    heroTitle: "Public Money Tracking",
    heroSubtitle:
      "View budgets of 61 municipalities, real-time transactions and public contracts. Transparency for every citizen.",
    openDashboard: "Open Dashboard",
    viewTransactions: "View transactions",
    totalBudget: "Total Budget",
    activeContracts: "Active Contracts",
    flaggedAnomalies: "Flagged Anomalies",
    reportAnomaly: "Report Anomaly",
    selectMunicipality: "Select municipality",
    recentTransactions: "Recent transactions",
    recentTransactionsSubtitle: "Live feed of public spending",
    reportCta: "Report an anomaly",
    reportCtaQuestion: "Noticed a suspicious transaction?",
    dashboard: "Dashboard",
    dashboardSubtitle: "Filter and analyse public budget transactions",
    filters: "Filters",
    municipality: "Municipality",
    category: "Category",
    year: "Year",
    all: "All",
    spendingByCategory: "Spending by category",
    spendingByCategorySubtitle: "Total filtered transactions in Lek",
    transactionTable: "Transaction table",
    transactionTableSubtitle: 'Click "Report Anomaly" to submit a report.',
    close: "Close",
    mapHint: "Click a region to filter by municipality",
    selected: "Selected",
    totalBudgetSubtitle: "61 municipalities",
    activeContractsSubtitle: "Recently signed contracts",
    flaggedSubtitle: "Under audit review",
    institution: "Institution",
    amount: "Amount",
    date: "Date",
    status: "Status",
    actions: "Actions",
    reportDialogTitle: "Report Anomaly",
    reportDialogDescription: "Transaction",
    reportStep1: "Description of the anomaly",
    reportStep2: "Evidence (optional)",
    reportStep3: "Contact information",
    reportPlaceholder: "Describe what you noticed...",
    reportEvidence: "Evidence",
    reportEvidenceHint: "Attach files (PDF, images) or paste a link",
    reportContact: "Contact information",
    reportContactOptional: "You can report anonymously; email is optional.",
    reportBack: "Back",
    reportNext: "Next",
    reportSubmit: "Submit report",
    reportCancel: "Cancel",
    reportSuccess: "Thank you! Your report has been submitted. Our team will contact you.",
    statusApproved: "Approved",
    statusPending: "Pending",
    statusRejected: "Rejected",
    statusCancelled: "Cancelled",
  },
};
