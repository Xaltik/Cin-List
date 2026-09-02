import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const titles = await prisma.title.findMany({
    include: {
      addedBy: { select: { name: true } },
      ratings: { select: { score: true, userId: true } },
      comments: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const withStats = titles.map((t) => {
    const scores = t.ratings.map((r) => r.score);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    return {
      id: t.id,
      name: t.name,
      type: t.type,
      year: t.year,
      posterUrl: t.posterUrl,
      synopsis: t.synopsis,
      addedByName: t.addedBy.name,
      createdAt: t.createdAt,
      avgRating: avg,
      ratingCount: scores.length,
      commentCount: t.comments.length,
    };
  });

  return Response.json(withStats);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const { name, type, year, posterUrl, synopsis } = await req.json();
  if (!name || !type) {
    return Response.json({ error: "Nom et type sont requis." }, { status: 400 });
  }
  if (!["movie", "series"].includes(type)) {
    return Response.json({ error: "Type invalide." }, { status: 400 });
  }

  const title = await prisma.title.create({
    data: {
      name: name.trim(),
      type,
      year: year ? parseInt(year, 10) : null,
      posterUrl: posterUrl || null,
      synopsis: synopsis || null,
      addedById: session.user.id,
    },
  });

  return Response.json(title, { status: 201 });
}
