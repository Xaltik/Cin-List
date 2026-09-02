"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", inviteCode: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/register", {
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
    router.push("/login");
  }

  return (
    <div className="auth-shell">
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Créer un compte</h1>
      <p className="help-text" style={{ marginBottom: 28 }}>
        Il te faut le code d'invitation partagé par le groupe.
      </p>
      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Prénom</label>
          <input id="name" required value={form.name} onChange={update("name")} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={update("email")}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={update("password")}
          />
        </div>
        <div className="field">
          <label htmlFor="inviteCode">Code d'invitation</label>
          <input
            id="inviteCode"
            required
            value={form.inviteCode}
            onChange={update("inviteCode")}
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>
      <p className="help-text" style={{ marginTop: 20 }}>
        Déjà inscrit ? <Link href="/login" style={{ color: "var(--gold)" }}>Se connecter</Link>
      </p>
    </div>
  );
}
