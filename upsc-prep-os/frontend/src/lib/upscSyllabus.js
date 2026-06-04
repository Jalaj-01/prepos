// frontend/src/lib/upscSyllabus.js
// Official UPSC Civil Services Examination syllabus (current pattern)
// Structure: papers -> sections -> topics -> subtopics

export const PRELIMS_SYLLABUS = {
    id: "prelims",
    label: "Prelims",
    papers: [
        {
            id: "gs1",
            label: "Paper I — General Studies",
            marks: 200,
            duration: "2 hours",
            description:
                "Objective type, 100 questions. Counts for merit ranking.",
            sections: [
                {
                    id: "history",
                    label: "History of India & Indian National Movement",
                    topics: [
                        {
                            id: "ancient",
                            label: "Ancient India",
                            subtopics: [
                                "Indus Valley Civilisation",
                                "Vedic Period",
                                "Mahajanapadas",
                                "Mauryan Empire",
                                "Post-Mauryan Period",
                                "Gupta Empire",
                                "Post-Gupta / Early Medieval",
                            ],
                        },
                        {
                            id: "medieval",
                            label: "Medieval India",
                            subtopics: [
                                "Delhi Sultanate",
                                "Vijayanagara & Bahmani Kingdoms",
                                "Mughal Empire",
                                "Marathas",
                                "Bhakti & Sufi Movements",
                            ],
                        },
                        {
                            id: "modern",
                            label: "Modern India",
                            subtopics: [
                                "Advent of Europeans",
                                "British Expansion",
                                "Revolt of 1857",
                                "Socio-Religious Reform Movements",
                                "Governor Generals & Viceroys",
                                "Economic Impact of British Rule",
                                "Education, Press & Constitutional Reforms",
                            ],
                        },
                        {
                            id: "freedom",
                            label: "Indian National Movement",
                            subtopics: [
                                "Formation of INC",
                                "Moderates & Extremists",
                                "Partition of Bengal & Swadeshi",
                                "Home Rule Movement",
                                "Gandhian Era (NCM, CDM, QIM)",
                                "Revolutionary Movements",
                                "Towards Independence & Partition",
                            ],
                        },
                    ],
                },
                {
                    id: "geography",
                    label: "Geography of India & World",
                    topics: [
                        {
                            id: "physical",
                            label: "Physical Geography",
                            subtopics: [
                                "Geomorphology",
                                "Climatology",
                                "Oceanography",
                                "Biogeography",
                            ],
                        },
                        {
                            id: "india-geo",
                            label: "Indian Geography",
                            subtopics: [
                                "Physiographic Divisions",
                                "Drainage System",
                                "Climate & Monsoon",
                                "Soils & Vegetation",
                                "Agriculture & Cropping Patterns",
                                "Mineral & Energy Resources",
                                "Industries",
                            ],
                        },
                        {
                            id: "world-geo",
                            label: "World Geography",
                            subtopics: [
                                "World Physical Features",
                                "Major Climatic Regions",
                                "Major Industries & Trade Routes",
                                "Mapping",
                            ],
                        },
                        {
                            id: "human-geo",
                            label: "Human & Economic Geography",
                            subtopics: [
                                "Population & Settlements",
                                "Migration & Urbanisation",
                                "Economic Activities",
                            ],
                        },
                    ],
                },
                {
                    id: "polity",
                    label: "Indian Polity & Governance",
                    topics: [
                        {
                            id: "constitution",
                            label: "Constitution",
                            subtopics: [
                                "Historical Underpinnings & Evolution",
                                "Preamble",
                                "Fundamental Rights",
                                "DPSP & Fundamental Duties",
                                "Amendment Procedure & Basic Structure",
                            ],
                        },
                        {
                            id: "union",
                            label: "Union Government",
                            subtopics: [
                                "President & Vice President",
                                "Prime Minister & Council of Ministers",
                                "Parliament",
                                "Supreme Court",
                            ],
                        },
                        {
                            id: "state",
                            label: "State Government",
                            subtopics: [
                                "Governor",
                                "CM & State Council",
                                "State Legislature",
                                "High Courts",
                            ],
                        },
                        {
                            id: "local",
                            label: "Local Government",
                            subtopics: [
                                "Panchayati Raj (73rd Amendment)",
                                "Municipalities (74th Amendment)",
                            ],
                        },
                        {
                            id: "constitutional-bodies",
                            label: "Constitutional & Statutory Bodies",
                            subtopics: [
                                "Election Commission",
                                "UPSC / SPSCs",
                                "CAG & AG",
                                "Finance Commission",
                                "NHRC, CIC, CVC, Lokpal, etc.",
                            ],
                        },
                    ],
                },
                {
                    id: "economy",
                    label: "Economic & Social Development",
                    topics: [
                        {
                            id: "basics",
                            label: "Basics of Economy",
                            subtopics: [
                                "National Income Accounting",
                                "Inflation & Unemployment",
                                "Money & Banking",
                                "Capital & Financial Markets",
                            ],
                        },
                        {
                            id: "growth",
                            label: "Growth & Development",
                            subtopics: [
                                "Planning in India",
                                "NITI Aayog",
                                "Sustainable Development",
                                "Poverty & Inclusion",
                            ],
                        },
                        {
                            id: "fiscal",
                            label: "Fiscal & Monetary Policy",
                            subtopics: [
                                "Budget & FRBM",
                                "Taxation (GST etc.)",
                                "Monetary Policy & RBI",
                            ],
                        },
                        {
                            id: "external",
                            label: "External Sector",
                            subtopics: [
                                "Balance of Payments",
                                "Foreign Trade & FDI",
                                "IMF, World Bank, WTO",
                            ],
                        },
                        {
                            id: "agri-ind",
                            label: "Agriculture, Industry & Services",
                            subtopics: [
                                "Agricultural Reforms & MSP",
                                "Food Processing & PDS",
                                "Industrial Policy & MSME",
                                "Services & IT",
                            ],
                        },
                    ],
                },
                {
                    id: "environment",
                    label: "Environment & Ecology",
                    topics: [
                        {
                            id: "ecology",
                            label: "Ecology Basics",
                            subtopics: [
                                "Ecosystems",
                                "Biodiversity",
                                "Food Chains & Webs",
                            ],
                        },
                        {
                            id: "conservation",
                            label: "Conservation",
                            subtopics: [
                                "Protected Areas",
                                "Wildlife Conservation Acts",
                                "Project Tiger, Elephant, etc.",
                            ],
                        },
                        {
                            id: "pollution",
                            label: "Pollution & Climate Change",
                            subtopics: [
                                "Air, Water, Soil Pollution",
                                "Climate Change & Global Warming",
                                "International Conventions (UNFCCC, CBD)",
                            ],
                        },
                    ],
                },
                {
                    id: "scitech",
                    label: "General Science & Technology",
                    topics: [
                        {
                            id: "general-science",
                            label: "Basic Sciences",
                            subtopics: ["Physics", "Chemistry", "Biology"],
                        },
                        {
                            id: "tech-current",
                            label: "Current Tech & Frontiers",
                            subtopics: [
                                "Space (ISRO Missions)",
                                "Defence & Nuclear",
                                "Biotech & Health",
                                "IT, AI, Robotics",
                            ],
                        },
                    ],
                },
                {
                    id: "current-affairs",
                    label: "Current Events of National & International Importance",
                    topics: [
                        {
                            id: "national",
                            label: "National Affairs",
                            subtopics: [
                                "Government Schemes",
                                "Policy Changes",
                                "Important Reports",
                            ],
                        },
                        {
                            id: "international",
                            label: "International Affairs",
                            subtopics: [
                                "India & Neighbours",
                                "India & Major Powers",
                                "Global Institutions",
                            ],
                        },
                    ],
                },
            ],
        },
        {
            id: "csat",
            label: "Paper II — CSAT (Aptitude)",
            marks: 200,
            duration: "2 hours",
            description:
                "Qualifying paper — 33% required. 80 questions, objective.",
            sections: [
                {
                    id: "comprehension",
                    label: "Comprehension",
                    topics: [
                        {
                            id: "rc",
                            label: "Reading Comprehension",
                            subtopics: [
                                "Inference-based Questions",
                                "Theme Identification",
                                "Tone & Author's View",
                            ],
                        },
                    ],
                },
                {
                    id: "logical",
                    label: "Logical Reasoning & Analytical Ability",
                    topics: [
                        {
                            id: "reasoning",
                            label: "Reasoning",
                            subtopics: [
                                "Syllogism",
                                "Statement & Assumption",
                                "Statement & Conclusion",
                                "Cause & Effect",
                                "Coding-Decoding",
                                "Series",
                            ],
                        },
                    ],
                },
                {
                    id: "decision-making",
                    label: "Decision Making & Problem Solving",
                    topics: [
                        {
                            id: "dm",
                            label: "Decision Making Scenarios",
                            subtopics: [
                                "Ethical Dilemmas",
                                "Administrative Choices",
                            ],
                        },
                    ],
                },
                {
                    id: "mental-ability",
                    label: "General Mental Ability",
                    topics: [
                        {
                            id: "ga",
                            label: "Mental Ability",
                            subtopics: [
                                "Direction Sense",
                                "Blood Relations",
                                "Ranking & Ordering",
                                "Calendar & Clocks",
                            ],
                        },
                    ],
                },
                {
                    id: "numeracy",
                    label: "Basic Numeracy (Class X level)",
                    topics: [
                        {
                            id: "arithmetic",
                            label: "Arithmetic",
                            subtopics: [
                                "Numbers",
                                "Percentage",
                                "Ratio & Proportion",
                                "Profit & Loss",
                                "Time, Speed & Distance",
                                "Time & Work",
                                "Averages",
                                "Mensuration",
                            ],
                        },
                    ],
                },
                {
                    id: "di",
                    label: "Data Interpretation (Class X level)",
                    topics: [
                        {
                            id: "di-charts",
                            label: "Charts & Graphs",
                            subtopics: [
                                "Tables",
                                "Bar Graphs",
                                "Line Graphs",
                                "Pie Charts",
                                "Data Sufficiency",
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

export const MAINS_SYLLABUS = {
    id: "mains",
    label: "Mains",
    papers: [
        {
            id: "essay",
            label: "Paper I — Essay",
            marks: 250,
            duration: "3 hours",
            description:
                "Two essays of 1000–1200 words each, on diverse themes.",
            sections: [
                {
                    id: "essay-themes",
                    label: "Common Essay Themes",
                    topics: [
                        {
                            id: "philosophical",
                            label: "Philosophical / Abstract",
                            subtopics: [
                                "Values & Ethics in Life",
                                "Truth & Beauty",
                                "Happiness & Success",
                            ],
                        },
                        {
                            id: "social",
                            label: "Social & Cultural",
                            subtopics: [
                                "Gender, Caste, Class",
                                "Education & Youth",
                                "Tradition vs Modernity",
                            ],
                        },
                        {
                            id: "polity-eco",
                            label: "Polity, Governance & Economy",
                            subtopics: [
                                "Democracy & Federalism",
                                "Economic Reforms",
                                "Globalisation",
                            ],
                        },
                        {
                            id: "sci-env",
                            label: "Science, Tech & Environment",
                            subtopics: [
                                "Technology & Society",
                                "Climate & Sustainability",
                            ],
                        },
                        {
                            id: "international",
                            label: "International Affairs",
                            subtopics: [
                                "Geopolitics",
                                "India's Soft Power",
                            ],
                        },
                    ],
                },
            ],
        },
        {
            id: "gs1",
            label: "Paper II — GS I",
            marks: 250,
            duration: "3 hours",
            description:
                "Indian Heritage and Culture, History and Geography of the World and Society.",
            sections: [
                {
                    id: "culture",
                    label: "Indian Heritage & Culture",
                    topics: [
                        {
                            id: "art-forms",
                            label: "Art Forms, Literature & Architecture",
                            subtopics: [
                                "Ancient Architecture",
                                "Medieval Architecture",
                                "Indian Paintings & Sculpture",
                                "Performing Arts (Dance, Music, Theatre)",
                                "Sanskrit & Regional Literature",
                            ],
                        },
                    ],
                },
                {
                    id: "modern-history",
                    label: "Modern Indian History",
                    topics: [
                        {
                            id: "freedom-struggle",
                            label: "Freedom Struggle",
                            subtopics: [
                                "Significant events from mid-18th century",
                                "Stages & Contributors",
                                "Post-Independence Consolidation",
                            ],
                        },
                    ],
                },
                {
                    id: "world-history",
                    label: "World History (18th century onwards)",
                    topics: [
                        {
                            id: "events",
                            label: "Major Events",
                            subtopics: [
                                "Industrial Revolution",
                                "World Wars",
                                "Colonisation & Decolonisation",
                                "Political Philosophies (Capitalism, Socialism, Communism)",
                                "Redrawing of National Boundaries",
                            ],
                        },
                    ],
                },
                {
                    id: "society",
                    label: "Indian Society",
                    topics: [
                        {
                            id: "features",
                            label: "Salient Features",
                            subtopics: [
                                "Diversity of India",
                                "Role of Women & Women's Organisation",
                                "Population & Associated Issues",
                                "Poverty & Developmental Issues",
                                "Urbanisation, Problems & Remedies",
                            ],
                        },
                        {
                            id: "social-empowerment",
                            label: "Social Empowerment",
                            subtopics: [
                                "Communalism, Regionalism, Secularism",
                                "Effects of Globalisation on Indian Society",
                            ],
                        },
                    ],
                },
                {
                    id: "world-geo",
                    label: "Geography",
                    topics: [
                        {
                            id: "physical-geo",
                            label: "Physical Geography",
                            subtopics: [
                                "Salient Features of World",
                                "Distribution of Key Natural Resources",
                                "Factors Affecting Industry Location",
                            ],
                        },
                        {
                            id: "geo-phenomena",
                            label: "Geographical Phenomena",
                            subtopics: [
                                "Earthquakes, Tsunamis, Cyclones",
                                "Volcanic Activity",
                                "Changes in Critical Geographical Features",
                            ],
                        },
                    ],
                },
            ],
        },
        {
            id: "gs2",
            label: "Paper III — GS II",
            marks: 250,
            duration: "3 hours",
            description:
                "Governance, Constitution, Polity, Social Justice and International Relations.",
            sections: [
                {
                    id: "constitution",
                    label: "Indian Constitution & Polity",
                    topics: [
                        {
                            id: "framework",
                            label: "Constitutional Framework",
                            subtopics: [
                                "Historical Underpinnings",
                                "Evolution, Features, Amendments",
                                "Significant Provisions & Basic Structure",
                            ],
                        },
                        {
                            id: "functions",
                            label: "Functions & Responsibilities",
                            subtopics: [
                                "Union & States",
                                "Federal Structure",
                                "Devolution of Powers & Finances to Local Levels",
                                "Separation of Powers between Organs",
                            ],
                        },
                    ],
                },
                {
                    id: "governance",
                    label: "Governance & Public Policy",
                    topics: [
                        {
                            id: "public-policy",
                            label: "Public Policy & Welfare",
                            subtopics: [
                                "Government Schemes for Vulnerable Sections",
                                "Issues in Health, Education, Human Resources",
                                "Welfare of SCs, STs, Minorities, Disabled",
                                "Role of NGOs, SHGs, Charities",
                            ],
                        },
                        {
                            id: "transparency",
                            label: "Transparency & Accountability",
                            subtopics: [
                                "RTI",
                                "Citizen Charters",
                                "Service Delivery Mechanisms",
                                "E-Governance",
                            ],
                        },
                    ],
                },
                {
                    id: "ir",
                    label: "International Relations",
                    topics: [
                        {
                            id: "india-world",
                            label: "India & the World",
                            subtopics: [
                                "Bilateral, Regional & Global Groupings",
                                "Effect of Developed/Developing Country Policies",
                                "Indian Diaspora",
                                "Important International Institutions",
                            ],
                        },
                    ],
                },
            ],
        },
        {
            id: "gs3",
            label: "Paper IV — GS III",
            marks: 250,
            duration: "3 hours",
            description:
                "Technology, Economic Development, Bio-diversity, Environment, Security and Disaster Management.",
            sections: [
                {
                    id: "economy",
                    label: "Indian Economy",
                    topics: [
                        {
                            id: "planning",
                            label: "Planning, Growth, Resource Mobilisation",
                            subtopics: [
                                "Inclusive Growth",
                                "Government Budgeting",
                                "Effects of Liberalisation",
                            ],
                        },
                        {
                            id: "agriculture",
                            label: "Agriculture",
                            subtopics: [
                                "Major Crops & Cropping Patterns",
                                "Irrigation Systems",
                                "Issues of Buffer Stocks & Food Security",
                                "Food Processing & Related Industries",
                                "Land Reforms",
                            ],
                        },
                        {
                            id: "infrastructure",
                            label: "Infrastructure",
                            subtopics: [
                                "Energy, Ports, Roads, Airports, Railways",
                                "Investment Models",
                            ],
                        },
                    ],
                },
                {
                    id: "sci-tech",
                    label: "Science & Technology",
                    topics: [
                        {
                            id: "developments",
                            label: "Developments & Applications",
                            subtopics: [
                                "Awareness in IT, Space, Computers, Robotics, Nano-tech, Biotech",
                                "Indigenisation of Technology",
                                "IPR Issues",
                            ],
                        },
                    ],
                },
                {
                    id: "environment",
                    label: "Environment & Bio-diversity",
                    topics: [
                        {
                            id: "conservation",
                            label: "Conservation & EIA",
                            subtopics: [
                                "Environmental Pollution & Degradation",
                                "Environmental Impact Assessment",
                                "Climate Change",
                            ],
                        },
                    ],
                },
                {
                    id: "disaster",
                    label: "Disaster Management",
                    topics: [
                        {
                            id: "dm",
                            label: "DM Framework",
                            subtopics: [
                                "Types of Disasters",
                                "Mitigation & Response",
                                "Institutional Mechanisms",
                            ],
                        },
                    ],
                },
                {
                    id: "security",
                    label: "Internal Security",
                    topics: [
                        {
                            id: "challenges",
                            label: "Security Challenges",
                            subtopics: [
                                "Linkages between Development & Extremism",
                                "Role of External State & Non-state Actors",
                                "Cyber Security",
                                "Money Laundering",
                                "Border Management",
                                "Security Forces & Agencies",
                            ],
                        },
                    ],
                },
            ],
        },
        {
            id: "gs4",
            label: "Paper V — GS IV (Ethics)",
            marks: 250,
            duration: "3 hours",
            description:
                "Ethics, Integrity and Aptitude. Includes case studies.",
            sections: [
                {
                    id: "ethics-theory",
                    label: "Theory",
                    topics: [
                        {
                            id: "essence",
                            label: "Ethics & Human Interface",
                            subtopics: [
                                "Essence, Determinants, Consequences",
                                "Dimensions of Ethics",
                                "Ethics in Private & Public Relationships",
                            ],
                        },
                        {
                            id: "attitude",
                            label: "Attitude",
                            subtopics: [
                                "Content, Structure, Function",
                                "Influence & Relation with Thought & Behaviour",
                                "Moral & Political Attitudes",
                            ],
                        },
                        {
                            id: "aptitude",
                            label: "Aptitude & Foundational Values",
                            subtopics: [
                                "Integrity, Impartiality, Non-partisanship",
                                "Objectivity, Dedication to Public Service",
                                "Empathy, Tolerance, Compassion",
                            ],
                        },
                        {
                            id: "ei",
                            label: "Emotional Intelligence",
                            subtopics: [
                                "Concepts & Utilities",
                                "Application in Administration",
                            ],
                        },
                        {
                            id: "thinkers",
                            label: "Moral Thinkers & Philosophers",
                            subtopics: [
                                "Indian Thinkers",
                                "Western Thinkers",
                            ],
                        },
                    ],
                },
                {
                    id: "ethics-application",
                    label: "Application",
                    topics: [
                        {
                            id: "public-admin",
                            label: "Public/Civil Service Values",
                            subtopics: [
                                "Status & Problems",
                                "Ethical Concerns in Public Institutions",
                                "Laws, Rules, Regulations as Sources of Ethical Guidance",
                                "Accountability & Governance",
                                "Corporate Governance",
                            ],
                        },
                        {
                            id: "probity",
                            label: "Probity in Governance",
                            subtopics: [
                                "Concept of Public Service",
                                "Philosophical Basis",
                                "Information Sharing & Transparency",
                                "Right to Information",
                                "Code of Ethics / Conduct",
                                "Citizen's Charters",
                                "Work Culture",
                                "Quality of Service Delivery",
                                "Utilisation of Public Funds",
                                "Challenges of Corruption",
                            ],
                        },
                        {
                            id: "case-studies",
                            label: "Case Studies",
                            subtopics: ["Case Studies on Above Issues"],
                        },
                    ],
                },
            ],
        },
        {
            id: "lang-a",
            label: "Paper A — Indian Language (Qualifying)",
            marks: 300,
            duration: "3 hours",
            description:
                "Qualifying paper — 25% required. Any Indian language from 8th Schedule.",
            sections: [
                {
                    id: "lang-a-format",
                    label: "Paper Format",
                    topics: [
                        {
                            id: "components",
                            label: "Components",
                            subtopics: [
                                "Comprehension of Given Passages",
                                "Précis Writing",
                                "Usage & Vocabulary",
                                "Short Essays",
                                "Translation: English ↔ Indian Language",
                            ],
                        },
                    ],
                },
            ],
        },
        {
            id: "lang-b",
            label: "Paper B — English (Qualifying)",
            marks: 300,
            duration: "3 hours",
            description: "Qualifying paper — 25% required.",
            sections: [
                {
                    id: "lang-b-format",
                    label: "Paper Format",
                    topics: [
                        {
                            id: "components",
                            label: "Components",
                            subtopics: [
                                "Comprehension of Given Passages",
                                "Précis Writing",
                                "Usage & Vocabulary",
                                "Short Essays",
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

// All UPSC Optional papers (26 total) — Mains Papers VI & VII
export const OPTIONAL_PAPERS = [
    { id: "agriculture", label: "Agriculture" },
    { id: "animal-husbandry", label: "Animal Husbandry & Veterinary Science" },
    { id: "anthropology", label: "Anthropology" },
    { id: "botany", label: "Botany" },
    { id: "chemistry", label: "Chemistry" },
    { id: "civil-engineering", label: "Civil Engineering" },
    { id: "commerce", label: "Commerce & Accountancy" },
    { id: "economics", label: "Economics" },
    { id: "electrical-engineering", label: "Electrical Engineering" },
    { id: "geography", label: "Geography" },
    { id: "geology", label: "Geology" },
    { id: "history", label: "History" },
    { id: "law", label: "Law" },
    { id: "management", label: "Management" },
    { id: "mathematics", label: "Mathematics" },
    { id: "mechanical-engineering", label: "Mechanical Engineering" },
    { id: "medical-science", label: "Medical Science" },
    { id: "philosophy", label: "Philosophy" },
    { id: "physics", label: "Physics" },
    { id: "political-science", label: "Political Science & IR (PSIR)" },
    { id: "psychology", label: "Psychology" },
    { id: "public-administration", label: "Public Administration" },
    { id: "sociology", label: "Sociology" },
    { id: "statistics", label: "Statistics" },
    { id: "zoology", label: "Zoology" },
    {
        id: "literature",
        label: "Literature of any one language",
        note: "Assamese, Bengali, Bodo, Dogri, English, Gujarati, Hindi, Kannada, Kashmiri, Konkani, Maithili, Malayalam, Manipuri, Marathi, Nepali, Odia, Punjabi, Sanskrit, Santhali, Sindhi, Tamil, Telugu, Urdu",
    },
];

// Convenience export
export const ALL_SYLLABUS = {
    prelims: PRELIMS_SYLLABUS,
    mains: MAINS_SYLLABUS,
    optionals: OPTIONAL_PAPERS,
};

// Build flat list for fuzzy search
export function buildSearchIndex() {
    const items = [];
    const walk = (examId, examLabel, paper, section, topic, subtopic) => {
        items.push({
            examId,
            examLabel,
            paperId: paper.id,
            paperLabel: paper.label,
            sectionId: section?.id || null,
            sectionLabel: section?.label || null,
            topicId: topic?.id || null,
            topicLabel: topic?.label || null,
            subtopic: subtopic || null,
            text: subtopic || topic?.label || section?.label || paper.label,
            breadcrumb: [
                examLabel,
                paper.label,
                section?.label,
                topic?.label,
                subtopic,
            ]
                .filter(Boolean)
                .join(" › "),
        });
    };

    [PRELIMS_SYLLABUS, MAINS_SYLLABUS].forEach((exam) => {
        exam.papers.forEach((paper) => {
            paper.sections.forEach((section) => {
                section.topics.forEach((topic) => {
                    walk(exam.id, exam.label, paper, section, topic, null);
                    (topic.subtopics || []).forEach((s) =>
                        walk(exam.id, exam.label, paper, section, topic, s)
                    );
                });
            });
        });
    });
    return items;
}