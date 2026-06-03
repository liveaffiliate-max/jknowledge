import { Webhook } from "svix"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"

type ClerkUserEvent = {
  type: "user.created" | "user.updated" | "user.deleted"
  data: {
    id: string
    email_addresses: { email_address: string; id: string }[]
    first_name: string | null
    last_name: string | null
    primary_email_address_id: string | null
  }
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) {
    return new Response("CLERK_WEBHOOK_SECRET not set", { status: 500 })
  }

  // ── Verify signature ──────────────────────────────────────────────────────
  const headerPayload = await headers()
  const svixId        = headerPayload.get("svix-id")
  const svixTimestamp = headerPayload.get("svix-timestamp")
  const svixSignature = headerPayload.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  const body = await req.text()
  const wh   = new Webhook(secret)

  let event: ClerkUserEvent
  try {
    event = wh.verify(body, {
      "svix-id":        svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent
  } catch {
    return new Response("Invalid webhook signature", { status: 400 })
  }

  // ── Handle events ─────────────────────────────────────────────────────────
  const { type, data } = event

  if (type === "user.created" || type === "user.updated") {
    const primaryEmail = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id
    )
    const email = primaryEmail?.email_address ?? null
    const name  = [data.first_name, data.last_name].filter(Boolean).join(" ") || null

    await prisma.user.upsert({
      where:  { clerkId: data.id },
      update: { email, name },
      create: { clerkId: data.id, email, name },
    })
  }

  if (type === "user.deleted") {
    await prisma.user.deleteMany({ where: { clerkId: data.id } })
  }

  return new Response("OK", { status: 200 })
}
