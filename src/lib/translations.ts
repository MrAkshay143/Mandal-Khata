export type Language = 'en' | 'bn' | 'hi';

export interface TranslationType {
  appName: string;
  customers: string;
  summary: string;
  settings: string;
  netBalance: string;
  searchPlaceholder: string;
  noCustomers: string;
  youGave: string;
  youGot: string;
  debit: string;
  credit: string;
  youWillGet: string;
  youWillPay: string;
  totalReceivables: string;
  totalPayables: string;
  activityOverview: string;
  todayEntries: string;
  thisMonth: string;
  transactionsToday: string;
  totalTransactionsMonth: string;
  proTip: string;
  proTipText: string;
  financialSummary: string;
  editProfile: string;
  customerName: string;
  mobileNumber: string;
  updateProfile: string;
  addCustomer: string;
  editCustomer: string;
  enterName: string;
  enterMobile: string;
  saveEntry: string;
  editEntry: string;
  addEntry: string;
  amount: string;
  note: string;
  itemDescription: string;
  date: string;
  time: string;
  selectCustomer: string;
  change: string;
  confirmDelete: string;
  deleteText: string;
  cancel: string;
  delete: string;
  shareVia: string;
  whatsapp: string;
  textMsg: string;
  balance: string;
  sendReminder: string;
  shareLedger: string;
  today: string;
  yesterday: string;
  tomorrow: string;
  loading: string;
  customerNotFound: string;
  runningBalance: string;
  ledgerTitle: string;
  closingBalance: string;
  generatedVia: string;
  reminderMsgGave: string;
  reminderMsgGot: string;
  reminderMsgClear: string;
  entryMsg: string;
  creditGiven: string;
  paymentReceived: string;
  theme: string;
  language: string;
  light: string;
  dark: string;
  english: string;
  bengali: string;
  hindi: string;
  appearance: string;
  backupRestore: string;
  about: string;
  version: string;
  developedBy: string;
  helpSupport: string;
  privacyPolicy: string;
  businessOwner: string;
  editOwnerName: string;
  ownerNamePlaceholder: string;
  backup: string;
  restore: string;
  backupSuccess: string;
  restoreSuccess: string;
  restoreError: string;
  helpTitle: string;
  helpContent: string;
  dataSecurity: string;
  supportAbout: string;
  // Summary page
  topPending: string;
  recentTransactions: string;
  monthlyOverview: string;
  overdueSection: string;
  noTransactions: string;
  noPending: string;
  noOverdue: string;
  todayActivity: string;
  overdueLabel: string;
  // Help page
  helpHeroTitle: string;
  helpHeroSub: string;
  helpStep: string;
  helpStepLabel: string;
  helpFaqTitle: string;
  help_s1_title: string;
  help_s1_desc: string;
  help_s2_title: string;
  help_s2_desc: string;
  help_s3_title: string;
  help_s3_desc: string;
  help_s4_title: string;
  help_s4_desc: string;
  help_s5_title: string;
  help_s5_desc: string;
  help_s6_title: string;
  help_s6_desc: string;
  faq_q1: string;
  faq_a1: string;
  faq_q2: string;
  faq_a2: string;
  faq_q3: string;
  faq_a3: string;
  faq_q4: string;
  faq_a4: string;
  // Privacy page
  privHeroTitle: string;
  privHeroSub: string;
  privHeroDesc: string;
  priv_s1_title: string;
  priv_s1_desc: string;
  priv_s2_title: string;
  priv_s2_desc: string;
  priv_s3_title: string;
  priv_s3_desc: string;
  priv_s4_title: string;
  priv_s4_desc: string;
  priv_s5_title: string;
  priv_s5_desc: string;
  privBadge: string;
}

export const translations: Record<Language, TranslationType> = {
  en: {
    appName: 'Mandal Khata',
    customers: 'Customers',
    summary: 'Summary',
    settings: 'Settings',
    netBalance: 'Net Balance',
    searchPlaceholder: 'Search customers...',
    noCustomers: 'No customers found',
    youGave: 'You Gave',
    youGot: 'You Got',
    youWillGet: "You'll Get",
    youWillPay: "You'll Pay",
    totalReceivables: 'Total Receivables',
    totalPayables: 'Total Payables',
    activityOverview: 'Activity Overview',
    todayEntries: "Today's Entries",
    thisMonth: 'This Month',
    transactionsToday: 'Transactions made today',
    totalTransactionsMonth: 'Total transactions this month',
    proTip: 'Pro Tip',
    proTipText: 'Regularly update your entries to keep track of your business health. Use the search bar to quickly find customer balances.',
    financialSummary: 'Financial Summary',
    editProfile: 'Edit Profile',
    customerName: 'Customer Name',
    mobileNumber: 'Mobile Number',
    updateProfile: 'Update Profile',
    addCustomer: 'Add New Customer',
    editCustomer: 'Edit Customer',
    enterName: 'Enter name',
    enterMobile: 'Enter mobile number',
    saveEntry: 'Save Entry',
    editEntry: 'Edit Entry',
    addEntry: 'Add Entry',
    amount: 'Amount',
    note: 'Note (Optional)',
    itemDescription: 'Item description...',
    date: 'Date',
    time: 'Time',
    selectCustomer: 'Select Customer',
    change: 'Change',
    confirmDelete: 'Are you sure?',
    deleteText: 'This entry will be permanently deleted from your khata.',
    cancel: 'Cancel',
    delete: 'Delete',
    shareVia: 'Share via',
    whatsapp: 'WhatsApp',
    textMsg: 'Text Msg',
    balance: 'Balance',
    sendReminder: 'Send Reminder',
    shareLedger: 'Share Ledger',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    loading: 'Loading...',
    customerNotFound: 'Customer not found',
    runningBalance: 'Running Balance',
    ledgerTitle: '*Mandal Khata Ledger*',
    closingBalance: 'Closing Balance',
    generatedVia: 'Generated via Mandal Khata',
    reminderMsgGave: 'Hello {name}, you have a pending balance of {amount} to pay to Mandal Khata as of {date}. Please clear it soon.',
    reminderMsgGot: 'Hello {name}, I have a pending balance of {amount} to pay you as of {date}. I will clear it soon.',
    reminderMsgClear: 'Hello {name}, our Mandal Khata balance is clear. Thank you!',
    entryMsg: 'Mandal Khata Entry:\nCustomer: {name}\nType: {type}\nAmount: {amount}\nDate: {date}\nNote: {note}\nRunning Balance: {balance}',
    creditGiven: 'Credit Given',
    paymentReceived: 'Payment Received',
    theme: 'Theme',
    language: 'Language',
    light: 'Light',
    dark: 'Dark',
    english: 'English',
    bengali: 'Bengali',
    hindi: 'Hindi',
    appearance: 'Appearance',
    backupRestore: 'Backup & Restore',
    about: 'About',
    version: 'Version',
    developedBy: 'Developed by Akshay Mondal',
    helpSupport: 'Help & Support',
    privacyPolicy: 'Privacy Policy',
    businessOwner: 'Business Owner',
    editOwnerName: 'Edit Owner Name',
    ownerNamePlaceholder: 'Enter your name',
    backup: 'Backup Data',
    restore: 'Restore Data',
    backupSuccess: 'Backup downloaded successfully!',
    restoreSuccess: 'Data restored successfully!',
    restoreError: 'Invalid backup file.',
    helpTitle: 'How to use Mandal Khata',
    helpContent: '1. Add customers using the + icon.\n2. Click on a customer to view their ledger.\n3. Use "Debit" and "Credit" to record transactions.\n4. Share reminders or full ledgers via WhatsApp or SMS.\n5. Manage your profile and settings in the Settings tab.',
    debit: 'Debit',
    credit: 'Credit',
    dataSecurity: 'Data & Security',
    supportAbout: 'Support & About',
    topPending: 'Top Pending',
    recentTransactions: 'Recent Transactions',
    monthlyOverview: 'Monthly Overview',
    overdueSection: 'Overdue (30+ days)',
    noTransactions: 'No transactions yet',
    noPending: 'All settled up!',
    noOverdue: 'No overdue accounts',
    todayActivity: "Today's Activity",
    overdueLabel: 'Overdue',
    // Help page
    helpHeroTitle: 'How to Use Mandal Khata',
    helpHeroSub: 'Your simple digital ledger guide',
    helpStep: 'Step',
    helpStepLabel: 'Steps',
    helpFaqTitle: 'Frequently Asked Questions',
    help_s1_title: 'Add Customers',
    help_s1_desc: 'Tap the green + button at the bottom right to add a new customer with their name and mobile number.',
    help_s2_title: 'View Ledger',
    help_s2_desc: 'Tap any customer card to open their ledger — see all past transactions and running balance.',
    help_s3_title: 'Record Transactions',
    help_s3_desc: 'Inside the ledger, tap "Debit" (you gave money) or "Credit" (you received money) to record a transaction.',
    help_s4_title: 'Share Ledger or Reminder',
    help_s4_desc: 'Tap the Share icon in the ledger header to send the full ledger, or the Bell icon to send a payment reminder via WhatsApp or SMS.',
    help_s5_title: 'Send Reminders',
    help_s5_desc: 'Use the bell icon to send a payment reminder to a specific customer directly via WhatsApp or SMS.',
    help_s6_title: 'Manage Settings',
    help_s6_desc: 'Go to the Settings tab to change your owner name, app theme, language, and backup or restore your data.',
    faq_q1: 'What does "Debit" mean?',
    faq_a1: 'Debit means you gave money or goods to the customer. The customer now owes you.',
    faq_q2: 'What does "Credit" mean?',
    faq_a2: 'Credit means you received money from the customer. The outstanding balance is reduced.',
    faq_q3: 'Is my data secure?',
    faq_a3: 'Yes! All your data is securely stored in our cloud database and isolated from other users.',
    faq_q4: 'How do I backup my data?',
    faq_a4: 'Go to Settings → Backup & Restore → Backup Data. A JSON file containing your customers and ledger entries will be downloaded.',
    // Privacy page
    privHeroTitle: 'Your Privacy Matters',
    privHeroSub: 'Cloud-secured · Total data isolation',
    privHeroDesc: 'Mandal Khata is designed with a privacy-first mindset. Your financial data is isolated and secure.',
    priv_s1_title: 'Data Storage',
    priv_s1_desc: 'All your data — customers, transactions, settings — is securely stored in our cloud MySQL database and strictly scoped to your account. No other user can access your ledger.',
    priv_s2_title: 'Account Registration',
    priv_s2_desc: 'You only provide your name, email, and password to secure your account. We use industry-standard hashing (bcrypt) to protect your passwords.',
    priv_s3_title: 'No Tracking or Analytics',
    priv_s3_desc: 'We focus purely on functional tools. We do not collect behavioral analytics or track your day-to-day transaction habits.',
    priv_s4_title: 'Total Data Ownership',
    priv_s4_desc: 'You can export all your customers and ledger entries anytime as a comprehensive backup JSON file directly from the Settings menu.',
    priv_s5_title: 'WhatsApp & SMS Sharing',
    priv_s5_desc: 'When you share a ledger or reminder, the content is passed directly to WhatsApp or your SMS app. Mandal Khata never intercepts these external messages.',
    privBadge: '🔒 Your data is fully isolated to your account. Always.',
  },
  bn: {
    appName: 'মন্ডল খাতা',
    customers: 'কাস্টমার',
    summary: 'সারাংশ',
    settings: 'সেটিংস',
    netBalance: 'মোট ব্যালেন্স',
    searchPlaceholder: 'কাস্টমার খুঁজুন...',
    noCustomers: 'কোনো কাস্টমার পাওয়া যায়নি',
    youGave: 'আপনি দিয়েছেন',
    youGot: 'আপনি পেয়েছেন',
    youWillGet: 'আপনি পাবেন',
    youWillPay: 'আপনি দেবেন',
    totalReceivables: 'মোট পাওনা',
    totalPayables: 'মোট দেনা',
    activityOverview: 'কার্যকলাপের ওভারভিউ',
    todayEntries: 'আজকের এন্ট্রি',
    thisMonth: 'এই মাস',
    transactionsToday: 'আজকে করা লেনদেন',
    totalTransactionsMonth: 'এই মাসের মোট লেনদেন',
    proTip: 'পরামর্শ',
    proTipText: 'আপনার ব্যবসার স্বাস্থ্যের ট্র্যাক রাখতে নিয়মিত আপনার এন্ট্রিগুলি আপডেট করুন। কাস্টমার ব্যালেন্স দ্রুত খুঁজে পেতে সার্চ বার ব্যবহার করুন।',
    financialSummary: 'আর্থিক সারাংশ',
    editProfile: 'প্রোফাইল এডিট করুন',
    customerName: 'কাস্টমারের নাম',
    mobileNumber: 'মোবাইল নম্বর',
    updateProfile: 'প্রোফাইল আপডেট করুন',
    addCustomer: 'নতুন কাস্টমার যোগ করুন',
    editCustomer: 'কাস্টমার এডিট করুন',
    enterName: 'নাম লিখুন',
    enterMobile: 'মোবাইল নম্বর লিখুন',
    saveEntry: 'এন্ট্রি সেভ করুন',
    editEntry: 'এন্ট্রি এডিট করুন',
    addEntry: 'এন্ট্রি যোগ করুন',
    amount: 'পরিমাণ',
    note: 'নোট (ঐচ্ছিক)',
    itemDescription: 'আইটেমের বিবরণ...',
    date: 'তারিখ',
    time: 'সময়',
    selectCustomer: 'কাস্টমার সিলেক্ট করুন',
    change: 'পরিবর্তন করুন',
    confirmDelete: 'আপনি কি নিশ্চিত?',
    deleteText: 'এই এন্ট্রিটি আপনার খাতা থেকে স্থায়ীভাবে মুছে ফেলা হবে।',
    cancel: 'বাতিল',
    delete: 'মুছে ফেলুন',
    shareVia: 'শেয়ার করুন',
    whatsapp: 'হোয়াটসঅ্যাপ',
    textMsg: 'টেক্সট মেসেজ',
    balance: 'ব্যালেন্স',
    sendReminder: 'রিমাইন্ডার পাঠান',
    shareLedger: 'লেজার শেয়ার করুন',
    today: 'আজ',
    yesterday: 'গতকাল',
    tomorrow: 'আগামীকাল',
    loading: 'লোড হচ্ছে...',
    customerNotFound: 'কাস্টমার পাওয়া যায়নি',
    runningBalance: 'চলতি ব্যালেন্স',
    ledgerTitle: '*মন্ডল খাতা লেজার*',
    closingBalance: 'সমাপনী ব্যালেন্স',
    generatedVia: 'মন্ডল খাতা দ্বারা তৈরি',
    reminderMsgGave: 'হ্যালো {name}, {date} তারিখ পর্যন্ত মন্ডল খাতায় আপনার {amount} টাকা বাকি আছে। দয়া করে এটি শীঘ্রই পরিশোধ করুন।',
    reminderMsgGot: 'হ্যালো {name}, {date} তারিখ পর্যন্ত আপনার কাছে আমার {amount} টাকা বাকি আছে। আমি এটি শীঘ্রই পরিশোধ করব।',
    reminderMsgClear: 'হ্যালো {name}, আমাদের মন্ডল খাতা ব্যালেন্স পরিষ্কার। ধন্যবাদ!',
    entryMsg: 'মন্ডল খাতা এন্ট্রি:\nকাস্টমার: {name}\nধরণ: {type}\nপরিমাণ: {amount}\nতারিখ: {date}\nনোট: {note}\nচলতি ব্যালেন্স: {balance}',
    creditGiven: 'ধার দেওয়া হয়েছে',
    paymentReceived: 'টাকা পাওয়া গেছে',
    theme: 'থিম',
    language: 'ভাষা',
    light: 'লাইট',
    dark: 'ডার্ক',
    english: 'ইংরেজি',
    bengali: 'বাংলা',
    hindi: 'হিন্দি',
    appearance: 'চেহারা',
    backupRestore: 'ব্যাকআপ এবং রিস্টোর',
    about: 'সম্পর্কে',
    version: 'ভার্সন',
    developedBy: 'অক্ষয় মন্ডল দ্বারা তৈরি',
    helpSupport: 'সাহায্য এবং সমর্থন',
    privacyPolicy: 'গোপনীয়তা নীতি',
    businessOwner: 'ব্যবসার মালিক',
    editOwnerName: 'মালিকের নাম এডিট করুন',
    ownerNamePlaceholder: 'আপনার নাম লিখুন',
    backup: 'ডেটা ব্যাকআপ',
    restore: 'ডেটা রিস্টোর',
    backupSuccess: 'ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে!',
    restoreSuccess: 'ডেটা সফলভাবে রিস্টোর হয়েছে!',
    restoreError: 'ভুল ব্যাকআপ ফাইল।',
    helpTitle: 'Mandal Khata ব্যবহার নির্দেশিকা',
    helpContent: 'ডেবিট ও ক্রেডিট দিয়ে লেনদেন রেকর্ড করুন। সেটিংসে প্রোফাইল পরিচালনা করুন।',
    debit: 'ডেবিট',
    credit: 'ক্রেডিট',
    dataSecurity: 'ডেটা এবং নিরাপত্তা',
    supportAbout: 'সাহায্য এবং সম্পর্কে',
    topPending: 'শীর্ষ বকেয়া',
    recentTransactions: 'সাম্প্রতিক লেনদেন',
    monthlyOverview: 'মাসিক ওভারভিউ',
    overdueSection: 'মেয়াদোত্তীর্ণ (৩০+ দিন)',
    noTransactions: 'এখনো কোনো লেনদেন নেই',
    noPending: 'সব পরিশোধিত!',
    noOverdue: 'কোনো মেয়াদোত্তীর্ণ অ্যাকাউন্ট নেই',
    todayActivity: 'আজকের কার্যকলাপ',
    overdueLabel: 'মেয়াদোত্তীর্ণ',
    // Help page
    helpHeroTitle: 'মন্ডল খাতা কিভাবে ব্যবহার করবেন',
    helpHeroSub: 'আপনার সহজ ডিজিটাল খাতার নির্দেশিকা',
    helpStep: 'ধাপ',
    helpStepLabel: 'ধাপ',
    helpFaqTitle: 'সাধারণ প্রশ্নাবলী',
    help_s1_title: 'কাস্টমার যোগ করুন',
    help_s1_desc: 'নতুন কাস্টমার যোগ করতে ডানদিকের সবুজ + বাটনে ট্যাপ করুন।',
    help_s2_title: 'লেজার দেখুন',
    help_s2_desc: 'যেকোনো কাস্টমার কার্ডে ট্যাপ করলে তাদের লেজার ও লেনদেনের ইতিহাস দেখা যাবে।',
    help_s3_title: 'লেনদেন রেকর্ড করুন',
    help_s3_desc: 'লেজারে ঢুকে "ডেবিট" (টাকা দিয়েছেন) বা "ক্রেডিট" (টাকা পেয়েছেন) বাটনে ট্যাপ করুন।',
    help_s4_title: 'লেজার বা রিমাইন্ডার শেয়ার করুন',
    help_s4_desc: 'লেজার হেডারের শেয়ার আইকনে ট্যাপ করুন পুরো লেজার পাঠাতে, অথবা বেল আইকনে ট্যাপ করুন পেমেন্ট রিমাইন্ডার পাঠাতে।',
    help_s5_title: 'রিমাইন্ডার পাঠান',
    help_s5_desc: 'বেল আইকন ব্যবহার করে WhatsApp বা SMS-এর মাধ্যমে সরাসরি কাস্টমারকে পেমেন্ট রিমাইন্ডার পাঠান।',
    help_s6_title: 'সেটিংস পরিচালনা',
    help_s6_desc: 'সেটিংস ট্যাবে গিয়ে মালিকের নাম, থিম, ভাষা পরিবর্তন করুন এবং ডেটা ব্যাকআপ বা রিস্টোর করুন।',
    faq_q1: '"ডেবিট" মানে কী?',
    faq_a1: 'ডেবিট মানে আপনি কাস্টমারকে টাকা বা পণ্য দিয়েছেন। কাস্টমার এখন আপনার কাছে ঋণী।',
    faq_q2: '"ক্রেডিট" মানে কী?',
    faq_a2: 'ক্রেডিট মানে আপনি কাস্টমারের কাছ থেকে টাকা পেয়েছেন। বকেয়া ব্যালেন্স কমে যাবে।',
    faq_q3: 'আমার ডেটা কি সুরক্ষিত?',
    faq_a3: 'হ্যাঁ! আপনার সমস্ত ডেটা আমাদের ক্লাউড ডাটাবেসে নিরাপদে সংরক্ষিত থাকে এবং অন্য ব্যবহারকারীদের থেকে আলাদা থাকে।',
    faq_q4: 'ডেটা ব্যাকআপ কিভাবে করব?',
    faq_a4: 'সেটিংস → ব্যাকআপ ও রিস্টোর → ডেটা ব্যাকআপ-এ যান। আপনার সমস্ত লেনদেনের একটি JSON ফাইল ডাউনলোড হবে।',
    // Privacy page
    privHeroTitle: 'আপনার গোপনীয়তা গুরুত্বপূর্ণ',
    privHeroSub: 'ক্লাউড সুরক্ষিত · সম্পূর্ণ ডেটা বিচ্ছিন্নতা',
    privHeroDesc: 'মন্ডল খাতা গোপনীয়তা-প্রথম মানসিকতায় তৈরি। আপনার আর্থিক তথ্য সম্পূর্ণ স্বাধীন এবং সুরক্ষিত।',
    priv_s1_title: 'ডেটা স্টোরেজ',
    priv_s1_desc: 'আপনার সব ডেটা — কাস্টমার, লেনদেন, সেটিংস — আমাদের নিরাপদ ক্লাউড MySQL ডাটাবেসে সংরক্ষিত থাকে এবং শুধুমাত্র আপনার অ্যাকাউন্টের মধ্যে সীমাবদ্ধ। অন্য কোনো ব্যবহারকারী আপনার লেজার অ্যাক্সেস করতে পারবে না।',
    priv_s2_title: 'অ্যাকাউন্ট নিবন্ধন',
    priv_s2_desc: 'আপনার অ্যাকাউন্ট সুরক্ষিত করতে আপনি আপনার নাম, ইমেইল এবং পাসওয়ার্ড প্রদান করেন। আমরা আপনার পাসওয়ার্ড সুরক্ষিত করতে ইন্ডাস্ট্রি-স্ট্যান্ডার্ড হ্যাশিং (bcrypt) ব্যবহার করি।',
    priv_s3_title: 'কোনো ট্র্যাকিং বা বিশ্লেষণ নেই',
    priv_s3_desc: 'আমরা কোনো অ্যানালিটিক্স বা আপনার দৈনন্দিন লেনদেনের অভ্যাস ট্র্যাক করি না।',
    priv_s4_title: 'সম্পূর্ণ ডেটা মালিকানা',
    priv_s4_desc: 'আপনি যেকোনো সময় সেটিংস মেনু থেকে আপনার সমস্ত কাস্টমার এবং লেজার এন্ট্রিগুলোকে একটি JSON ব্যাকআপ ফাইল হিসেবে ডাউনলোড করতে পারবেন।',
    priv_s5_title: 'WhatsApp ও SMS শেয়ারিং',
    priv_s5_desc: 'লেজার বা রিমাইন্ডার শেয়ার করলে সেটি সরাসরি WhatsApp বা SMS অ্যাপে যায়। মন্ডল খাতা এই বার্তাগুলো কখনো পড়ে না বা সংরক্ষণ করে না।',
    privBadge: '🔒 আপনার অ্যাকাউন্ট এবং ডেটা সম্পূর্ণ সুরক্ষিত। সবসময়।',
  },
  hi: {
    appName: 'मंडल खाता',
    customers: 'ग्राहक',
    summary: 'सारांश',
    settings: 'सेटिंग्स',
    netBalance: 'कुल बैलेंस',
    searchPlaceholder: 'ग्राहक खोजें...',
    noCustomers: 'कोई ग्राहक नहीं मिला',
    youGave: 'आपने दिया',
    youGot: 'आपको मिला',
    youWillGet: 'आपको मिलेगा',
    youWillPay: 'आप देंगे',
    totalReceivables: 'कुल प्राप्य',
    totalPayables: 'कुल देय',
    activityOverview: 'गतिविधि अवलोकन',
    todayEntries: 'आज की प्रविष्टियाँ',
    thisMonth: 'इस महीने',
    transactionsToday: 'आज किए गए लेनदेन',
    totalTransactionsMonth: 'इस महीने के कुल लेनदेन',
    proTip: 'प्रो टिप',
    proTipText: 'अपने व्यवसाय के स्वास्थ्य पर नज़र रखने के लिए नियमित रूप से अपनी प्रविष्टियों को अपडेट करें। ग्राहक बैलेंस जल्दी से खोजने के लिए सर्च बार का उपयोग करें।',
    financialSummary: 'वित्तीय सारांश',
    editProfile: 'प्रोफ़ाइल संपादित करें',
    customerName: 'ग्राहक का नाम',
    mobileNumber: 'मोबाइल नंबर',
    updateProfile: 'प्रोफ़ाइल अपडेट करें',
    addCustomer: 'नया ग्राहक जोड़ें',
    editCustomer: 'ग्राहक संपादित करें',
    enterName: 'नाम दर्ज करें',
    enterMobile: 'मोबाइल नंबर दर्ज करें',
    saveEntry: 'प्रविष्टि सहेजें',
    editEntry: 'प्रविष्टि संपादित करें',
    addEntry: 'प्रविष्टि जोड़ें',
    amount: 'राशि',
    note: 'नोट (वैकल्पिक)',
    itemDescription: 'वस्तु का विवरण...',
    date: 'तारीख',
    time: 'समय',
    selectCustomer: 'ग्राहक चुनें',
    change: 'बदलें',
    confirmDelete: 'क्या आप सुनिश्चित हैं?',
    deleteText: 'यह प्रविष्टि आपके खाते से स्थायी रूप से हटा दी जाएगी।',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    shareVia: 'इसके माध्यम से साझा करें',
    whatsapp: 'व्हाट्सएप',
    textMsg: 'टेक्सट মেসেজ',
    balance: 'बैलेंस',
    sendReminder: 'रिमाइंडर भेजें',
    shareLedger: 'लेजर साझा करें',
    today: 'आज',
    yesterday: 'कल',
    tomorrow: 'कल (आने वाला)',
    loading: 'लोड हो रहा है...',
    customerNotFound: 'ग्राहक नहीं मिला',
    runningBalance: 'रनिंग बैलेंस',
    ledgerTitle: '*मंडल खाता लेजर*',
    closingBalance: 'अंतिम बैलेंस',
    generatedVia: 'मंडल खाता के माध्यम से उत्पन्न',
    reminderMsgGave: 'नमस्ते {name}, {date} तक मंडल खाता में आपका {amount} का बकाया बैलेंस है। कृपया इसे जल्द ही चुकाएं।',
    reminderMsgGot: 'नमस्ते {name}, {date} तक मेरा आपके पास {amount} का बकाया बैलेंस है। मैं इसे जल्द ही चुका दूंगा।',
    reminderMsgClear: 'नमस्ते {name}, हमारा मंडल खाता बैलेंस साफ है। धन्यवाद!',
    entryMsg: 'मंडल खाता प्रविष्टि:\nग्राहक: {name}\nप्रकार: {type}\nराशि: {amount}\nतारीख: {date}\nनोट: {note}\nरनिंग बैलेंस: {balance}',
    creditGiven: 'उधार दिया',
    paymentReceived: 'भुगतान प्राप्त हुआ',
    theme: 'थीम',
    language: 'भाषा',
    light: 'लाइट',
    dark: 'डार्क',
    english: 'अंग्रेजी',
    bengali: 'বঙালী',
    hindi: 'हिंदी',
    appearance: 'দिखावट',
    backupRestore: 'बैकअप और रिस्टोर',
    about: 'के बारे में',
    version: 'संस्करण',
    developedBy: 'अक्षय मंडल द्वारा विकसित',
    helpSupport: 'सहायता और समर्थन',
    privacyPolicy: 'गोपनीयता नीति',
    businessOwner: 'व्यापार मालिक',
    editOwnerName: 'मालिक का नाम संपादित करें',
    ownerNamePlaceholder: 'अपना नाम दर्ज करें',
    backup: 'डेटा बैकअप',
    restore: 'डेटा रिस्टोर',
    backupSuccess: 'बैकअप सफलतापूर्वक डाउनलोड हो गया!',
    restoreSuccess: 'डेटा सफलतापूर्वक रिस्टोर हो गया!',
    restoreError: 'अमान्य बैकअप फ़ाइल।',
    helpTitle: 'मंडल खाता का उपयोग कैसे करें',
    helpContent: '1. + आइकन का उपयोग करके ग्राहक जोड़ें।\n2. लेजर देखने के लिए ग्राहक के नाम पर क्लिक करें।\n3. लेनदेन रिकॉर्ड करने के लिए "डेबिट" और "क्रेडिट" का उपयोग करें।\n4. व्हाट्सएप या एसएमएस के माध्यम से रिमाइंडर या पूरा लेजर साझा करें।\n5. सेटिंग्स टैब में अपनी प्रोफाइल और सेटिंग्स प्रबंधित करें।',
    debit: 'डेबिट',
    credit: 'क्रेडिट',
    dataSecurity: 'डेटा और सुरक्षा',
    supportAbout: 'समर्थन और परिचय',
    topPending: 'शीर्ष बकाया',
    recentTransactions: 'हाल के लेनदेन',
    monthlyOverview: 'मासिक अवलोकन',
    overdueSection: 'अतिदेय (30+ दिन)',
    noTransactions: 'अभी तक कोई लेनदेन नहीं',
    noPending: 'सब निपटाया गया!',
    noOverdue: 'कोई अतिदेय खाता नहीं',
    todayActivity: 'आज की गतिविधि',
    overdueLabel: 'अतिदेय',
    // Help page
    helpHeroTitle: 'मंडल खाता का उपयोग कैसे करें',
    helpHeroSub: 'आपकी सरल डिजिटल बही-खाता मार्गदर्शिका',
    helpStep: 'चरण',
    helpStepLabel: 'चरण',
    helpFaqTitle: 'अक्सर पूछे जाने वाले सवाल',
    help_s1_title: 'ग्राहक जोड़ें',
    help_s1_desc: 'नया ग्राहक जोड़ने के लिए नीचे दाईं ओर हरे + बटन पर टैप करें।',
    help_s2_title: 'खाता बही देखें',
    help_s2_desc: 'किसी भी ग्राहक कार्ड पर टैप करके उनका लेजर और सभी लेनदेन देख सकते हैं।',
    help_s3_title: 'लेनदेन दर्ज करें',
    help_s3_desc: 'लेजर में जाकर "डेबिट" (पैसा दिया) या "क्रेडिट" (पैसा मिला) बटन दबाएं।',
    help_s4_title: 'लेजर या रिमाइंडर साझा करें',
    help_s4_desc: 'पूरा लेजर भेजने के लिए शेयर आइकन और भुगतान रिमाइंडर के लिए बेल आइकन पर टैप करें।',
    help_s5_title: 'रिमाइंडर भेजें',
    help_s5_desc: 'बेल आइकन का उपयोग करके WhatsApp या SMS के माध्यम से ग्राहक को सीधे रिमाइंडर भेजें।',
    help_s6_title: 'सेटिंग्स प्रबंधित करें',
    help_s6_desc: 'सेटिंग्स टैब में जाकर मालिक का नाम, थीम, भाषा बदलें और डेटा बैकअप या रिस्टोर करें।',
    faq_q1: '"डेबिट" का क्या अर्थ है?',
    faq_a1: 'डेबिट का अर्थ है कि आपने ग्राहक को पैसे या सामान दिया है। ग्राहक आपका ऋणी है।',
    faq_q2: '"क्रेडिट" का क्या अर्थ है?',
    faq_a2: 'क्रेडिट का अर्थ है कि आपने ग्राहक से पैसे प्राप्त किए हैं। बकाया राशि कम हो जाती है।',
    faq_q3: 'क्या मेरा डेटा सुरक्षित है?',
    faq_a3: 'हां! आपका सारा डेटा हमारे क्लाउड डेटाबेस में सुरक्षित रूप से संग्रहीत है और अन्य उपयोगकर्ताओं से अलग है।',
    faq_q4: 'डेटा बैकअप कैसे करें?',
    faq_a4: 'सेटिंग्स → बैकअप और रिस्टोर → डेटा बैकअप पर जाएं। एक JSON फ़ाइल डाउनलोड होगी जिसमें आपके सभी ग्राहक और लेनदेन शामिल होंगे।',
    // Privacy page
    privHeroTitle: 'आपकी गोपनीयता महत्वपूर्ण है',
    privHeroSub: 'क्लाउड-सुरक्षित · पूर्ण डेटा अलगाव',
    privHeroDesc: 'मंडल खाता गोपनीयता-प्रथम सोच के साथ बनाया गया है। आपका वित्तीय डेटा अलग और सुरक्षित है।',
    priv_s1_title: 'डेटा संग्रहण',
    priv_s1_desc: 'आपका सारा डेटा — ग्राहक, लेनदेन, सेटिंग्स — हमारे सुरक्षित क्लाउड MySQL डेटाबेस में संग्रहीत है और आपके खाते तक ही सीमित है। कोई अन्य उपयोगकर्ता आपके डेटा तक नहीं पहुंच सकता।',
    priv_s2_title: 'खाता पंजीकरण',
    priv_s2_desc: 'आप अपनी खाता सुरक्षित करने के लिए अपना नाम, ईमेल और पासवर्ड प्रदान करते हैं। हम आपके पासवर्ड की सुरक्षा के लिए उद्योग-मानक हैशिंग (bcrypt) का उपयोग करते हैं।',
    priv_s3_title: 'कोई ट्रैकिंग या विश्लेषण नहीं',
    priv_s3_desc: 'हम कोई भी एनालिटिक्स एकत्र नहीं करते हैं या आपकी दैनिक लेनदेन की आदतों को ट्रैक नहीं करते हैं।',
    priv_s4_title: 'पूर्ण डेटा नियंत्रण',
    priv_s4_desc: 'आप सेटिंग्स मेनू से किसी भी समय अपने सभी ग्राहकों और प्रविष्टियों को बैकअप JSON फ़ाइल के रूप में डाउनलोड कर सकते हैं।',
    priv_s5_title: 'WhatsApp और SMS साझाकरण',
    priv_s5_desc: 'जब आप लेजर या रिमाइंडर साझा करते हैं, तो सामग्री सीधे WhatsApp या SMS ऐप को भेजी जाती है। मंडल खाता कभी भी इन संदेशों को नहीं पढ़ता।',
    privBadge: '🔒 आपका डेटा आपके खाते तक पूरी तरह से सीमित और सुरक्षित है। हमेशा।',
  }
};
