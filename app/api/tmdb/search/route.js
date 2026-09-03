import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return Response.json({ error: "TMDb non configuré." }, { status: 501 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  const type = searchParams.get("type") === "series" ? "tv" : "movie";
  if (!query) return Response.json([]);

  const tmdbUrl = new URL(`https://api.themoviedb.org/3/search/${type}`);
  tmdbUrl.searchParams.set("api_key", apiKey);
  tmdbUrl.searchParams.set("query", query);
  tmdbUrl.searchParams.set("language", "fr-FR");

  const res = await fetch(tmdbUrl);
  if (!res.ok) return Response.json({ error: "Erreur TMDb." }, { status: 502 });
  const data = await res.json();

  const results = (data.results || []).slice(0, 6).map((r) => ({
    tmdbId: r.id,
    name: type === "movie" ? r.title : r.name,
    year: (type === "movie" ? r.release_date : r.first_air_date)?.slice(0, 4) || null,
    posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : null,
    synopsis: r.overview || null,
  }));

  return Response.json(results);
}
