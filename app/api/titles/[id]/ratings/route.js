import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

export async function POST(req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const { score } = await req.json();
  const n = parseInt(score, 10);
  if (!Number.isInteger(n) || n < 1 || n > 10) {
    return Response.json({ error: "La note doit être entre 1 et 10." }, { status: 400 });
  }

  const rating = await prisma.rating.upsert({
    where: { userId_titleId: { userId: session.user.id, titleId: id } },
    update: { score: n },
    create: { score: n, userId: session.user.id, titleId: id },
  });

  return Response.json(rating);
}
