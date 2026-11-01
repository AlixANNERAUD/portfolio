/** Bilingual, public-safe experience highlights for the portfolio timeline. */
import type { Label, Localized } from "./types.ts";

export type ExperienceGroup = "professional" | "education";

export interface Experience {
  id: string;
  group: ExperienceGroup;
  /** Organization name; localized only when it is not a proper noun. */
  company: Label;
  companyUrl?: string;
  monogram: string;
  /**
   * Self-hosted path under /images/logos/, credited in the legal notice.
   * Only shown alongside the organization name.
   */
  logo?: string;
  /** Logo whose artwork is intentionally white (on a dark card). */
  logoOnDark?: boolean;
  /** Brand colour behind the logo, when the organization's identity uses one. */
  logoBackground?: string;
  role: Localized;
  period: Localized;
  location: Localized;
  summary: Localized;
  highlights: readonly Localized[];
  technologies: readonly Label[];
  ongoing?: boolean;
  /** Shown on the homepage, in data order. */
  homepage?: true;
  /** Earlier milestone: hide its complete card until the section is expanded. */
  earlier?: boolean;
}

export const experiences: readonly Experience[] = [
  {
    id: "memo-bank",
    homepage: true,
    logo: "/images/logos/memo-bank.svg",
    logoOnDark: true,
    group: "professional",
    company: "Memo Bank",
    companyUrl: "https://memo.bank/",
    monogram: "M",
    role: { fr: "Ingénieur sécurité", en: "Security Engineer" },
    period: { fr: "Sept. 2026 – Août 2027", en: "Sep 2026 – Aug 2027" },
    location: { fr: "Paris, France", en: "Paris, France" },
    summary: {
      fr: "Ingénierie sécurité dans l’environnement d’une banque.",
      en: "Security engineering in a banking environment.",
    },
    highlights: [],
    technologies: [
      { en: "Security", fr: "Sécurité" },
      { en: "Software engineering", fr: "Génie logiciel" },
    ],
    ongoing: true,
  },
  {
    id: "linkt",
    homepage: true,
    logo: "/images/logos/linkt.svg",
    group: "professional",
    company: "Linkt",
    companyUrl: "https://linkt.fr/",
    monogram: "L",
    role: {
      fr: "Technicien réseau et télécoms",
      en: "Network & Telecom Technician",
    },
    period: { fr: "Déc. 2025 – Sept. 2026", en: "Dec 2025 – Sep 2026" },
    location: {
      fr: "Mont-Saint-Aignan, France",
      en: "Mont-Saint-Aignan, France",
    },
    summary: {
      fr: "Diagnostic d’incidents, exploitation réseau et automatisation des outils de support.",
      en: "Incident investigation, network operations and support-tool automation.",
    },
    highlights: [
      {
        fr: "Diagnostic des accès FTTH/FTTO, xDSL et 4G/5G, VPN MPLS et téléphonie SIP, en coordination avec les opérateurs.",
        en: "Investigated FTTH/FTTO, xDSL and 4G/5G connectivity, MPLS VPNs and SIP telephony alongside upstream operators.",
      },
      {
        fr: "Dépannage d’équipements Cisco, Juniper, MikroTik et Keenetic : routage, VLAN, DHCP et redondance.",
        en: "Troubleshot Cisco, Juniper, MikroTik and Keenetic equipment: routing, VLANs, DHCP and failover.",
      },
      {
        fr: "Création d’une extension Vue/WXT pour enrichir les tickets et accélérer les diagnostics.",
        en: "Built a Vue/WXT browser extension to enrich support tickets and streamline diagnostics.",
      },
    ],
    technologies: [
      { en: "Network L2/L3", fr: "Réseau L2/L3" },
      "MPLS",
      "VoIP",
      "Vue",
      "WXT",
    ],
  },
  {
    id: "amazon",
    homepage: true,
    logo: "/images/logos/amazon.svg",
    group: "professional",
    company: "Amazon",
    companyUrl: "https://www.amazon.jobs/",
    monogram: "a",
    role: {
      fr: "Stagiaire en ingénierie logicielle",
      en: "Software Engineering Intern",
    },
    period: { fr: "Mai – Août 2025", en: "May – Aug 2025" },
    location: { fr: "Madrid, Espagne", en: "Madrid, Spain" },
    summary: {
      fr: "Modernisation d’un outil interne d’investigation de contenus pour des équipes marketing.",
      en: "Modernized an internal content discovery and investigation tool for marketing teams.",
    },
    highlights: [
      {
        fr: "Amélioration des parcours utilisateurs et de la performance des recherches.",
        en: "Improved user-facing workflows and search performance.",
      },
      {
        fr: "Extension de la prise en charge de plusieurs régions, sur une pile Java, Python, TypeScript et AWS.",
        en: "Extended multi-region support across a Java, Python, TypeScript and AWS stack.",
      },
    ],
    technologies: ["Java", "Python", "React", "AWS", "Redshift"],
  },
  {
    id: "nyu",
    homepage: true,
    logo: "/images/logos/nyu.svg",
    group: "professional",
    company: "New York University",
    companyUrl: "https://www.nyu.edu/",
    monogram: "NYU",
    role: { fr: "Stagiaire en recherche", en: "Research Intern" },
    period: { fr: "Juin – Août 2024", en: "Jun – Aug 2024" },
    location: { fr: "New York, États-Unis", en: "New York, USA" },
    summary: {
      fr: "Recherche sur la localisation de sources de gaz à partir de réseaux de capteurs.",
      en: "Research on gas source localization with distributed sensor networks.",
    },
    highlights: [
      {
        fr: "Simulation de la diffusion et exploration d’algorithmes de localisation en présence de bruit.",
        en: "Simulated diffusion and explored source-localization algorithms under noisy measurements.",
      },
      {
        fr: "Prototypage d’acquisition et analyse statistique des données.",
        en: "Prototyped data acquisition and statistical analysis.",
      },
    ],
    technologies: [
      "Python",
      "C++",
      "Simulation",
      { en: "Signal processing", fr: "Traitement du signal" },
    ],
  },
  {
    id: "insa-relations",
    earlier: true,
    logo: "/images/logos/insa-rouen-normandie.webp",
    group: "professional",
    company: "INSA Rouen Normandie",
    companyUrl: "https://www.insa-rouen.fr/",
    monogram: "IN",
    role: {
      fr: "Assistant aux relations entreprises",
      en: "Corporate Relations Assistant",
    },
    period: { fr: "2021–2024", en: "2021–2024" },
    location: { fr: "Rouen, France", en: "Rouen, France" },
    summary: {
      fr: "Gestion de données partenaires et appui aux campagnes de relations entreprises.",
      en: "Partner-data management and support for corporate-relations campaigns.",
    },
    highlights: [
      {
        fr: "Collecte, nettoyage et maintenance des données entreprises et anciens élèves.",
        en: "Collected, cleaned and maintained partner-company and alumni data.",
      },
      {
        fr: "Appui au suivi administratif et aux campagnes de taxe d’apprentissage.",
        en: "Supported administrative follow-up and apprenticeship-tax outreach.",
      },
    ],
    technologies: [
      { en: "Data management", fr: "Gestion de données" },
      { en: "Partner relations", fr: "Relations partenaires" },
    ],
  },
  {
    id: "therapic",
    logo: "/images/logos/becquerel.webp",
    group: "education",
    company: "INSA Rouen × Centre Henri Becquerel",
    companyUrl: "https://www.becquerel.fr/",
    monogram: "T",
    role: {
      fr: "Chef de projet / Product Owner, ThéraPIC",
      en: "Project Lead / Product Owner, ThéraPIC",
    },
    period: { fr: "2025", en: "2025" },
    location: { fr: "Rouen, France", en: "Rouen, France" },
    summary: {
      fr: "Projet d’ingénierie avec des pharmaciens cliniciens pour centraliser les données utiles à la validation pharmaceutique.",
      en: "Engineering project with clinical pharmacists to centralize information used for pharmaceutical prescription review.",
    },
    highlights: [
      {
        fr: "Coordination de l’équipe, recueil des besoins et pilotage des livrables.",
        en: "Coordinated the team, requirements and delivery milestones.",
      },
      {
        fr: "Architecture Django REST / Vue.js, environnement Docker, tests et CI.",
        en: "Developed a Django REST / Vue.js architecture with Docker, testing and CI.",
      },
    ],
    technologies: ["Django", "Vue", "TypeScript", "PostgreSQL", "Docker"],
  },
  {
    id: "insa-engineering",
    logo: "/images/logos/insa-rouen-normandie.webp",
    group: "education",
    company: "INSA Rouen Normandie",
    companyUrl: "https://www.insa-rouen.fr/",
    monogram: "IN",
    role: {
      fr: "Diplôme d’ingénieur, Informatique et technologies de l’information",
      en: "Engineering Degree, Computer Science and Information Technology",
    },
    period: { fr: "2021–2027", en: "2021–2027" },
    location: { fr: "Rouen, France", en: "Rouen, France" },
    summary: {
      fr: "Cycle ingénieur au département Informatique et technologies de l’information (ITI), après deux années de cycle préparatoire intégré (STPI) ; dernière année en alternance.",
      en: "Engineering cycle in the Computer Science and Information Technology (ITI) department, after the two-year integrated preparatory cycle (STPI); final year in work-study.",
    },
    highlights: [
      {
        fr: "Systèmes et logiciel : systèmes d’exploitation, algorithmique avancée et programmation C, introduction à la compilation, programmation avancée, UML et design patterns, bases de données, technologies web.",
        en: "Systems and software: operating systems, advanced algorithms and C programming, introduction to compilers, advanced programming, UML and design patterns, databases, web technologies.",
      },
      {
        fr: "Électronique et signal : électronique, capteurs, automatique, traitement du signal et des signaux aléatoires.",
        en: "Electronics and signals: electronics, sensors, control engineering, signal processing and random signals.",
      },
      {
        fr: "Données et IA : machine learning, apprentissage de représentations et deep learning, traitement d’images, théorie de l’information, big data (stockage et calcul distribués), optimisation, théorie des graphes et recherche opérationnelle.",
        en: "Data and AI: machine learning, representation and deep learning, image processing, information theory, big data (distributed storage and computing), optimization, graph theory and operations research.",
      },
      {
        fr: "Gestion de projet : conduite de grands projets informatiques, et direction du projet d’ingénieur ThéraPIC (management, communication, réalisation).",
        en: "Project management: managing large IT projects, and leading the ThéraPIC engineering project (management, communication, delivery).",
      },
    ],
    technologies: [
      { en: "Systems", fr: "Systèmes" },
      { en: "Embedded systems", fr: "Systèmes embarqués" },
      { en: "Machine learning", fr: "Machine learning" },
      { en: "Signal processing", fr: "Traitement du signal" },
      { en: "Software engineering", fr: "Génie logiciel" },
    ],
    ongoing: true,
  },
  // Earlier milestones remain first-class timeline entries, but show their
  // extended details on demand to keep the page focused on recent experience.
  {
    id: "renault-cleon",
    group: "professional",
    earlier: true,
    company: "Ampère Cléon",
    companyUrl: "https://www.renaultgroup.com/",
    monogram: "A",
    logo: "/images/logos/ampere.svg",
    role: {
      fr: "Stagiaire en production",
      en: "Production Intern",
    },
    period: { fr: "2022", en: "2022" },
    location: { fr: "Cléon, France", en: "Cléon, France" },
    summary: {
      fr: "Stage ouvrier d’un mois sur une ligne de production de rotors et de stators, à l’usine de Cléon (alors Renault, aujourd’hui Ampère).",
      en: "One-month production internship on a rotor and stator manufacturing line at the Cléon plant (then Renault, now part of Ampère).",
    },
    highlights: [
      {
        fr: "Immersion dans un environnement industriel de fabrication automobile.",
        en: "Gained first-hand exposure to an automotive manufacturing environment.",
      },
      {
        fr: "Découverte des contraintes et de l’organisation du travail sur une ligne de production.",
        en: "Observed the constraints and organization of work on a production line.",
      },
    ],
    technologies: [
      { en: "Industrial production", fr: "Production industrielle" },
    ],
  },
  {
    id: "guenola-sahut",
    group: "professional",
    earlier: true,
    company: "Guénola Sahut",
    companyUrl: "https://guenola-sahut.fr/",
    monogram: "GS",
    logo: "/images/logos/guenola-sahut.webp",
    logoBackground: "#88a2aa",
    role: {
      fr: "Assistant en communication",
      en: "Communication Assistant",
    },
    period: { fr: "2019", en: "2019" },
    location: { fr: "France", en: "France" },
    summary: {
      fr: "Expérience d’assistance en communication auprès de Guénola Sahut, artiste peintre.",
      en: "Early experience assisting the painter Guénola Sahut with communication work.",
    },
    highlights: [
      {
        fr: "Appui aux activités de communication et à leur organisation.",
        en: "Assisted with communication activities and their organization.",
      },
    ],
    technologies: ["Communication"],
  },
  {
    id: "baccalaureat",
    group: "education",
    earlier: true,
    company: "Institution Jean-Paul II",
    companyUrl: "https://www.institutionjeanpaul2.fr/",
    monogram: "JP2",
    logo: "/images/logos/jean-paul-2.webp",
    role: {
      fr: "Baccalauréat général, section européenne",
      en: "French General Baccalaureate, European Section",
    },
    period: { fr: "2021", en: "2021" },
    location: { fr: "Rouen, France", en: "Rouen, France" },
    summary: {
      fr: "Baccalauréat général de la réforme de 2020, avec les spécialités mathématiques et physique-chimie, en section européenne.",
      en: "General baccalaureate under the 2020 reform, with mathematics and physics-chemistry as specialties, in the European section.",
    },
    highlights: [
      {
        fr: "Spécialités : mathématiques et physique-chimie, plus sciences de la vie et de la Terre jusqu’en première.",
        en: "Specialties: mathematics and physics-chemistry, plus life and Earth sciences until the eleventh grade.",
      },
      {
        fr: "Option mathématiques expertes en terminale.",
        en: "Advanced mathematics option (mathématiques expertes) in the final year.",
      },
    ],
    technologies: [],
  },
  {
    id: "cambridge-b1",
    group: "education",
    earlier: true,
    company: "Cambridge English",
    companyUrl: "https://www.cambridgeenglish.org/",
    monogram: "B1",
    logo: "/images/logos/cambridge-english.webp",
    role: {
      fr: "Certification Cambridge B1 Preliminary",
      en: "Cambridge B1 Preliminary Certificate",
    },
    period: { fr: "2018", en: "2018" },
    location: { fr: "", en: "" },
    summary: {
      fr: "Certification d’anglais attestant le niveau B1.",
      en: "English-language certification at B1 level.",
    },
    highlights: [
      {
        fr: "Certification Cambridge English Preliminary obtenue en 2018.",
        en: "Cambridge English Preliminary certification earned in 2018.",
      },
    ],
    technologies: [{ en: "English · B1", fr: "Anglais · B1" }],
  },
];

/** Roles flagged `homepage`, in data order. */
export const homepageExperiences = experiences.filter(
  (entry) => entry.homepage,
);
