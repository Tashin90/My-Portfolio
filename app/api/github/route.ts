import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    const response = await fetch("https://api.github.com/users/Tashin90/repos?sort=updated&per_page=100", {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "tashin-portfolio" },
      next: { revalidate: 3600 }
    });
    if (!response.ok) return NextResponse.json({ error: "GitHub is temporarily unavailable." }, { status: response.status });
    const repositories = await response.json();
    return NextResponse.json(repositories.map((repo: { name: string; description: string | null; language: string | null; stargazers_count: number; forks_count: number; updated_at: string; html_url: string; topics?: string[] }) => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      updatedAt: repo.updated_at,
      url: repo.html_url,
      topics: repo.topics ?? []
    })));
  } catch {
    return NextResponse.json({ error: "Could not connect to GitHub right now." }, { status: 503 });
  }
}
