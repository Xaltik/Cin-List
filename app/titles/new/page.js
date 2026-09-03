"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";

export default function NewTitlePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    type: "movie",
    year: "",
    posterUrl: "",
    synopsis: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const skipSearch = useRef(false);
  const searchId = useRef(0);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  useEffect(() => {
    if (skipSearch.current) {
      skipSearch.current = false;
      return;
    }
    const query = form.name.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const id = ++searchId.current;
    setSearching(true);
    const timer = setTimeout(() => {
      fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}&type=${form.type}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          if (id !== searchId.current) return;
          setSuggestions(Array.isArray(data) ? data : []);
        })
        .catch(() => setSuggestions([]))
        .finally(() => {
          if (id === searchId.current) setSearching(false);
        });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [form.name, form.type]);

  function pickSuggestion(s) {
    skipSearch.current = true;
    setSuggestions([]);
    setForm((f) => ({
      ...f,
      name: s.name,
      year: s.year || f.year,
      posterUrl: s.posterUrl || f.posterUrl,
      synopsis: s.synopsis || f.synopsis,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/titles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Une erreur est survenue.");
      return;
    }
    router.push(`/titles/${data.id}`);
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-head">
          <h1>Ajouter un titre</h1>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="field" style={{ position: "relative" }}>
            <label htmlFor="name">Titre</label>
            <input
              id="name"
              required
              autoComplete="off"
              value={form.name}
              onChange={update("name")}
            />
            {searching && (
              <p className="help-text" style={{ marginTop: 6 }}>
                Recherche TMDb...
              </p>
            )}
            {suggestions.length > 0 && (
              <div className="tmdb-suggestions">
                {suggestions.map((s) => (
                  <button
                    type="button"
                    key={s.tmdbId}
                    className="tmdb-suggestion"
                    onClick={() => pickSuggestion(s)}
                  >
                    {s.posterUrl ? (
                      <img src={s.posterUrl} alt="" />
                    ) : (
                      <div className="tmdb-suggestion-noposter" />
                    )}
                    <div>
                      <div className="tmdb-suggestion-name">{s.name}</div>
                      {s.year && <div className="help-text">{s.year}</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="field">
            <label htmlFor="type">Type</label>
            <select id="type" value={form.type} onChange={update("type")}>
              <option value="movie">Film</option>
              <option value="series">Série</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="year">Année (optionnel)</label>
            <input id="year" type="number" value={form.year} onChange={update("year")} />
          </div>
          <div className="field" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="posterUrl">Lien affiche (optionnel)</label>
              <input id="posterUrl" value={form.posterUrl} onChange={update("posterUrl")} />
            </div>
            {form.posterUrl && (
              <img
                src={form.posterUrl}
                alt=""
                className="poster-preview"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
          </div>
          <div className="field">
            <label htmlFor="synopsis">Résumé (optionnel)</label>
            <textarea id="synopsis" value={form.synopsis} onChange={update("synopsis")} />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Ajout..." : "Ajouter"}
          </button>
        </form>
      </div>
    </>
  );
}
