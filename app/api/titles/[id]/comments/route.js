import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const { text } = await req.json();
  if (!text || !text.trim()) {
    return Response.json({ error: "Le commentaire est vide." }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { text: text.trim(), userId: session.user.id, titleId: params.id },
    include: { user: { select: { name: true } } },
  });

  return Response.json(comment, { status: 201 });
}
