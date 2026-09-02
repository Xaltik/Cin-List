import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";

export async function POST(req) {
  try {
    const { name, email, password, inviteCode } = await req.json();

    if (!name || !email || !password || !inviteCode) {
      return Response.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }

    if (inviteCode !== process.env.INVITE_CODE) {
      return Response.json({ error: "Code d'invitation incorrect." }, { status: 403 });
    }

    if (password.length < 6) {
      return Response.json(
        { error: "Le mot de passe doit faire au moins 6 caractères." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return Response.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name: name.trim(), email: normalizedEmail, passwordHash },
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
