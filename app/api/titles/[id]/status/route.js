import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

export async function POST(req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const { status } = await req.json();
  if (!["to_watch", "watched"].includes(status)) {
    return Response.json({ error: "Statut invalide." }, { status: 400 });
  }

  const watchStatus = await prisma.watchStatus.upsert({
    where: { userId_titleId: { userId: session.user.id, titleId: id } },
    update: { status },
    create: { status, userId: session.user.id, titleId: id },
  });

  return Response.json(watchStatus);
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non authentifié." }, { status: 401 });

  await prisma.watchStatus.deleteMany({
    where: { userId: session.user.id, titleId: id },
  });

  return Response.json({ ok: true });
}
