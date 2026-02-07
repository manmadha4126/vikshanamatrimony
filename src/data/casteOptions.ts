export const castesByReligion: Record<string, string[]> = {
  "Hindu": [
    "Reddy",
    "Balija",
    "Kapu",
    "Kamma",
    "Kshtriyas",
    "Padmashali",
    "Yadavas",
    "Vishwa Brahmins",
    "Rajaka",
    "Nai Brahmins",
    "Brahmin",
    "Arya Vysya",
    "Mudaliar",
    "Gandla",
    "Velama",
    "SC Mala",
    "Caste No Bar",
    "Gowda",
    "Vaddera",
    "ST Erukula",
    "Besta",
    "Ediga",
    "Adi Dravida",
    "Agnikula Kshatriya",
    "Chettiars",
    "Bhatraju",
    "Inter Caste",
    "Kalinga Vysyas",
    "Kapu Reddy",
    "Kummari",
    "Kuruba",
    "Lingayat",
    "Thogata Veera Kshatriya",
    "Valmiki Boya",
    "Other Hindu"
  ],
  "Muslim": [
    "Sunni",
    "Shia",
    "Syed",
    "Sheikh",
    "Pathan",
    "Mughal",
    "Ansari / Julaha",
    "Qureshi",
    "Khan",
    "Malik",
    "Mirza",
    "Memon",
    "Khoja",
    "Bohra",
    "Mapilla / Moplah",
    "Labbay",
    "Marakkayar",
    "Rowther",
    "Lebbai",
    "Mansoori",
    "Qassab",
    "Darzi",
    "Saifi",
    "Momin",
    "Fakir",
    "Other Muslim"
  ],
  "Christian": [
    "Roman Catholic",
    "Latin Catholic",
    "Syro-Malabar Catholic",
    "Syro-Malankara Catholic",
    "Anglo-Indian Catholic",
    "Goan Catholic",
    "Mangalorean Catholic",
    "East Indian Catholic",
    "Syrian Christian",
    "Protestant",
    "Pentecostal",
    "Orthodox",
    "Seventh Day Adventist",
    "Jehovah's Witnesses",
    "Brethren",
    "Salvation Army",
    "Born Again",
    "Other Christian"
  ],
  "Sikh": [
    "Jat Sikh",
    "Khatri Sikh",
    "Arora Sikh",
    "Ramgarhia",
    "Saini Sikh",
    "Labana Sikh",
    "Ahluwalia Sikh",
    "Bhatra Sikh",
    "Ravidasia Sikh",
    "Lubana Sikh",
    "Mazhabi Sikh",
    "Ramdasia Sikh",
    "Other Sikh"
  ],
  "Jain": [
    "Digambar",
    "Shwetambar",
    "Agarwal Jain",
    "Oswal Jain",
    "Porwal Jain",
    "Khandelwal Jain",
    "Other Jain"
  ],
  "Buddhist": [
    "Mahayana",
    "Theravada",
    "Vajrayana",
    "Neo-Buddhist / Navayana",
    "Tibetan Buddhist",
    "Zen Buddhist",
    "Ambedkarite Buddhist",
    "Other Buddhist"
  ],
  "Parsi": [
    "Parsi - Shahenshai",
    "Parsi - Kadmi",
    "Irani",
    "Other Parsi"
  ],
  "Jewish": [
    "Bene Israel",
    "Cochin Jews",
    "Baghdadi Jews",
    "Bnei Menashe",
    "Other Jewish"
  ],
  "Other": [
    "Bahai",
    "Brahmo Samaj",
    "Arya Samaj",
    "Prarthana Samaj",
    "Theosophist",
    "Spiritual - No Religion",
    "Atheist",
    "Other"
  ]
};

export const subCastesByCaste: Record<string, string[]> = {
  // Hindu - Reddy
  "Reddy": [
    "Pakanati",
    "Malati",
    "Reddys",
    "Other Reddy"
  ],
  // Hindu - Balija
  "Balija": [
    "Setty Balija",
    "Balija Naidu",
    "Gajula Balija",
    "Other Balija"
  ],
  // Hindu - Kapu
  "Kapu": [
    "Munnuru Kapu",
    "Thurpu Kapu",
    "Telaga",
    "Other Kapu"
  ],
  // Hindu - Kamma
  "Kamma": [
    "Chowdary",
    "Naidu",
    "Other Kamma"
  ],
  // Hindu - Brahmin
  "Brahmin": [
    "Iyer",
    "Iyengar",
    "Namboodiri",
    "Saraswat",
    "Smartha",
    "Vaidiki",
    "Niyogi",
    "Other Brahmin"
  ],
  // Hindu - Mudaliar
  "Mudaliar": [
    "Sengunthar Mudaliar",
    "Agamudayar Mudaliar",
    "Thuluva Vellalar",
    "Arcot Mudaliar",
    "Other Mudaliar"
  ],
  // Hindu - Lingayat
  "Lingayat": [
    "Veerashaiva",
    "Jangama",
    "Panchamasali",
    "Other Lingayat"
  ],
  // Hindu - Chettiars
  "Chettiars": [
    "Nattukotai Chettiar",
    "Devanga Chettiar",
    "Arya Vysya",
    "Other Chettiar"
  ],
  // Default for others
  "Other Hindu": ["Other"],
  // Muslim - Sunni
  "Sunni": [
    "Hanafi",
    "Shafi",
    "Maliki",
    "Hanbali",
    "Deobandi",
    "Barelvi",
    "Ahl-e-Hadith",
    "Tableeghi",
    "Other Sunni"
  ],
  // Muslim - Shia
  "Shia": [
    "Ithna Ashari (Twelver)",
    "Ismaili",
    "Bohra",
    "Zaidi",
    "Other Shia"
  ],
  // Muslim - Syed
  "Syed": [
    "Bukhari",
    "Rizvi",
    "Kazmi",
    "Naqvi",
    "Zaidi",
    "Jafri",
    "Abidi",
    "Tirmizi",
    "Gillani",
    "Other Syed"
  ],
  // Muslim - Sheikh
  "Sheikh": [
    "Siddiqui",
    "Usmani",
    "Farooqui",
    "Hashmi",
    "Alvi",
    "Abbasi",
    "Other Sheikh"
  ],
  // Muslim - Pathan
  "Pathan": [
    "Yusufzai",
    "Afridi",
    "Khattak",
    "Bangash",
    "Orakzai",
    "Wazir",
    "Mehsud",
    "Shinwari",
    "Mohmand",
    "Other Pathan"
  ],
  // Muslim - Bohra
  "Bohra": [
    "Dawoodi Bohra",
    "Sulemani Bohra",
    "Alavi Bohra",
    "Other Bohra"
  ],
  // Christian - Roman Catholic
  "Roman Catholic": [
    "Latin Rite",
    "Syro-Malabar Rite",
    "Syro-Malankara Rite",
    "Other Roman Catholic"
  ],
  // Christian - Syrian Christian
  "Syrian Christian": [
    "Jacobite",
    "Orthodox",
    "Marthoma",
    "Knanaya",
    "Syro-Malabar",
    "Syro-Malankara",
    "Other Syrian Christian"
  ],
  // Christian - Protestant
  "Protestant": [
    "CSI (Church of South India)",
    "CNI (Church of North India)",
    "Baptist",
    "Methodist",
    "Lutheran",
    "Presbyterian",
    "Anglican",
    "Evangelical",
    "Reformed",
    "Other Protestant"
  ],
  // Christian - Pentecostal
  "Pentecostal": [
    "Assemblies of God",
    "IPC (Indian Pentecostal Church)",
    "TPM (The Pentecostal Mission)",
    "CGI (Church of God India)",
    "FGAI (Full Gospel Assembly India)",
    "Other Pentecostal"
  ],
  // Christian - Orthodox
  "Orthodox": [
    "Malankara Orthodox",
    "Indian Orthodox",
    "Jacobite Syrian Orthodox",
    "Other Orthodox"
  ],
  // Sikh - Jat Sikh
  "Jat Sikh": [
    "Sandhu",
    "Sidhu",
    "Gill",
    "Dhillon",
    "Grewal",
    "Bajwa",
    "Virk",
    "Randhawa",
    "Mann",
    "Brar",
    "Cheema",
    "Aulakh",
    "Dhaliwal",
    "Sekhon",
    "Chahal",
    "Other Jat Sikh"
  ],
  // Sikh - Khatri Sikh
  "Khatri Sikh": [
    "Chopra",
    "Kapoor",
    "Malhotra",
    "Khanna",
    "Kohli",
    "Tandon",
    "Sethi",
    "Mehra",
    "Anand",
    "Bedi",
    "Puri",
    "Sahni",
    "Other Khatri Sikh"
  ],
  // Sikh - Ramgarhia
  "Ramgarhia": [
    "Tarkhan (Carpenter)",
    "Lohar (Blacksmith)",
    "Raj Mistri (Mason)",
    "Other Ramgarhia"
  ],
  // Jain - Digambar
  "Digambar": [
    "Agrawal",
    "Porwal",
    "Khandelwal",
    "Saraogi",
    "Parwar",
    "Golalare",
    "Bagherwal",
    "Humad",
    "Other Digambar"
  ],
  // Jain - Shwetambar
  "Shwetambar": [
    "Oswal",
    "Srimal",
    "Visa Oswal",
    "Dasa Oswal",
    "Sthanakvasi",
    "Terapanthi",
    "Deravasi",
    "Murtipujak",
    "Other Shwetambar"
  ],
  // Default for others
  "Other Muslim": ["Other"],
  "Other Christian": ["Other"],
  "Other Sikh": ["Other"],
  "Other Jain": ["Other"],
  "Other Buddhist": ["Other"],
  "Other Parsi": ["Other"],
  "Other Jewish": ["Other"],
  "Other": ["Other"]
};
