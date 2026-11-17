import { portfolioConfig } from "@/config/portfolio";

export interface WeeklyContribution {
  weekIndex: number;
  weekLabel: string;
  dateRange: string;
  count: number;
}

export interface LanguageShare {
  name: string;
  percentage: number;
  color: string;
}

export interface RecentGitHubEvent {
  id: string;
  type: string;
  repo: string;
  summary: string;
  dateLabel: string;
  url: string;
}

export interface GitHubTelemetryData {
  username: string;
  isFallback: boolean;
  fallbackReason?: "unconfigured" | "rate_limited" | "unavailable";
  statusBanner: string;
  metrics: {
    publicRepos: number;
    totalStars: number;
    totalForks: number;
    totalContributions: number;
    contributionsNote: string;
  };
  languages: LanguageShare[];
  weeks: WeeklyContribution[];
  recentActivity: RecentGitHubEvent[];
  fetchedAtIso: string;
}

const LANGUAGE_PALETTE: Record<string, string> = {
  TypeScript: "#D29A5C",
  Go: "#73C3A9",
  Python: "#E7B980",
  Rust: "#B67B43",
  JavaScript: "#C8C1B5",
  GLSL: "#5BA890",
  Shell: "#958C7E",
  Other: "#5C564E",
};

function getLanguageColor(lang: string, index: number): string {
  if (LANGUAGE_PALETTE[lang]) return LANGUAGE_PALETTE[lang];
  const cycle = ["#D29A5C", "#73C3A9", "#E7B980", "#C8C1B5", "#99601F", "#958C7E"];
  return cycle[index % cycle.length] ?? "#958C7E";
}

function buildWeekWindows(now = new Date()): Array<{ start: Date; end: Date; label: string; range: string }> {
  const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  const windows: Array<{ start: Date; end: Date; label: string; range: string }> = [];
  const endAligned = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  for (let i = 51; i >= 0; i--) {
    const end = new Date(endAligned.getTime() - i * 7 * 86_400_000);
    const start = new Date(end.getTime() - 6 * 86_400_000);
    windows.push({
      start,
      end,
      label: `W${String(52 - i).padStart(2, "0")}`,
      range: `${fmt.format(start)} – ${fmt.format(end)}`,
    });
  }
  return windows;
}

/**
 * Deterministic fallback state used ONLY when GITHUB_USERNAME is not yet configured
 * or when GitHub's public API is rate-limited / unreachable. Explicitly labeled in UI.
 */
function buildFallbackTelemetry(
  reason: "unconfigured" | "rate_limited" | "unavailable",
  attemptedUsername: string
): GitHubTelemetryData {
  const windows = buildWeekWindows();
  // Deterministic harmonic wave for previewing the radial Đông Sơn contribution dial
  const weeks: WeeklyContribution[] = windows.map((w, i) => {
    const wave =
      Math.sin(i * 0.42) * 5 +
      Math.cos(i * 0.19 + 1.1) * 4 +
      ((i * 7 + 3) % 9);
    const count = i % 11 === 4 ? 0 : Math.max(1, Math.round(wave + 7));
    return {
      weekIndex: i,
      weekLabel: w.label,
      dateRange: w.range,
      count,
    };
  });

  const totalSample = weeks.reduce((acc, w) => acc + w.count, 0);

  const bannerMap: Record<typeof reason, string> = {
    unconfigured:
      "Fallback Preview Mode — Set GITHUB_USERNAME in .env.local or github.username in src/config/portfolio.ts to stream live GitHub API statistics.",
    rate_limited: `Fallback State — GitHub API rate limit reached for @${attemptedUsername}. Add server-only GITHUB_TOKEN for 5,000 req/hr.`,
    unavailable: `Fallback State — Unable to reach GitHub API for @${attemptedUsername}; displaying offline reference layout.`,
  };

  return {
    username: attemptedUsername || "unconfigured",
    isFallback: true,
    fallbackReason: reason,
    statusBanner: bannerMap[reason],
    metrics: {
      publicRepos: 34,
      totalStars: 418,
      totalForks: 64,
      totalContributions: totalSample,
      contributionsNote: "Sample 52-week cadence (Fallback Mode)",
    },
    languages: [
      { name: "TypeScript", percentage: 54, color: "#D29A5C" },
      { name: "Go", percentage: 19, color: "#73C3A9" },
      { name: "Python", percentage: 13, color: "#E7B980" },
      { name: "Rust", percentage: 9, color: "#B67B43" },
      { name: "GLSL / Other", percentage: 5, color: "#958C7E" },
    ],
    weeks,
    recentActivity: [
      {
        id: "sample-1",
        type: "Release",
        repo: "lac-vector-studio",
        summary: "Published binary glTF 2.0 crane exporter & radial SDF shader kernels",
        dateLabel: "Sample Event",
        url: portfolioConfig.links.github,
      },
      {
        id: "sample-2",
        type: "Push",
        repo: "bronze-query-workbench",
        summary: "Added schema-grounded SQL planner and DuckDB Parquet inspector",
        dateLabel: "Sample Event",
        url: portfolioConfig.links.github,
      },
      {
        id: "sample-3",
        type: "PullRequest",
        repo: "neural-loom-mcp",
        summary: "Implemented deterministic DAG state replay & quota-aware routing",
        dateLabel: "Sample Event",
        url: portfolioConfig.links.github,
      },
    ],
    fetchedAtIso: new Date().toISOString(),
  };
}

interface GitHubUserResponse {
  login: string;
  public_repos: number;
  html_url: string;
}

interface GitHubRepoResponse {
  name: string;
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  size: number;
  pushed_at: string | null;
  html_url: string;
}

interface GitHubEventResponse {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload?: {
    commits?: Array<{ message?: string }>;
    action?: string;
  };
}

/**
 * Server-only cached GitHub telemetry fetcher.
 * Never exposes GITHUB_TOKEN to the client bundle.
 */
export async function getGitHubTelemetry(overrideUsername?: string): Promise<GitHubTelemetryData> {
  const rawUsername = (
    overrideUsername ??
    process.env.GITHUB_USERNAME ??
    portfolioConfig.github.username
  ).trim();

  if (!rawUsername || !/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(rawUsername)) {
    return buildFallbackTelemetry("unconfigured", "");
  }

  const token = process.env.GITHUB_TOKEN?.trim();
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "DongSon-Portfolio-Telemetry/1.0",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const [userRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(rawUsername)}`, {
        headers,
        next: { revalidate: 3600 },
      }),
      fetch(
        `https://api.github.com/users/${encodeURIComponent(rawUsername)}/repos?per_page=100&sort=updated`,
        {
          headers,
          next: { revalidate: 3600 },
        }
      ),
      fetch(
        `https://api.github.com/users/${encodeURIComponent(rawUsername)}/events/public?per_page=100`,
        {
          headers,
          next: { revalidate: 1800 },
        }
      ),
    ]);

    if (userRes.status === 403 || userRes.status === 429 || reposRes.status === 403) {
      return buildFallbackTelemetry("rate_limited", rawUsername);
    }

    if (!userRes.ok || !reposRes.ok) {
      return buildFallbackTelemetry("unavailable", rawUsername);
    }

    const user = (await userRes.json()) as GitHubUserResponse;
    const repos = (await reposRes.json()) as GitHubRepoResponse[];
    const events: GitHubEventResponse[] = eventsRes.ok ? ((await eventsRes.json()) as GitHubEventResponse[]) : [];

    const ownRepos = repos.filter((r) => !r.fork);
    const totalStars = ownRepos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = ownRepos.reduce((sum, r) => sum + (r.forks_count || 0), 0);

    // Aggregate language bytes from top recently-active repositories (cached 1h server-side)
    const ignored = new Set(portfolioConfig.github.ignoredLanguages);
    const langWeights = new Map<string, number>();

    const topForLangs = ownRepos.slice(0, 18);
    const langResponses = await Promise.all(
      topForLangs.map((r) =>
        fetch(
          `https://api.github.com/repos/${encodeURIComponent(rawUsername)}/${encodeURIComponent(
            r.name
          )}/languages`,
          { headers, next: { revalidate: 3600 } }
        )
          .then((res) => (res.ok ? (res.json() as Promise<Record<string, number>>) : null))
          .catch(() => null)
      )
    );

    let hasByteBreakdown = false;
    for (const byteMap of langResponses) {
      if (!byteMap) continue;
      for (const [lang, bytes] of Object.entries(byteMap)) {
        if (ignored.has(lang) || bytes <= 0) continue;
        hasByteBreakdown = true;
        langWeights.set(lang, (langWeights.get(lang) ?? 0) + bytes);
      }
    }

    if (!hasByteBreakdown) {
      for (const repo of ownRepos) {
        if (!repo.language || ignored.has(repo.language)) continue;
        const weight = Math.max(1, repo.size || 1);
        langWeights.set(repo.language, (langWeights.get(repo.language) ?? 0) + weight);
      }
    }

    const sortedLangs = [...langWeights.entries()].sort((a, b) => b[1] - a[1]);
    const totalWeight = sortedLangs.reduce((s, [, w]) => s + w, 0) || 1;
    const topN = portfolioConfig.github.topLanguagesCount;
    const topEntries = sortedLangs.slice(0, topN);
    const restWeight = sortedLangs.slice(topN).reduce((s, [, w]) => s + w, 0);

    const languages: LanguageShare[] = topEntries.map(([name, w], idx) => ({
      name,
      percentage: Math.max(1, Math.round((w / totalWeight) * 100)),
      color: getLanguageColor(name, idx),
    }));

    if (restWeight > 0) {
      languages.push({
        name: "Other",
        percentage: Math.max(1, Math.round((restWeight / totalWeight) * 100)),
        color: LANGUAGE_PALETTE.Other ?? "#5C564E",
      });
    }

    // Optional GraphQL 52-week contribution calendar when server GITHUB_TOKEN is configured
    const windows = buildWeekWindows();
    let weeks: WeeklyContribution[] | null = null;
    let totalContributions = 0;
    let contributionsNote = "Public events & repository push cadence (last 52 weeks)";

    if (token) {
      try {
        const gqlRes = await fetch("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query($login: String!) {
                user(login: $login) {
                  contributionsCollection {
                    contributionCalendar {
                      totalContributions
                      weeks {
                        contributionDays {
                          contributionCount
                          date
                        }
                      }
                    }
                  }
                }
              }
            `,
            variables: { login: rawUsername },
          }),
          next: { revalidate: 3600 },
        });

        if (gqlRes.ok) {
          const gqlJson = (await gqlRes.json()) as {
            data?: {
              user?: {
                contributionsCollection?: {
                  contributionCalendar?: {
                    totalContributions: number;
                    weeks: Array<{ contributionDays: Array<{ contributionCount: number; date: string }> }>;
                  };
                };
              };
            };
          };
          const calendar = gqlJson.data?.user?.contributionsCollection?.contributionCalendar;
          if (calendar?.weeks?.length) {
            const recent52 = calendar.weeks.slice(-52);
            weeks = recent52.map((wk, idx) => ({
              weekIndex: idx,
              weekLabel: windows[idx]?.label ?? `W${idx + 1}`,
              dateRange: windows[idx]?.range ?? "",
              count: wk.contributionDays.reduce((s, d) => s + d.contributionCount, 0),
            }));
            totalContributions = calendar.totalContributions;
            contributionsNote = "Verified 52-week GitHub contribution calendar";
          }
        }
      } catch {
        // Gracefully fall back to REST event/push bucketing below
      }
    }

    if (!weeks) {
      try {
        const contribRes = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(rawUsername)}?y=last`,
          { next: { revalidate: 3600 } }
        );
        if (contribRes.ok) {
          const contribJson = (await contribRes.json()) as {
            total?: { lastYear?: number };
            contributions?: Array<{ date: string; count: number }>;
          };
          if (Array.isArray(contribJson.contributions) && contribJson.contributions.length >= 350) {
            const days = contribJson.contributions.slice(-364);
            const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
            const parsedWeeks: WeeklyContribution[] = [];
            for (let w = 0; w < 52; w++) {
              const slice = days.slice(w * 7, w * 7 + 7);
              if (!slice.length) continue;
              const sum = slice.reduce((acc, d) => acc + (d.count || 0), 0);
              const d0 = new Date(`${slice[0]!.date}T00:00:00Z`);
              const d1 = new Date(`${slice[slice.length - 1]!.date}T00:00:00Z`);
              parsedWeeks.push({
                weekIndex: w,
                weekLabel: `W${String(w + 1).padStart(2, "0")}`,
                dateRange: `${fmt.format(d0)} – ${fmt.format(d1)}`,
                count: sum,
              });
            }
            if (parsedWeeks.length === 52) {
              weeks = parsedWeeks;
              totalContributions =
                contribJson.total?.lastYear ?? parsedWeeks.reduce((s, x) => s + x.count, 0);
              contributionsNote = `Live 52-week contribution calendar (@${user.login})`;
            }
          }
        }
      } catch {
        // Fall back cleanly to public event bucketing below
      }
    }

    if (!weeks) {
      const bucketCounts = new Array<number>(52).fill(0);
      for (const ev of events) {
        const t = Date.parse(ev.created_at);
        if (Number.isNaN(t)) continue;
        const idx = windows.findIndex((w) => t >= w.start.getTime() && t <= w.end.getTime() + 86_400_000);
        if (idx >= 0) {
          const weight = ev.type === "PushEvent" ? Math.max(1, ev.payload?.commits?.length ?? 1) : 1;
          bucketCounts[idx] = (bucketCounts[idx] ?? 0) + weight;
        }
      }
      for (const repo of ownRepos) {
        if (!repo.pushed_at) continue;
        const t = Date.parse(repo.pushed_at);
        const idx = windows.findIndex((w) => t >= w.start.getTime() && t <= w.end.getTime() + 86_400_000);
        if (idx >= 0 && (bucketCounts[idx] ?? 0) === 0) {
          bucketCounts[idx] = 1;
        }
      }

      weeks = windows.map((w, idx) => ({
        weekIndex: idx,
        weekLabel: w.label,
        dateRange: w.range,
        count: bucketCounts[idx] ?? 0,
      }));
      totalContributions = weeks.reduce((s, w) => s + w.count, 0);
    }

    const fmtShort = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
    const recentActivity: RecentGitHubEvent[] = events.slice(0, 5).map((ev) => {
      const cleanType = ev.type.replace(/Event$/, "");
      const commitMsg = ev.payload?.commits?.[0]?.message?.split("\n")[0];
      const summary =
        commitMsg ||
        (ev.payload?.action ? `${ev.payload.action} ${cleanType.toLowerCase()}` : `Recorded ${cleanType} activity`);
      const dt = new Date(ev.created_at);
      return {
        id: ev.id,
        type: cleanType,
        repo: ev.repo.name,
        summary,
        dateLabel: Number.isNaN(dt.getTime()) ? "Recent" : fmtShort.format(dt),
        url: `https://github.com/${ev.repo.name}`,
      };
    });

    return {
      username: user.login,
      isFallback: false,
      statusBanner: `Live GitHub API · @${user.login} (Cached 1h server-side)`,
      metrics: {
        publicRepos: user.public_repos,
        totalStars,
        totalForks,
        totalContributions,
        contributionsNote,
      },
      languages:
        languages.length > 0
          ? languages
          : [{ name: "Public Repositories", percentage: 100, color: "#D29A5C" }],
      weeks,
      recentActivity,
      fetchedAtIso: new Date().toISOString(),
    };
  } catch {
    return buildFallbackTelemetry("unavailable", rawUsername);
  }
}
