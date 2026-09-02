"use client";

import { useState } from "react";
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

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
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
          <div className="field">
            <label htmlFor="name">Titre</label>
            <input id="name" required value={form.name} onChange={update("name")} />
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
          <div className="field">
            <label htmlFor="posterUrl">Lien affiche (optionnel)</label>
            <input id="posterUrl" value={form.posterUrl} onChange={update("posterUrl")} />
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
