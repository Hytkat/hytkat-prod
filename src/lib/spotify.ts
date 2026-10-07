import fs from "node:fs";
import { EXTRA_LINKS, HIDE } from "../data";

export type Release = {
  id: string;
  name: string;
  year: string;
  date: string;
  type: string;
  cover: string;
  url: string;
  by?: string;
};

const id = import.meta.env.SPOTIFY_CLIENT_ID as string;
const secret = import.meta.env.SPOTIFY_CLIENT_SECRET as string;
const FILE = ".cache/releases.json";
const TTL = 60 * 60 * 1000;

function readCache(fresh: boolean): Release[] | null {
  try {
    const j = JSON.parse(fs.readFileSync(FILE, "utf8"));
    if (!fresh || Date.now() - j.at < TTL) return j.data;
  } catch {}
  return null;
}

async function api(path: string, token: string) {
  const r = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok)
    throw new Error(
      `Spotify ${r.status} retry-after=${r.headers.get("retry-after")}s on ${path.split("?")[0]}: ${await r.text()}`,
    );
  return r.json();
}

async function fetchReleases(): Promise<Release[]> {
  if (!id || !secret) return [];
  try {
    const t = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    }).then((r) => r.json());
    const artist = import.meta.env.SPOTIFY_ARTIST_ID;
    if (!artist) throw new Error("Set SPOTIFY_ARTIST_ID in .env");
    let items: any[] = [];
    for (let o = 0; o < 30; o += 10) {
      const page = await api(
        `/artists/${artist}/albums?limit=10&offset=${o}`,
        t.access_token,
      );
      items.push(...page.items);
      if (page.items.length < 10) break;
    }
    const seen = new Set<string>();
    const ck = (u: string) => (u ? u.split("/").pop()!.slice(-24) : "");
    return [...extra, ...own].filter((r) => {
      const a = r.name.toLowerCase(), b = ck(r.cover);
      if (seen.has(a) || (b && seen.has(b))) return false;
      seen.add(a);
      if (b) seen.add(b);
      return true;
    });
    const own: Release[] = items
      .filter(
        (a) =>
          a.album_type !== "compilation" &&
          !HIDE.some((h) => h.toLowerCase() === a.name.toLowerCase()) &&
          !seen.has(a.name) &&
          seen.add(a.name),
      )
      .map((a) => ({
        id: a.id,
        name: a.name,
        year: a.release_date.slice(0, 4),
        date: a.release_date,
        type: a.album_type === "single" ? "Single" : "Album",
        cover: a.images[0]?.url,
        url: a.external_urls.spotify,
      }));
    const extra: Release[] = [];
    for (const u of EXTRA_LINKS) {
      const m = u.match(/(track|album)\/([A-Za-z0-9]+)/);
      if (!m) continue;
      try {
        const x = await api(`/${m[1]}s/${m[2]}`, t.access_token);
        const alb = m[1] === "track" ? x.album : x;
        extra.push({
          id: x.id,
          name: x.name,
          year: alb.release_date.slice(0, 4),
          date: alb.release_date,
          type: m[1] === "track" ? "Track" : "Album",
          by: x.artists.map((a: any) => a.name).join(", "),
          cover: alb.images[0]?.url,
          url: x.external_urls.spotify,
        });
      } catch (e) {
        console.warn("Skipped link", u, e);
      }
    }
    return [...extra, ...own].sort((a, b) => b.date.localeCompare(a.date));
  } catch (e) {
    console.warn("Spotify fetch failed:", e);
    return [];
  }
}
async function oembed(u: string): Promise<Release | null> {
  try {
    const x = await fetch("https://open.spotify.com/oembed?url=" + encodeURIComponent(u)).then((r) => r.json());
    return { id: u, name: x.title, year: "", date: "0000", type: /album/.test(u) ? "Album" : "Track", cover: x.thumbnail_url, url: u };
  } catch {
    return null;
  }
}
export async function getReleases(): Promise<Release[]> {
  const hit = readCache(true);
  if (hit) return hit;
  const data = await fetchReleases();
  if (data.length) {
    fs.mkdirSync(".cache", { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify({ at: Date.now(), data }));
    return data;
  }
  const old = readCache(false);
  if (old) return old;
  return (await Promise.all(EXTRA_LINKS.map(oembed))).filter(Boolean) as Release[];
}
