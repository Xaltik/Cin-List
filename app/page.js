"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function HomePage() {
  const [titles, setTitles] = useState(null);
  const [tab, setTab] = useState("ranking"); // ranking | recent
  const [typeFilter, setTypeFilter] = useState("all"); // all | movie | series

  useEffect(() => {
    fetch("/api/titles")
      .then((r) => r.json())
      .then(setTitles);
  }, []);

  if (!titles) {
    return (
      <>
        <Navbar />
        <div className="container">
          <p className="help-text" style={{ marginTop: 40 }}>
            Chargement...
          </p>
        </div>
      </>
    );
  }

  let filtered = titles.filter((t) => typeFilter === "all" || t.type === typeFilter);

  if (tab === "ranking") {
    filtered = [...filtered].sort((a, b) => {
      if (a.avgRating === null) return 1;
      if (b.avgRating === null) return -1;
      return b.avgRating - a.avgRating;
    });
  } else {
    filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-head">
          <div>
            <h1>Ce qu'on regarde</h1>
            <p className="eyebrow">
              {titles.length} titre{titles.length > 1 ? "s" : ""} ajouté
              {titles.length > 1 ? "s" : ""} par la bande
            </p>
          </div>
          <Link href="/titles/new" className="btn">
            + Ajouter un titre
          </Link>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === "ranking" ? "active" : ""}`} onClick={() => setTab("ranking")}>
            Classement
          </button>
          <button className={`tab ${tab === "recent" ? "active" : ""}`} onClick={() => setTab("recent")}>
            Récents
          </button>
          <span style={{ flex: 1 }} />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--paper-dim)",
              fontSize: 14,
            }}
          >
            <option value="all">Tout</option>
            <option value="movie">Films</option>
            <option value="series">Séries</option>
          </select>
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <h2>Rien pour l'instant</h2>
            <p>Ajoute le premier film ou la première série à noter.</p>
          </div>
        )}

        {filtered.map((t, i) => (
          <Link key={t.id} href={`/titles/${t.id}`} style={{ display: "block" }}>
            <div className={`ticket ${tab === "ranking" && t.avgRating !== null ? "ranked" : ""}`}>
              <div className={`ticket-rank ${tab === "ranking" && i === 0 && t.avgRating !== null ? "top" : ""}`}>
                {tab === "ranking" ? i + 1 : "•"}
              </div>
              <div className="ticket-body">
                <a>{t.name}</a>
                <div className="ticket-meta">
                  <span className="pill">{t.type === "movie" ? "Film" : "Série"}</span>
                  {t.year && <span>{t.year}</span>}
                  <span>ajouté par {t.addedByName}</span>
                  <span>
                    {t.ratingCount} note{t.ratingCount !== 1 ? "s" : ""}
                  </span>
                  <span>
                    {t.commentCount} commentaire{t.commentCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className={`score-stamp ${t.avgRating === null ? "empty" : ""}`}>
                {t.avgRating === null ? "—" : t.avgRating.toFixed(1)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
