import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const title = await prisma.title.findUnique({
    where: { id },
    include: {
      addedBy: { select: { name: true } },
      ratings: { include: { user: { select: { id: true, name: true } } } },
      comments: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!title) return Response.json({ error: "Introuvable." }, { status: 404 });

  const scores = title.ratings.map((r) => r.score);
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

  return Response.json({
    ...title,
    avgRating: avg,
    myRating: title.ratings.find((r) => r.userId === session.user.id)?.score ?? null,
  });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const title = await prisma.title.findUnique({ where: { id } });
  if (!title) return Response.json({ error: "Introuvable." }, { status: 404 });
  if (title.addedById !== session.user.id) {
    return Response.json({ error: "Seul l'ajouteur peut supprimer ce titre." }, { status: 403 });
  }

  await prisma.title.delete({ where: { id } });
  return Response.json({ ok: true });
}
