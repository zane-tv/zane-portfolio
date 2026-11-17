import { portfolioConfig } from "@/config/portfolio";
import type { PortfolioConfig } from "@/types/portfolio";
import type { Locale } from "@/store/localeStore";

export interface UiDictionary {
  nav: {
    disciplines: string;
    artifacts: string;
    telemetry: string;
    trajectory: string;
    dialogue: string;
    replayIntro: string;
    editionLabel: string;
    skipToMain: string;
    langSwitchAria: string;
  };
  hero: {
    skipIntro: string;
    sealTop: string;
    marketsPrefix: string;
    laureateBadge: string;
    activeLabPrefix: string;
    vietnamBadge: string;
    ctaExplore: string;
    ctaResume: string;
    ctaContact: string;
    scrollLabel: string;
    strikeHint: string;
    strikeTitle: string;
  };
  frieze: {
    rowOne: readonly string[];
    rowTwo: readonly string[];
  };
  projectsUi: {
    artifactPrefix: string;
    archPrefix: string;
    exploreSource: string;
    companionLink: string;
    livePlatform: string;
    inspectAriaPrefix: string;
  };
  telemetryUi: {
    eyebrow: string;
    heading: string;
    liveBannerPrefix: string;
    fallbackUnconfigured: string;
    fallbackRateLimited: string;
    fallbackUnavailable: string;
    stats: {
      publicRepos: string;
      starsEarned: string;
      repoForks: string;
      weeklyActivity: string;
    };
    dialTitle: string;
    dialHint: string;
    contributionSingular: string;
    contributionPlural: string;
    languageTitle: string;
    recentActivityTitle: string;
  };
  journeyUi: {
    educationEyebrow: string;
    educationHeading: string;
    honorsEyebrow: string;
    honorsHeading: string;
    tierNational: string;
    tierCity: string;
    tierAcademic: string;
  };
  contactUi: {
    copyEmail: string;
    copiedEmail: string;
    downloadResume: string;
    backToTop: string;
    rightsReserved: string;
    strikeHorizonTitle: string;
  };
  compassUi: {
    meridianLabel: string;
    strikeTooltip: string;
  };
}

const viPortfolio: PortfolioConfig = {
  ...portfolioConfig,
  identity: {
    ...portfolioConfig.identity,
    greeting: "XIN CHÀO, MÌNH LÀ",
    yearsExperience: "~4 NĂM KINH NGHIỆM",
    globalMarkets: ["Nhật Bản", "Đức", "Thụy Điển"],
    spokenLanguages: "Tiếng Việt · Tiếng Anh · Tiếng Nhật (~JLPT N4)",
    titles: [
      "Kỹ Sư Phần Mềm Full-Stack",
      "Kỹ Sư AI & Hệ Thống Đa Tác Tử",
      "Kỹ Sư Dữ Liệu & Lakehouse",
      "Kiến Trúc Sư Cloud & DevOps",
      "Người Chế Tác Công Cụ Sáng Tạo",
    ],
    introLines: [
      "Mình xây dựng những sản phẩm giải quyết bài toán thật,",
      "đưa vào thực chiến sớm, rồi mài giũa đến độ hoàn mỹ.",
    ],
    latelyNote:
      "Hiện tại: kiến trúc hệ thống quản lý sản xuất Daito (Nhật Bản), đường ống dữ liệu Medallion PySpark trên Microsoft Fabric, tiện ích OCR chạy cục bộ bằng WebGPU, bộ kỹ năng video holdframe và sân khấu tương tác 9:16 TikTok Live.",
    biography:
      "Kỹ sư phần mềm Full-Stack (Trương Văn Tiến) tại TP. Hồ Chí Minh với gần 4 năm phát triển các nền tảng Web, AI và Dữ liệu phục vụ Nhật Bản, Đức và Thụy Điển — song hành cùng các công cụ mã nguồn mở tinh xảo.",
    location: "TP. Thủ Đức, TP.HCM · Việt Nam",
    availability:
      "Sẵn sàng hợp tác các dự án Full-Stack, hạ tầng AI/Agent, Data Lakehouse & sản phẩm sáng tạo — Việt Nam & Quốc tế",
  },
  expertise: {
    eyebrow: "02 // CHUYÊN MÔN · NGŨ HÀNH KỸ THUẬT",
    heading: "Năm trụ cột kỹ thuật tôi luyện qua dự án quốc tế & mã nguồn mở.",
    subheading:
      "Gần bốn năm triển khai sản phẩm thực chiến cho Nhật Bản, Thụy Điển và Đức — chuyển dịch mượt mà từ giao diện tương tác, lõi NestJS/Laravel đến hồ dữ liệu Microsoft Fabric và công cụ Go/WebGPU bản địa.",
    categories: [
      {
        id: "fullstack",
        index: "I",
        elementBadge: "KIM // KIẾN TRÚC",
        title: "Hệ Thống Full-Stack",
        vietnameseLabel: "Full-Stack Architecture",
        description:
          "Phát triển trọn vòng đời các hệ thống điều hành nhà máy, B2B SaaS, phân tích tài chính và thương mại điện tử đa quốc gia với kiến trúc sạch, chịu tải cao và trải nghiệm sắc nét.",
        stackLines: ["React · Next.js · Vue.js · Tailwind", "NestJS · Laravel · Spring Boot · SQL"],
        capabilities: ["Nền tảng SaaS", "Điều độ Sản xuất", "Thương mại B2B", "RPC Thời gian thực"],
        motionStyle: "architectural-planes",
      },
      {
        id: "ai",
        index: "II",
        elementBadge: "HỎA // TRÍ TUỆ",
        title: "Kỹ Thuật AI & Agent",
        vietnameseLabel: "AI & Autonomous Agents",
        description:
          "Tích hợp OpenAI tự động hóa phân tích tài chính & nhân sự, xây dựng bộ kỹ năng kiểm chứng cho Coding Agent, bộ điều phối hạn ngạch OAuth đa tài khoản không gián đoạn và suy luận ONNX/WebGPU cục bộ.",
        stackLines: ["OpenAI API · Agents · MCP · TUI", "ONNX · WebGPU · ZeroTTS"],
        capabilities: ["Tổng hợp Tài chính AI", "Xoay vòng Quota Đa AI", "OCR WebGPU Cục bộ", "Kiểm định Pixel-Diff"],
        motionStyle: "neural-constellation",
      },
      {
        id: "data",
        index: "III",
        elementBadge: "THỦY // HỒ DỮ LIỆU",
        title: "Kỹ Thuật Dữ Liệu Lớn",
        vietnameseLabel: "Data & Medallion Lakehouse",
        description:
          "Thiết kế đường ống ETL/ELT kiến trúc Medallion (Landing → Raw → Silver → Gold) trên Microsoft Fabric & PySpark, nạp tăng trưởng có watermark, kiểm soát dữ liệu lỗi và mô hình sao Power BI.",
        stackLines: ["Microsoft Fabric · PySpark · Spark SQL", "Delta Lake · T-SQL · SuiteQL · Power BI"],
        capabilities: ["Medallion ETL/ELT", "Chống ghi đè Watermark", "Mô hình Star Schema", "Di trú Dữ liệu Lịch sử"],
        motionStyle: "laminar-strata",
      },
      {
        id: "devops",
        index: "IV",
        elementBadge: "MỘC // HẠ TẦNG",
        title: "Cloud & DevOps",
        vietnameseLabel: "Cloud Delivery & Operations",
        description:
          "Đóng gói ứng dụng trên Linux/Docker, vận hành hạ tầng sản xuất AWS, tự động hóa luồng đồng bộ CSV/XLSX định kỳ, gia cố bảo mật và triển khai CI/CD không gián đoạn.",
        stackLines: ["Docker · AWS · Linux · PowerShell", "GitHub Actions · GitLab CI · Vercel"],
        capabilities: ["Hạ tầng AWS", "Đồng bộ Lô Tự động", "Điều phối Container", "Bảo mật & Tối ưu"],
        motionStyle: "orbital-cluster",
      },
      {
        id: "devtools",
        index: "V",
        elementBadge: "THỔ // CHẾ TÁC",
        title: "Công Cụ Lập Trình",
        vietnameseLabel: "Native Developer Tooling",
        description:
          "Chế tác ứng dụng desktop bản địa bằng Go + Wails phân phối qua Homebrew, plugin giao diện dòng lệnh (TUI) cho Claude Code / Codex / OpenCode và ngôn ngữ lập trình đồ họa chuyển động.",
        stackLines: ["Go · Wails · Bun · TypeScript", "Desktop Workbenches · Browser Extensions"],
        capabilities: ["Ứng dụng Homebrew", "Trình quản trị Đa CSDL", "Plugin OpenCode", "Motion Video DSL"],
        motionStyle: "vernier-caliper",
      },
    ],
  },
  projects: {
    eyebrow: "03 // TÁC PHẨM TIÊU BIỂU · SELECTED ARTIFACTS",
    heading: "Chế tác mã nguồn mở đột phá & hệ thống doanh nghiệp toàn cầu.",
    subheading:
      "Các không gian văn hóa tương tác, công cụ desktop bản địa và hạ tầng AI tại github.com/zane-tv — song hành cùng những hệ thống thương mại thực chiến tại Nhật Bản, Thụy Điển và Đức.",
    items: [
      {
        ...portfolioConfig.projects.items[0]!,
        subtitle: "Sân Khấu Văn Hóa Tương Tác Trực Tiếp 9:16 Trên TikTok Live",
        description:
          "Ngôi chùa 9:16 vận hành trực tiếp trên TikTok Live. Hàng nghìn người xem cùng thắp hương, thỉnh chuông đồng và gieo quẻ đầu năm theo thời gian thực thông qua bình luận, lượt thích và quà tặng.",
        architectureNote: "Vòng lặp sự kiện Bun · Cầu nối JSON-RPC độ trễ cực thấp · Tổng hợp giọng nói ZeroTTS",
        accentMetric: "235 ★ · 355 Forks trên GitHub",
      },
      {
        ...portfolioConfig.projects.items[1]!,
        subtitle: "Trình Quản Trị Đa Cơ Sở Dữ Liệu Desktop + Trợ Lý AI Hiểu Lược Đồ",
        description:
          "Ứng dụng desktop bản địa hợp nhất PostgreSQL, MySQL, SQLite, MongoDB và Redis cùng trợ lý AI sinh truy vấn bám sát lược đồ thực tế và sơ đồ quan hệ ER. Phân phối trực tiếp qua Homebrew.",
        architectureNote: "Nhị phân Go + Wails bản địa · Hồ kết nối 5 hệ CSDL · Cài đặt qua `brew install`",
        accentMetric: "14 ★ · Phân phối trên Homebrew",
      },
      {
        ...portfolioConfig.projects.items[2]!,
        subtitle: "Bộ Gộp Hạn Ngạch Đa Tài Khoản AI & Giao Diện TUI Đa Tab",
        description:
          "Plugin OpenCode hợp nhất các tài khoản SuperGrok, ChatGPT và Kiro; tự động xoay vòng khóa xác thực ngay khoảnh khắc cạn hạn ngạch mà không đứt luồng sinh mã, hiển thị tốc độ tiêu thụ trực quan trên TUI.",
        architectureNote: "Xoay vòng OAuth 0ms gián đoạn · Máy trạng thái đa nhà cung cấp · Đo đạc TUI trực tiếp",
        accentMetric: "Chuyển Mạch Quota 0ms Gián Đoạn",
      },
      {
        ...portfolioConfig.projects.items[3]!,
        subtitle: "Bộ Kỹ Năng Kiểm Chứng Tự Động & Đồ Họa Chuyển Động Cho AI Agent",
        description:
          "Hệ sinh thái kỹ năng cho Claude Code, Codex và OpenCode: đối chiếu giao diện Figma-sang-Code bằng sai số điểm ảnh Playwright, rà soát mã độc tự động và kết xuất video motion-graphics 60fps bằng mã lệnh.",
        architectureNote: "Kiểm định điểm ảnh Playwright · Phân tích an ninh tĩnh · Ngôn ngữ dòng thời gian 60fps",
        accentMetric: "Kiểm Định Pixel-Diff & Motion DSL",
      },
    ],
    enterpriseEyebrow: "HỒ SƠ DỰ ÁN QUỐC TẾ // NHẬT BẢN · THỤY ĐIỂN · ĐỨC",
    enterpriseHeading: "Hệ Thống Thương Mại & Doanh Nghiệp Triển Khai Trên Thị Trường Quốc Tế",
    enterpriseDossier: [
      {
        code: "PROD // 01",
        region: "NHẬT BẢN",
        period: "06/2026 — HIỆN TẠI",
        title: "Hệ Thống Quản Lý Nhà Máy Daito",
        organization: "ZEN-S · Sản Xuất Công Nghiệp Nhật Bản",
        summary:
          "Nền tảng điều độ sản xuất, theo dõi tiến độ xưởng và cảnh báo trễ hạn hàng ngày bằng React/TypeScript & NestJS, kèm di trú dữ liệu lịch sử từ năm 2021.",
        highlights: [
          "Thu thập, chuẩn hóa và di trú toàn bộ dữ liệu sản xuất lịch sử từ hệ thống TECHBK (từ 2021) sang cấu trúc đơn hàng mới.",
          "Tự động hóa xuất/nhập CSV & XLSX định kỳ với cơ chế khử trùng lặp, cập nhật theo lô và kiểm tra watermark chống ghi đè dữ liệu mới.",
        ],
        stack: ["TypeScript", "NestJS", "React", "TypeORM", "MySQL", "Docker"],
      },
      {
        code: "PROD // 02",
        region: "DỮ LIỆU LỚN",
        period: "06/2025 — 05/2026",
        title: "Hệ Thống Phân Tích Đấu Thầu Alpha",
        organization: "ZEN-S · Kỹ Thuật Dữ Liệu Microsoft Fabric",
        summary:
          "Kiến trúc Lakehouse đa tầng (Landing → Raw → Silver → Gold) trên Microsoft Fabric hợp nhất dữ liệu NetSuite SuiteQL và HCSS phục vụ phân tích đấu thầu & báo cáo tài chính.",
        highlights: [
          "Xây dựng luồng biến đổi PySpark hướng siêu dữ liệu hỗ trợ nạp tăng trưởng, cách ly dữ liệu lỗi và truy vết nguồn gốc (lineage).",
          "Thiết kế bảng Delta Lake & mô hình kho dữ liệu hình sao bằng T-SQL cung cấp dữ liệu chuẩn cho báo cáo điều hành Power BI.",
        ],
        stack: ["Microsoft Fabric", "PySpark", "Delta Lake", "T-SQL", "NetSuite SuiteQL", "Power BI"],
      },
      {
        code: "PROD // 03",
        region: "THỤY ĐIỂN",
        period: "09/2024 — 05/2025",
        title: "Nền Tảng Phân Tích Tài Chính AI EQL Global",
        organization: "EQL Global (Thụy Điển)",
        summary:
          "Nền tảng phân tích tài chính tích hợp AI tự động thu thập báo cáo tài chính và thông cáo báo chí đa nguồn, tổng hợp nhận định chuyên sâu và trực quan hóa dữ liệu.",
        highlights: [
          "Phát triển giao diện Next.js/React tốc độ cao kết hợp dịch vụ thu thập dữ liệu Node.js, MongoDB và hạ tầng AWS.",
          "Tích hợp OpenAI API tự động tóm tắt báo cáo tài chính phức tạp thành biểu đồ và chỉ số trực quan cho nhà đầu tư.",
        ],
        stack: ["Next.js", "React", "Node.js", "MongoDB", "AWS", "OpenAI API"],
        liveUrl: "https://eqlglobal.com/",
      },
      {
        code: "PROD // 04",
        region: "NHẬT BẢN",
        period: "03/2024 — 12/2025",
        title: "Nền Tảng SaaS Quản Trị & AI JSaaS",
        organization: "ZEN-S · JMatch Nhật Bản",
        summary:
          "Nền tảng B2B SaaS phục vụ doanh nghiệp Nhật Bản nâng cao năng suất nhân sự, quản trị HR và kinh doanh với trợ lý tự động hóa AI và cổng thanh toán Robopay.",
        highlights: [
          "Xây dựng phân hệ khách hàng & quản trị viên bằng Vue.js + Laravel trên AWS tuân thủ tiêu chuẩn bảo mật khắt khe của Nhật.",
          "Tích hợp OpenAI hỗ trợ ra quyết định tự động và tối ưu hóa tốc độ tải trang, truy vấn cơ sở dữ liệu quy mô lớn.",
        ],
        stack: ["Vue.js", "Laravel", "MySQL", "AWS", "Robopay", "OpenAI API"],
        liveUrl: "https://www.jmatch.jp/jsaas/",
      },
    ],
  },
  experience: {
    eyebrow: "05 // HÀNH TRÌNH & BẢNG VÀNG · JOURNEY & HONORS",
    heading: "Từ Giải Olympic Tin học Quốc gia đến những hệ thống vươn tầm quốc tế.",
    subheading:
      "Gần bốn năm kỹ nghệ thực chiến phục vụ Nhật Bản, Thụy Điển và Đức — đặt nền móng trên chương trình Cử nhân Trí tuệ Nhân tạo tại ĐH CNTT (ĐHQG-HCM) cùng chuỗi danh hiệu cấp Quốc gia và Thành phố.",
    milestones: [
      {
        id: "zens-software-data-engineer",
        era: "03/2024 — HIỆN TẠI",
        watermarkYear: "2026",
        role: "Kỹ Sư Phần Mềm & Nền Tảng Dữ Liệu",
        organization: "ZEN-S",
        location: "TP. Hồ Chí Minh",
        regionTag: "NHẬT BẢN & DATA",
        summary:
          "Đảm nhiệm kiến trúc Full-Stack và kỹ thuật hồ dữ liệu Medallion cho các dự án công nghiệp sản xuất Nhật Bản, phân tích đấu thầu tài chính và B2B SaaS.",
        achievements: [
          "Daito Manufactory Manager (Nhật Bản): Phát triển ứng dụng điều độ sản xuất React + NestJS/TypeORM; di trú dữ liệu lịch sử TECHBK (từ 2021) và tự động hóa đồng bộ CSV/XLSX có kiểm soát watermark.",
          "Alpha Bidding Intelligence: Thiết kế đường ống PySpark & Delta Lake 4 tầng (Landing → Gold) trên Microsoft Fabric hợp nhất NetSuite SuiteQL & HCSS lên mô hình sao Power BI.",
          "JSaaS (jmatch.jp/jsaas): Xây dựng nền tảng SaaS nhân sự & kinh doanh tại Nhật bằng Vue.js, Laravel, AWS, Robopay và OpenAI API.",
        ],
        technologies: ["TypeScript", "NestJS", "React", "Vue.js", "Laravel", "Microsoft Fabric", "PySpark", "Delta Lake", "AWS"],
        motif: "crane",
      },
      {
        id: "open-source-ai-toolmaker",
        era: "2025 — HIỆN TẠI",
        watermarkYear: "OSS",
        role: "Tác Giả Mã Nguồn Mở & Chế Tác Công Cụ AI",
        organization: "github.com/zane-tv · Open Source",
        location: "Việt Nam",
        regionTag: "MÃ NGUỒN MỞ · 400+ ★",
        summary:
          "Sáng tạo các sân khấu văn hóa tương tác trực tiếp, trình quản trị cơ sở dữ liệu bản địa, bộ điều phối hạn ngạch đa AI và tiện ích mở rộng WebGPU cục bộ.",
        achievements: [
          "Sáng lập Chùa Linh Ứng Online (235+ ★, 355+ forks), biến luồng phát TikTok Live 9:16 thành không gian văn hóa tương tác thời gian thực với Bun, JSON-RPC & ZeroTTS.",
          "Phát hành SoftDB trên Homebrew (Go + Wails) — hợp nhất 5 hệ cơ sở dữ liệu lớn cùng trợ lý AI hiểu lược đồ.",
          "Xây dựng opencode-multi-ai, agent-skills, holdframe và tiện ích OCR WebGPU tăng tốc quy trình phát triển phần mềm tự hành.",
        ],
        technologies: ["Go", "Wails", "Bun", "WebGPU", "ONNX", "OpenCode", "ZeroTTS"],
        motif: "sun",
      },
      {
        id: "eql-global-sweden",
        era: "09/2024 — 05/2025",
        watermarkYear: "2025",
        role: "Kỹ Sư Phát Triển Web Full-Stack",
        organization: "EQL Global",
        location: "Thụy Điển (Remote)",
        regionTag: "THỤY ĐIỂN · FINTECH AI",
        summary:
          "Xây dựng nền tảng phân tích tài chính tích hợp AI (eqlglobal.com) tự động hóa thu thập báo cáo doanh nghiệp đa nguồn và tổng hợp dữ liệu đầu tư.",
        achievements: [
          "Phát triển giao diện trực quan hóa dữ liệu Next.js/React tốc độ cao kết hợp dịch vụ thu thập Node.js, MongoDB và AWS.",
          "Tích hợp OpenAI tự động phân tích, trích xuất nhận định cốt lõi và tóm tắt báo cáo tài chính chuyên sâu.",
        ],
        technologies: ["Next.js", "React", "Node.js", "MongoDB", "AWS", "OpenAI API"],
        motif: "chain",
      },
      {
        id: "grainlogic-solekia-japan",
        era: "06/2023 — 02/2024",
        watermarkYear: "2024",
        role: "Kỹ Sư Front-End & Thực Tập Sinh Trao Đổi Tại Nhật",
        organization: "GrainLogic (Đức) · Solekia / Tập đoàn Fujitsu (Tokyo)",
        location: "Đức (Remote) & Tokyo, Nhật Bản",
        regionTag: "ĐỨC & TOKYO",
        summary:
          "Phát triển sàn thương mại điện tử bán sỉ đa quốc gia cho thị trường Đức sau kỳ tu nghiệp kỹ thuật & văn hóa tại Tokyo cùng Solekia (Fujitsu Group) và Freesia Group.",
        achievements: [
          "GrainLogic (08/2023–02/2024): Xây dựng giao diện đa ngôn ngữ và luồng giao dịch nhà cung cấp – người mua bằng Next.js, TypeScript, Tailwind CSS và MySQL.",
          "Trao đổi sinh viên tại Nhật Bản (06/2023–08/2023): Được đào tạo chuyên sâu Java, Spring Boot & PostgreSQL tại Solekia (Fujitsu Group) và thiết kế cổng thông tin đa ngôn ngữ (Anh – Việt – Nhật) cho Trường CĐ Công nghệ Công nghiệp Đô thị Tokyo.",
        ],
        technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Java", "Spring Boot", "PostgreSQL", "MySQL"],
        motif: "comb",
      },
      {
        id: "thegoodguys-mobile-early-career",
        era: "07/2022 — 10/2022",
        watermarkYear: "2022",
        role: "Thực Tập Sinh Lập Trình React Native",
        organization: "THEGOODGUYS TECHNOLOGY",
        location: "TP. Hồ Chí Minh",
        regionTag: "MOBILE & AGRITECH",
        summary:
          "Phát triển ứng dụng di động đa nền tảng quản lý nông nghiệp thông minh bằng mã QR và hệ thống API Laravel.",
        achievements: [
          "Digi Farmer (nhóm 6 thành viên): Tích hợp quét mã QR thời gian thực vào ứng dụng React Native quản lý trạng thái và vòng đời lô cây trồng.",
          "Phối hợp phát triển kết nối REST API trên Laravel + MySQL và tối ưu trải nghiệm tương thích đa thiết bị.",
        ],
        technologies: ["React Native", "Laravel", "MySQL", "REST API"],
        motif: "chain",
      },
    ],
    education: [
      {
        institution: "Trường Đại học Công nghệ Thông tin — ĐHQG TP.HCM (UIT)",
        period: "2026 — HIỆN TẠI",
        degree: "Cử nhân Trí tuệ Nhân tạo (Bachelor of Artificial Intelligence)",
        distinction: "ĐHQG TP. Hồ Chí Minh",
        detail:
          "Đào sâu nền tảng học máy, kiến trúc mạng nơ-ron sâu, thị giác máy tính và hệ thống tác tử thông minh tự hành.",
      },
      {
        institution: "Trường Cao đẳng Công nghệ Thủ Đức",
        period: "2020 — 2023",
        degree: "Công nghệ Thông tin (Chương trình hợp tác Doanh nghiệp & Cao đẳng Nhật Bản)",
        distinction: "Chương trình Liên kết Nhật Bản",
        detail:
          "Hoàn thành chương trình kỹ nghệ phần mềm chuyên sâu đào tạo phối hợp trực tiếp cùng các doanh nghiệp và trường cao đẳng Nhật Bản.",
      },
    ],
    honors: [
      {
        year: "2022 & 2023",
        title: "2 Năm Liên Tiếp “Top 5 Sinh Viên Tiêu Biểu TP. Hồ Chí Minh”",
        issuer: "Danh hiệu tuyên dương cấp Thành phố (2022 & 2023)",
        tier: "city",
      },
      {
        year: "2021",
        title: "Giải Ba — Olympic Tin Học Sinh Viên Việt Nam",
        issuer: "Hội Tin học Việt Nam · Bộ Giáo dục & Đào tạo",
        tier: "national",
      },
      {
        year: "2022",
        title: "Giải Thưởng “Sao Tháng Giêng” Cấp Trung Ương",
        issuer: "Ban Chấp hành Trung ương Hội Sinh viên Việt Nam",
        tier: "national",
      },
      {
        year: "2023",
        title: "Tuyên Dương “Học Sinh, Sinh Viên Giáo Dục Nghề Nghiệp Xuất Sắc”",
        issuer: "Bộ Lao động – Thương binh và Xã hội (Bộ LĐ-TB&XH)",
        tier: "national",
      },
      {
        year: "2022",
        title: "Giải Nhì Thiết Kế Website — Hội Thi Học Sinh, Sinh Viên Giỏi Nghề",
        issuer: "Cấp Thành phố Hồ Chí Minh",
        tier: "city",
      },
      {
        year: "2020 — 2023",
        title: "2 Giải Thưởng Nghiên Cứu Khoa Học Xuất Sắc Cấp Trường",
        issuer: "Trường Cao đẳng Công nghệ Thủ Đức",
        tier: "academic",
      },
    ],
  },
  contact: {
    eyebrow: "06 // KHUNG CẢNH CUỐI · KẾT NỐI CÙNG TRƯƠNG VĂN TIẾN (ZANE)",
    headline: "Có một bài toán thực sự đáng giải? Cùng nhau hiện thực hóa.",
    subheadline:
      "Kết nối cùng Zane cho các dự án kỹ nghệ sản phẩm Full-Stack, hạ tầng AI & Agent, hồ dữ liệu Microsoft Fabric / PySpark hoặc chế tác công cụ chuyên sâu.",
    closingMotto:
      "TRƯƠNG VĂN TIẾN · ZANE (@ZANE-TV) · TRỐNG ĐỒNG ĐÔNG SƠN × CÔNG NGHỆ TƯƠNG LAI · TP.HCM, VIỆT NAM",
  },
};

const uiDictionaries: Record<Locale, UiDictionary> = {
  vi: {
    nav: {
      disciplines: "Ngũ Hành",
      artifacts: "Tác Phẩm",
      telemetry: "Thống Kê",
      trajectory: "Hành Trình",
      dialogue: "Kết Nối",
      replayIntro: "Xem Lại Intro",
      editionLabel: "TP.HCM · ĐÔNG SƠN EDITION",
      skipToMain: "Chuyển tới nội dung chính",
      langSwitchAria: "Chuyển ngôn ngữ sang Tiếng Anh",
    },
    hero: {
      skipIntro: "Bỏ qua Intro",
      sealTop: "ẤN ĐỒNG",
      marketsPrefix: "THỊ TRƯỜNG",
      laureateBadge: "CỬ NHÂN AI @ ĐH CNTT · OLYMPIC TIN HỌC QG",
      activeLabPrefix: "ĐANG XÂY DỰNG //",
      vietnamBadge: "VIỆT NAM",
      ctaExplore: "Khám Phá Tác Phẩm",
      ctaResume: "Tải Hồ Sơ PDF",
      ctaContact: "Kết Nối Ngay",
      scrollLabel: "Cuộn Xuống",
      strikeHint: "NHẤN GÕ TRỐNG ĐỒNG",
      strikeTitle: "Gõ Trống Đồng — Lan tỏa hào quang toàn trang",
    },
    frieze: {
      rowOne: [
        "TRỐNG ĐỒNG NGỌC LŨ",
        "TRƯƠNG VĂN TIẾN (@ZANE-TV)",
        "CHIM LẠC VIỆT NAM",
        "NHẬT BẢN · THỤY ĐIỂN · ĐỨC",
        "KIẾN TRÚC HỆ THỐNG SÁNG TẠO",
      ],
      rowTwo: [
        "TYPESCRIPT · GO · PYTHON · LARAVEL",
        "MICROSOFT FABRIC & PYSPARK LAKEHOUSE",
        "AI AGENTS · WEBGPU · ONNX",
        "OLYMPIC TIN HỌC VIỆT NAM",
        "2× TOP 5 SINH VIÊN TIÊU BIỂU TP.HCM",
      ],
    },
    projectsUi: {
      artifactPrefix: "TÁC PHẨM",
      archPrefix: "KIẾN TRÚC //",
      exploreSource: "Mã Nguồn GitHub",
      companionLink: "Kho Lưu Trữ Đi Kèm",
      livePlatform: "Truy Cập Nền Tảng",
      inspectAriaPrefix: "Xem dự án",
    },
    telemetryUi: {
      eyebrow: "04 // NHỊP ĐIỆU KỸ THUẬT & GITHUB TELEMETRY",
      heading: "Năm mươi hai tuần miệt mài khắc trên mặt trống đồng.",
      liveBannerPrefix: "Dữ liệu trực tiếp GitHub API",
      fallbackUnconfigured: "Chế độ Xem trước — Cấu hình GITHUB_USERNAME để đồng bộ trực tiếp.",
      fallbackRateLimited: "Tạm thời giới hạn lượt gọi GitHub API — Đang hiển thị bản ghi chuẩn.",
      fallbackUnavailable: "Đang hiển thị bản ghi ngoại tuyến khi không kết nối được GitHub API.",
      stats: {
        publicRepos: "Kho Mã Công Khai",
        starsEarned: "Ngôi Sao Đạt Được",
        repoForks: "Lượt Nhân Bản (Forks)",
        weeklyActivity: "Hoạt Động 52 Tuần",
      },
      dialTitle: "Mặt Trống Đóng Góp 52 Tuần",
      dialHint: "Rê chuột hoặc nhấn Tab quanh vành trống",
      contributionSingular: "đóng góp",
      contributionPlural: "đóng góp",
      languageTitle: "Tỷ Trọng Ngôn Ngữ Lập Trình",
      recentActivityTitle: "Nhật Ký Hoạt Động Gần Đây",
    },
    journeyUi: {
      educationEyebrow: "HỌC VẤN & ĐÀO TẠO CHÍNH QUY",
      educationHeading: "Nền Tảng Học Thuật",
      honorsEyebrow: "BIA ĐỒNG KHOA BẢNG · NATIONAL & MUNICIPAL HONORS",
      honorsHeading: "Giải Thưởng & Danh Hiệu Tiêu Biểu",
      tierNational: "CẤP QUỐC GIA",
      tierCity: "CẤP THÀNH PHỐ",
      tierAcademic: "NGHIÊN CỨU KHOA HỌC",
    },
    contactUi: {
      copyEmail: "Sao Chép Email",
      copiedEmail: "Đã Sao Chép ✓",
      downloadResume: "Tải CV (PDF)",
      backToTop: "Lên Đầu Trang ↑",
      rightsReserved: "Bản quyền thuộc về Trương Văn Tiến",
      strikeHorizonTitle: "Nhấn vào mặt trống chân trời để gõ nhịp hào quang",
    },
    compassUi: {
      meridianLabel: "KINH TUYẾN NGỌC LŨ",
      strikeTooltip: "Gõ Trống Đồng — Lan tỏa hào quang toàn trang",
    },
  },
  en: {
    nav: {
      disciplines: "Disciplines",
      artifacts: "Artifacts",
      telemetry: "Telemetry",
      trajectory: "Trajectory",
      dialogue: "Dialogue",
      replayIntro: "Replay Intro",
      editionLabel: "HCMC · ĐÔNG SƠN EDITION",
      skipToMain: "Skip to main portfolio sections",
      langSwitchAria: "Switch language to Vietnamese",
    },
    hero: {
      skipIntro: "Skip Intro",
      sealTop: "SEAL",
      marketsPrefix: "MARKETS",
      laureateBadge: "B.S. AI @ VNU-UIT · NATIONAL OLYMPIAD LAUREATE",
      activeLabPrefix: "ACTIVE LAB //",
      vietnamBadge: "VIỆT NAM",
      ctaExplore: "Explore Artifacts",
      ctaResume: "Resume PDF",
      ctaContact: "Contact Zane",
      scrollLabel: "Scroll",
      strikeHint: "CLICK TO STRIKE DRUM",
      strikeTitle: "Strike Đông Sơn Drum — Radiate Full-Page Aura",
    },
    frieze: {
      rowOne: [
        "TRỐNG ĐỒNG NGỌC LŨ",
        "TRƯƠNG VĂN TIẾN (@ZANE-TV)",
        "CHIM LẠC VIỆT NAM",
        "JAPAN · SWEDEN · GERMANY",
        "CREATIVE SYSTEMS ARCHITECTURE",
      ],
      rowTwo: [
        "TYPESCRIPT · GO · PYTHON · LARAVEL",
        "MICROSOFT FABRIC & PYSPARK LAKEHOUSE",
        "AI AGENTS · WEBGPU · ONNX",
        "VIETNAM COMPUTER OLYMPIAD",
        "2× TOP 5 OUTSTANDING STUDENT HCMC",
      ],
    },
    projectsUi: {
      artifactPrefix: "ARTIFACT",
      archPrefix: "ARCH //",
      exploreSource: "Explore Source",
      companionLink: "Companion Repo / Tap",
      livePlatform: "Live Production",
      inspectAriaPrefix: "Inspect",
    },
    telemetryUi: {
      eyebrow: "04 // GITHUB TELEMETRY & CADENCE",
      heading: "Fifty-two weeks of engineering, inscribed around the drum.",
      liveBannerPrefix: "Live GitHub API",
      fallbackUnconfigured: "Preview Mode — Set GITHUB_USERNAME to stream live GitHub statistics.",
      fallbackRateLimited: "GitHub API rate limit reached — displaying verified reference cadence.",
      fallbackUnavailable: "Offline reference cadence displayed while GitHub API is unreachable.",
      stats: {
        publicRepos: "Public Repositories",
        starsEarned: "Stars Earned",
        repoForks: "Repository Forks",
        weeklyActivity: "52-Week Activity",
      },
      dialTitle: "Radial Weekly Contribution Dial",
      dialHint: "Hover or Tab ticks",
      contributionSingular: "contribution",
      contributionPlural: "contributions",
      languageTitle: "Language Distribution",
      recentActivityTitle: "Recent Activity Log",
    },
    journeyUi: {
      educationEyebrow: "ACADEMIC LINEAGE",
      educationHeading: "Formal Education",
      honorsEyebrow: "BRONZE HONORS STELE · NATIONAL & MUNICIPAL DISTINCTIONS",
      honorsHeading: "Awards & Laureate Honors",
      tierNational: "NATIONAL HONOR",
      tierCity: "HCMC MUNICIPAL",
      tierAcademic: "SCIENTIFIC RESEARCH",
    },
    contactUi: {
      copyEmail: "Copy Address",
      copiedEmail: "Copied Email ✓",
      downloadResume: "Download Resume",
      backToTop: "Back to Top ↑",
      rightsReserved: "All Rights Reserved",
      strikeHorizonTitle: "Click the rising bronze drum to radiate full-page aura",
    },
    compassUi: {
      meridianLabel: "NGỌC LŨ MERIDIAN",
      strikeTooltip: "Strike Đông Sơn Drum — Radiate Full-Page Aura",
    },
  },
};

export function getLocalizedPortfolio(locale: Locale): {
  config: PortfolioConfig;
  ui: UiDictionary;
} {
  return {
    config: locale === "vi" ? viPortfolio : portfolioConfig,
    ui: uiDictionaries[locale],
  };
}
