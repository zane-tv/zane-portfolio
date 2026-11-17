import type { PortfolioConfig } from "@/types/portfolio";

/**
 * Single typed source of truth for Trương Văn Tiến — Zane (@zane-tv).
 * Synthesized from TruongVanTien_Fullstack.tex & https://github.com/zane-tv/zane-tv.
 */
export const portfolioConfig: PortfolioConfig = {
  identity: {
    name: "Zane",
    fullName: "Trương Văn Tiến",
    handle: "@zane-tv",
    monogram: "ZT",
    greeting: "HELLO, I'M",
    heritageTagline: "Trống Đồng Đông Sơn × Creative Systems Engineering",
    yearsExperience: "~4 YRS PROD",
    globalMarkets: ["Japan", "Germany", "Sweden"],
    spokenLanguages: "Vietnamese · English · Japanese (~JLPT N4)",
    titles: [
      "Full-Stack Software Engineer",
      "AI & Agent Systems Engineer",
      "Data & Lakehouse Engineer",
      "DevOps & Cloud Architect",
      "Creative Tool Builder",
    ],
    introLines: [
      "I build products that solve real problems,",
      "ship them early, then make them perfect.",
    ],
    latelyNote:
      "Lately: architecting Daito's manufacturing platform (Japan), medallion PySpark lakehouses on Microsoft Fabric, a local-first WebGPU OCR extension, holdframe motion skills, and interactive 9:16 TikTok Live stages.",
    biography:
      "Full-stack software engineer (Trương Văn Tiến) in Ho Chi Minh City with nearly 4 years delivering production web, AI, and data platforms across Japan, Germany, and Sweden — alongside high-craft open-source developer tools.",
    location: "Ho Chi Minh City, Vietnam",
    coordinates: "10.8231° N · 106.6297° E",
    primaryStack: "TypeScript · Go · Python · PHP/Laravel · Next.js · NestJS · PySpark",
    stackList: [
      "TypeScript",
      "React / Next.js",
      "Vue.js",
      "Node.js / NestJS",
      "Go / Wails",
      "PHP / Laravel",
      "Python / PySpark",
      "Microsoft Fabric",
      "Delta Lake",
      "PostgreSQL / MySQL",
      "MongoDB",
      "AWS / Docker",
    ],
    portrait: {
      src: "/images/portrait.webp",
      alt: "Portrait of Trương Văn Tiến — Zane (@zane-tv) framed within an animated Đông Sơn bronze drum halo",
      isPlaceholder: false,
      replacementNote: "Replace /public/images/portrait.webp with any square WebP portrait.",
    },
    availability:
      "Available for ambitious full-stack, AI/agent & data-platform engineering — Global & Vietnam",
  },

  links: {
    github: "https://github.com/zane-tv",
    linkedin: "https://www.linkedin.com/in/zane-tv",
    email: "tientv.63.work@gmail.com",
    resumeUrl: "/TruongVanTien_Fullstack.pdf",
  },

  github: {
    username: process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? "zane-tv",
    ignoredLanguages: ["Smali", "HTML", "CSS", "MDX"],
    topLanguagesCount: 5,
  },

  expertise: {
    eyebrow: "02 // WHAT I DO · NGŨ HÀNH KỸ THUẬT",
    heading: "Five disciplines forged across global production & open source.",
    subheading:
      "Nearly four years shipping production software for Japan, Sweden, and Germany — moving seamlessly from reactive interfaces and NestJS/Laravel cores to Fabric lakehouses and native Go/WebGPU tools.",
    categories: [
      {
        id: "fullstack",
        index: "I",
        elementBadge: "KIM // ARCHITECTURE",
        title: "Full-Stack Systems",
        vietnameseLabel: "Kiến Trúc Web Toàn Diện",
        description:
          "End-to-end production platforms for enterprise manufacturing, SaaS, fin-tech, and multinational B2B commerce — engineered for reliability, clean domain boundaries, and crisp UX.",
        stackLines: ["React · Next.js · Vue.js · Tailwind", "NestJS · Laravel · Spring Boot · SQL"],
        capabilities: ["Enterprise SaaS", "Shop-Floor Scheduling", "Multilingual B2B", "Real-Time RPC"],
        motionStyle: "architectural-planes",
      },
      {
        id: "ai",
        index: "II",
        elementBadge: "HỎA // INTELLIGENCE",
        title: "AI & Agent Engineering",
        vietnameseLabel: "Trí Tuệ Nhân Tạo & Đa Tác Tử",
        description:
          "Production OpenAI financial & HR automation, coding-agent skill verification harnesses, zero-downtime multi-provider OAuth quota routers, and local-first ONNX/WebGPU inference.",
        stackLines: ["OpenAI API · Agents · MCP · TUI", "ONNX · WebGPU · ZeroTTS"],
        capabilities: ["AI Financial Synthesis", "Multi-AI Quota Routing", "On-Device WebGPU OCR", "Pixel-Diff QA"],
        motionStyle: "neural-constellation",
      },
      {
        id: "data",
        index: "III",
        elementBadge: "THỦY // LAKEHOUSE",
        title: "Data & Lakehouse",
        vietnameseLabel: "Kỹ Thuật Dữ Liệu Medallion",
        description:
          "Metadata-driven medallion ETL/ELT architectures (Landing → Raw → Silver → Gold) in Microsoft Fabric & PySpark, watermark ingestion, quarantine lineage, and executive Power BI star schemas.",
        stackLines: ["Microsoft Fabric · PySpark · Spark SQL", "Delta Lake · T-SQL · SuiteQL · Power BI"],
        capabilities: ["Medallion ETL/ELT", "Watermark Deduplication", "Fabric Star Schemas", "Legacy Migration"],
        motionStyle: "laminar-strata",
      },
      {
        id: "devops",
        index: "IV",
        elementBadge: "MỘC // INFRASTRUCTURE",
        title: "Cloud & DevOps",
        vietnameseLabel: "Hạ Tầng Đám Mây & Vận Hành",
        description:
          "Containerized Linux & Windows automation, AWS production hosting, scheduled batch ingestion pipelines, security hardening, and zero-downtime CI/CD delivery.",
        stackLines: ["Docker · AWS · Linux · PowerShell", "GitHub Actions · GitLab CI · Vercel"],
        capabilities: ["AWS Production Ops", "Automated Batch Pipelines", "Container Orchestration", "Security & Perf"],
        motionStyle: "orbital-cluster",
      },
      {
        id: "devtools",
        index: "V",
        elementBadge: "THỔ // CRAFTSMANSHIP",
        title: "Developer Tools",
        vietnameseLabel: "Công Cụ Chuyên Sâu Cho Kỹ Sư",
        description:
          "Native Go + Wails macOS desktop clients shipped on Homebrew, terminal UI plugins for Claude Code / Codex / OpenCode, and programmatic motion-graphics video DSLs.",
        stackLines: ["Go · Wails · Bun · TypeScript", "Desktop Workbenches · Browser Extensions"],
        capabilities: ["Homebrew Native Binaries", "Polyglot DB Workbenches", "OpenCode Plugins", "Motion DSL"],
        motionStyle: "vernier-caliper",
      },
    ],
  },

  projects: {
    eyebrow: "03 // SELECTED ARTIFACTS · TÁC PHẨM TIÊU BIỂU",
    heading: "Open-source flagship creations & global enterprise systems.",
    subheading:
      "Viral cultural stages, native developer workbenches, and AI harnesses at github.com/zane-tv — paired with mission-critical platforms delivered across Japan, Sweden, and Germany.",
    items: [
      {
        slug: "chua-linh-ung-online",
        index: "01",
        repo: "tiktok-live-temple-rpc",
        title: "Chùa Linh Ứng Online",
        subtitle: "Interactive 9:16 TikTok Live Cultural Stage",
        description:
          "A real-time 9:16 Buddhist temple running live on TikTok. Thousands of viewers light incense, strike the bronze bell, and draw fortune sticks synchronously through live comments, likes, and gifts.",
        architectureNote: "Bun event loop · Low-latency JSON-RPC bridge · ZeroTTS voice synthesis",
        stack: ["Bun", "JSON-RPC", "ZeroTTS", "JavaScript"],
        thumbnail: "/images/projects/chua-linh-ung.webp",
        thumbnailAlt: "Chùa Linh Ứng Online 9:16 interactive temple stage with Đông Sơn sun and incense streams",
        githubUrl: "https://github.com/zane-tv/tiktok-live-temple-rpc",
        featured: true,
        year: "2026",
        accentMetric: "235 ★ · 355 Forks on GitHub",
      },
      {
        slug: "soft-db",
        index: "02",
        repo: "soft-db",
        title: "SoftDB",
        subtitle: "Polyglot Desktop Database Client + Schema-Aware AI",
        description:
          "Native desktop workbench unifying PostgreSQL, MySQL, SQLite, MongoDB, and Redis with an embedded schema-grounded AI SQL copilot and interactive ER explorer. Distributed natively via Homebrew.",
        architectureNote: "Go + Wails native binary · 5-engine driver pool · Ships via `brew install`",
        stack: ["Go", "Wails", "React", "TypeScript", "SQL"],
        thumbnail: "/images/projects/soft-db.webp",
        thumbnailAlt: "SoftDB polyglot database schema explorer and ER graph workbench",
        githubUrl: "https://github.com/zane-tv/soft-db",
        liveUrl: "https://github.com/zane-tv/homebrew-softdb",
        featured: true,
        year: "2026",
        accentMetric: "14 ★ · Ships on Homebrew",
      },
      {
        slug: "opencode-multi-ai",
        index: "03",
        repo: "opencode-multi-ai",
        title: "opencode-multi-ai",
        subtitle: "Multi-Account AI Quota Pool & Tabbed TUI",
        description:
          "One OpenCode plugin that pools SuperGrok, ChatGPT, and Kiro accounts, rotates credentials with zero stream interruption the instant a quota runs dry, and visualizes live burn rates in the TUI.",
        architectureNote: "Zero-downtime OAuth rotation · Multi-provider state machine · Live TUI telemetry",
        stack: ["TypeScript", "OpenCode", "OAuth", "TUI"],
        thumbnail: "/images/projects/opencode-multi-ai.webp",
        thumbnailAlt: "opencode-multi-ai concentric quota rotation dial across SuperGrok, ChatGPT, and Kiro",
        githubUrl: "https://github.com/zane-tv/opencode-multi-ai",
        featured: true,
        year: "2026",
        accentMetric: "0ms Failover Quota Router",
      },
      {
        slug: "agent-skills-holdframe",
        index: "04",
        repo: "agent-skills",
        title: "agent-skills & holdframe",
        subtitle: "Autonomous Verification & Motion-Graphics Agent Tooling",
        description:
          "Installable skills for Claude Code, Codex, and OpenCode: Figma-to-code loops with objective Playwright pixel-diff checks, security audits for fresh clones, and programmatic 60fps motion-graphics video rendering.",
        architectureNote: "Playwright pixel-diff verification · Static security audit · Motion timeline DSL",
        stack: ["Claude Code", "Codex", "OpenCode", "TypeScript"],
        thumbnail: "/images/projects/agent-skills.webp",
        thumbnailAlt: "agent-skills pixel-diff verification loupe comparing Figma design and rendered DOM",
        githubUrl: "https://github.com/zane-tv/agent-skills",
        liveUrl: "https://github.com/zane-tv/holdframe",
        featured: true,
        year: "2026",
        accentMetric: "Pixel-Diff & Motion Video DSL",
      },
    ],
    enterpriseEyebrow: "INTERNATIONAL PRODUCTION DOSSIER // JAPAN · SWEDEN · GERMANY",
    enterpriseHeading: "Commercial & Enterprise Systems Delivered Across Global Markets",
    enterpriseDossier: [
      {
        code: "PROD // 01",
        region: "JAPAN",
        period: "06/2026 — PRESENT",
        title: "Daito Manufactory Manager System",
        organization: "ZEN-S · Industrial Manufacturing",
        summary:
          "Full-stack manufacturing scheduling, shop-floor progress tracking, and daily delay monitoring platform with historical data migration dating back to 2021.",
        highlights: [
          "Migrated multi-year TECHBK legacy manufacturing exports (2021+) into normalized relational schemas.",
          "Automated EUC CSV/XLSX ingestion with deduplication, batch updates & watermark overwrite guards.",
        ],
        stack: ["TypeScript", "NestJS", "React", "TypeORM", "MySQL", "Docker"],
      },
      {
        code: "PROD // 02",
        region: "ENTERPRISE BI",
        period: "06/2025 — 05/2026",
        title: "Alpha Bidding Intelligence Lakehouse",
        organization: "ZEN-S · Data Engineering",
        summary:
          "Medallion Lakehouse architecture (Landing → Raw → Silver → Gold) on Microsoft Fabric consolidating NetSuite SuiteQL and HCSS operational APIs for executive bidding intelligence.",
        highlights: [
          "Metadata-driven PySpark incremental pipelines with quarantine handling, data validation & lineage.",
          "Engineered Delta Lake & T-SQL Fabric Warehouse star schemas powering executive Power BI models.",
        ],
        stack: ["Microsoft Fabric", "PySpark", "Delta Lake", "T-SQL", "NetSuite SuiteQL", "Power BI"],
      },
      {
        code: "PROD // 03",
        region: "SWEDEN",
        period: "09/2024 — 05/2025",
        title: "EQL Global AI Financial Platform",
        organization: "EQL Global",
        summary:
          "AI-integrated financial intelligence web platform automating multi-source financial report & press-release collection, executive synthesis, and interactive visualizations.",
        highlights: [
          "Built responsive Next.js/React interfaces & Node.js ingestion pipelines backed by MongoDB & AWS.",
          "Integrated OpenAI synthesis workflows turning dense financial disclosures into structured insights.",
        ],
        stack: ["Next.js", "React", "Node.js", "MongoDB", "AWS", "OpenAI API"],
        liveUrl: "https://eqlglobal.com/",
      },
      {
        code: "PROD // 04",
        region: "JAPAN",
        period: "03/2024 — 12/2025",
        title: "JSaaS Workforce & AI Automation Suite",
        organization: "ZEN-S · JMatch Japan",
        summary:
          "Japan-market B2B SaaS platform elevating workforce productivity, HR workflows, and sales operations through AI-assisted decision automation and Robopay billing.",
        highlights: [
          "Delivered customer & admin portals in Vue.js + Laravel on AWS with strict Japanese privacy standards.",
          "Embedded OpenAI task automation and optimized query/page-load performance at production scale.",
        ],
        stack: ["Vue.js", "Laravel", "MySQL", "AWS", "Robopay", "OpenAI API"],
        liveUrl: "https://www.jmatch.jp/jsaas/",
      },
    ],
  },

  experience: {
    eyebrow: "05 // JOURNEY & HONORS · HÀNH TRÌNH & BẢNG VÀNG",
    heading: "From National Computer Olympiad laureate to shipping across global markets.",
    subheading:
      "Nearly four years of production engineering for Japan, Sweden, and Germany — grounded in formal AI studies at VNU-HCM UIT and national academic honors.",
    milestones: [
      {
        id: "zens-software-data-engineer",
        era: "03/2024 — PRESENT",
        watermarkYear: "2026",
        role: "Software & Data Platform Engineer",
        organization: "ZEN-S",
        location: "Ho Chi Minh City, Vietnam",
        regionTag: "JAPAN & ENTERPRISE",
        summary:
          "Leading full-stack web architecture and enterprise medallion lakehouse engineering across flagship industrial, financial bidding, and Japanese B2B SaaS systems.",
        achievements: [
          "Daito Manufactory Manager (Japan): Built React + NestJS/TypeORM shop-floor scheduling & delay monitoring; migrated TECHBK records (2021+) with watermark-safe EUC CSV/XLSX batch ingestion.",
          "Alpha Bidding Intelligence: Architected Landing → Raw → Silver → Gold PySpark & Delta Lake pipelines on Microsoft Fabric unifying NetSuite SuiteQL & HCSS into Power BI star schemas.",
          "JSaaS (jmatch.jp/jsaas): Shipped Japan-facing HR & productivity SaaS using Vue.js, Laravel, AWS, Robopay, and OpenAI automation.",
        ],
        technologies: ["TypeScript", "NestJS", "React", "Vue.js", "Laravel", "Microsoft Fabric", "PySpark", "Delta Lake", "AWS"],
        motif: "crane",
      },
      {
        id: "open-source-ai-toolmaker",
        era: "2025 — PRESENT",
        watermarkYear: "OSS",
        role: "Independent Creator & AI Toolmaker",
        organization: "github.com/zane-tv · Open Source",
        location: "Vietnam",
        regionTag: "GLOBAL OSS · 400+ ★",
        summary:
          "Crafting viral real-time cultural stages, native desktop database clients, multi-provider AI quota routers, and local-first WebGPU developer extensions.",
        achievements: [
          "Created Chùa Linh Ứng Online (235+ ★, 355+ forks), transforming 9:16 TikTok Live streams into interactive cultural spaces via Bun, JSON-RPC & ZeroTTS.",
          "Shipped SoftDB natively on Homebrew (Go + Wails) — unifying PostgreSQL, MySQL, SQLite, MongoDB & Redis with schema-grounded AI assistance.",
          "Released opencode-multi-ai, agent-skills, holdframe, and WebGPU OCR extensions for autonomous coding & motion workflows.",
        ],
        technologies: ["Go", "Wails", "Bun", "WebGPU", "ONNX", "OpenCode", "ZeroTTS"],
        motif: "sun",
      },
      {
        id: "eql-global-sweden",
        era: "09/2024 — 05/2025",
        watermarkYear: "2025",
        role: "Full-Stack Web Developer",
        organization: "EQL Global",
        location: "Sweden (Remote)",
        regionTag: "SWEDEN · FINTECH AI",
        summary:
          "Engineered an AI-integrated financial analysis platform (eqlglobal.com) automating multi-source corporate disclosure ingestion and executive insight generation.",
        achievements: [
          "Built high-speed Next.js/React data visualization interfaces paired with Node.js, MongoDB, and AWS ingestion services.",
          "Integrated OpenAI pipelines to synthesize financial reports and press releases into structured investment intelligence.",
        ],
        technologies: ["Next.js", "React", "Node.js", "MongoDB", "AWS", "OpenAI API"],
        motif: "chain",
      },
      {
        id: "grainlogic-solekia-japan",
        era: "06/2023 — 02/2024",
        watermarkYear: "2024",
        role: "Front-End Engineer & Japan Exchange Fellow",
        organization: "GrainLogic (Germany) · Solekia / Fujitsu Group (Tokyo)",
        location: "Germany (Remote) & Tokyo, Japan",
        regionTag: "GERMANY & TOKYO",
        summary:
          "Delivered multinational wholesale B2B commerce for Germany after completing an engineering & cultural fellowship in Tokyo with Solekia (Fujitsu Group) and Freesia Group.",
        achievements: [
          "GrainLogic (08/2023–02/2024): Built multilingual Next.js, TypeScript & Tailwind vendor–buyer wholesale transaction workflows.",
          "Tokyo Exchange (06/2023–08/2023): Trained in Java, Spring Boot & PostgreSQL at Solekia (Fujitsu Group) and co-architected the trilingual (EN/VI/JA) Tokyo Metropolitan College of Industrial Technology site.",
        ],
        technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Java", "Spring Boot", "PostgreSQL", "MySQL"],
        motif: "comb",
      },
      {
        id: "thegoodguys-mobile-early-career",
        era: "07/2022 — 10/2022",
        watermarkYear: "2022",
        role: "React Native Mobile Developer Intern",
        organization: "THEGOODGUYS TECHNOLOGY",
        location: "Ho Chi Minh City, Vietnam",
        regionTag: "MOBILE & AGRITECH",
        summary:
          "Engineered cross-platform mobile field-tracking software powered by real-time QR scanning and Laravel APIs.",
        achievements: [
          "Digi Farmer (team of 6): Integrated real-time QR code scanning into a React Native mobile application managing agricultural tree-lot lifecycles.",
          "Collaborated with backend engineers on Laravel + MySQL API endpoints and responsive cross-device UX.",
        ],
        technologies: ["React Native", "Laravel", "MySQL", "REST API"],
        motif: "chain",
      },
    ],
    education: [
      {
        institution: "University of Information Technology — VNU-HCM (UIT)",
        period: "2026 — PRESENT",
        degree: "Bachelor of Artificial Intelligence",
        distinction: "VNU Ho Chi Minh City",
        detail:
          "Advancing formal foundations in machine learning, deep neural architectures, computer vision, and autonomous agentic systems.",
      },
      {
        institution: "Thu Duc College of Technology",
        period: "2020 — 2023",
        degree: "Information Technology (Japan Business & College Collaboration)",
        distinction: "Japan Industry Program",
        detail:
          "Completed a specialized software engineering & enterprise curriculum trained in direct collaboration with Japanese businesses and colleges.",
      },
    ],
    honors: [
      {
        year: "2022 & 2023",
        title: "2× Top 5 Outstanding Students of Ho Chi Minh City",
        issuer: "Ho Chi Minh City Municipal Distinction (Two Consecutive Years)",
        tier: "city",
      },
      {
        year: "2021",
        title: "Third Prize — Vietnam National Computer Olympiad",
        issuer: "Olympic Tin Học Sinh Viên Việt Nam",
        tier: "national",
      },
      {
        year: "2022",
        title: "“Star of January” National Award (Giải Thưởng Sao Tháng Giêng)",
        issuer: "Central Committee of Vietnam Students' Association",
        tier: "national",
      },
      {
        year: "2023",
        title: "Excellent Vocational Student National Award",
        issuer: "Ministry of Labor, Invalids and Social Affairs (Bộ LĐ-TB&XH)",
        tier: "national",
      },
      {
        year: "2022",
        title: "Second Prize — Website Design",
        issuer: "Outstanding Students' Skills Competition of Ho Chi Minh City",
        tier: "city",
      },
      {
        year: "2020 — 2023",
        title: "2× Distinctions for Outstanding Scientific Research",
        issuer: "Thu Duc College of Technology · Scientific Research Honors",
        tier: "academic",
      },
    ],
  },

  contact: {
    eyebrow: "06 // FINAL SCENE · START A DIALOGUE",
    headline: "Have a real problem worth solving? Let's ship it.",
    subheadline:
      "Reach out for full-stack product engineering, AI & agent infrastructure, Microsoft Fabric / PySpark lakehouses, or custom developer tools — from Ho Chi Minh City to the world.",
    closingMotto:
      "TRƯƠNG VĂN TIẾN · ZANE (@ZANE-TV) · ĐÔNG SƠN HERITAGE × FUTURE SYSTEMS · HCMC, VIETNAM",
  },

  seo: {
    title: "Zane — Trương Văn Tiến (@zane-tv) | Full-Stack, AI & Data Software Engineer",
    description:
      "Cinematic 3D Đông Sơn portfolio of Trương Văn Tiến — Zane (@zane-tv, Ho Chi Minh City): Full-Stack, AI, Data & DevOps Engineer delivering across Japan, Sweden, and Germany.",
    siteUrl: "https://portfolio-mu-lilac-47.vercel.app",
    keywords: [
      "Trương Văn Tiến",
      "Truong Van Tien",
      "Zane",
      "zane-tv",
      "Full-stack engineer Ho Chi Minh City",
      "AI engineer Vietnam",
      "Data engineer PySpark Microsoft Fabric",
      "SoftDB",
      "Chùa Linh Ứng Online",
      "Đông Sơn 3D Portfolio",
    ],
    ogImage: "/og-image.png",
  },
};
