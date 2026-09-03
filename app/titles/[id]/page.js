"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "../../../components/Navbar";

export default function TitleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [savingScore, setSavingScore] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  function load() {
    fetch(`/api/titles/${id}`)
      .then((r) => r.json())
      .then(setTitle);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  async function rate(score) {
    setSavingScore(true);
    await fetch(`/api/titles/${id}/ratings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score }),
    });
    setSavingScore(false);
    load();
  }

  async function setStatus(status) {
    setSavingStatus(true);
    if (title.myStatus === status) {
      await fetch(`/api/titles/${id}/status`, { method: "DELETE" });
    } else {
      await fetch(`/api/titles/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    }
    setSavingStatus(false);
    load();
  }

  async function postComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPostingComment(true);
    await fetch(`/api/titles/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: commentText }),
    });
    setCommentText("");
    setPostingComment(false);
    load();
  }

  async function handleDelete() {
    if (!confirm("Supprimer ce titre et toutes ses notes/commentaires ?")) return;
    await fetch(`/api/titles/${id}`, { method: "DELETE" });
    router.push("/");
  }

  if (!title) {
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

  const isOwner = title.addedById === session?.user?.id;

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="detail-head" style={{ display: "flex", gap: 20 }}>
          {title.posterUrl && (
            <img
              src={title.posterUrl}
              alt=""
              className="poster-thumb"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <div>
            <span className="pill">{title.type === "movie" ? "Film" : "Série"}</span>
            <h1 style={{ marginTop: 10 }}>
              {title.name} {title.year && <span style={{ color: "var(--paper-dim)" }}>({title.year})</span>}
            </h1>
            <p className="help-text" style={{ marginTop: 8 }}>
              Ajouté par {title.addedBy.name}
              {title.avgRating !== null && (
                <> · note moyenne <strong style={{ color: "var(--gold)" }}>{title.avgRating.toFixed(1)}/10</strong></>
              )}
            </p>
          </div>
        </div>

        {title.synopsis && <p style={{ color: "var(--paper-dim)" }}>{title.synopsis}</p>}

        <div className="status-row">
          <button
            className={`status-btn ${title.myStatus === "to_watch" ? "active" : ""}`}
            disabled={savingStatus}
            onClick={() => setStatus("to_watch")}
          >
            À voir
          </button>
          <button
            className={`status-btn ${title.myStatus === "watched" ? "active" : ""}`}
            disabled={savingStatus}
            onClick={() => setStatus("watched")}
          >
            Vu
          </button>
        </div>

        <div className="rating-row">
          <span className="help-text">Ta note :</span>
          <div className="score-picker">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`score-btn ${title.myRating === n ? "selected" : ""}`}
                disabled={savingScore}
                onClick={() => rate(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <p className="help-text">
          {title.ratings.length} personne{title.ratings.length !== 1 ? "s ont" : " a"} noté ce titre
          {title.ratings.length > 0 && (
            <>
              {" "}
              (
              {title.ratings.map((r) => `${r.user.name}: ${r.score}`).join(", ")}
              )
            </>
          )}
        </p>

        {isOwner && (
          <button className="btn-ghost btn" style={{ marginTop: 12 }} onClick={handleDelete}>
            Supprimer ce titre
          </button>
        )}

        <hr className="divider" />

        <h2 style={{ fontSize: 20, marginBottom: 16 }}>Commentaires</h2>

        <form onSubmit={postComment} style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <div className="field" style={{ flex: 1, marginBottom: 0 }}>
            <textarea
              placeholder="Ton avis sur ce titre..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{ minHeight: 44 }}
            />
          </div>
          <button className="btn" type="submit" disabled={postingComment} style={{ alignSelf: "flex-start" }}>
            Publier
          </button>
        </form>

        {title.comments.length === 0 && <p className="help-text">Aucun commentaire pour l'instant.</p>}

        {title.comments.map((c) => (
          <div key={c.id} className="comment">
            <div className="comment-meta">
              <strong>{c.user.name}</strong> · {new Date(c.createdAt).toLocaleDateString("fr-FR")}
            </div>
            <p style={{ margin: 0 }}>{c.text}</p>
          </div>
        ))}
      </div>
    </>
  );
}
