import { hashSha256 } from "@/lib/meta-capi";
import { getServerUrl } from "@/lib/server-url";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const RequestSchema = z.object({
  amount: z.number().positive(),           // en centimes (ex: 100 = 1€)
  email: z.string().email().optional().or(z.literal("")),
  name: z.string().optional(),
  productType: z.string().optional(),      // 'trial' | 'donation' | 'upsell'
  productName: z.string().optional(),
  returnUrl: z.string().url().optional(),
  fbp: z.string().nullable().optional(),
  fbc: z.string().nullable().optional(),
  fbEventId: z.string().optional(),        // event_id de InitiateCheckout pour dédup Purchase
});

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const {
      amount,
      email,
      name,
      productType = "trial",
      productName = "Break Free — 7-Day Trial",
      returnUrl,
      fbp,
      fbc,
      fbEventId,
    } = parsed.data;

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      undefined;
    const ua = req.headers.get("user-agent") ?? undefined;

    const origin = req.headers.get("origin") ?? getServerUrl();
    const successUrl =
      returnUrl ?? `${origin}/quiz?state=results&session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: amount,
            product_data: { name: productName },
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      ui_mode: "embedded",
      return_url: successUrl,
      metadata: {
        productType,
        productName,
        fbp: fbp ?? "",
        fbc: fbc ?? "",
        fbEventId: fbEventId ?? "",
        customerName: name ?? "",
      },
    });

    // Sauvegarder la liaison Stripe ↔ Meta pour dédup Purchase
    await prisma.checkoutLinkage.create({
      data: {
        stripeSessionId: session.id,
        fbp: fbp ?? undefined,
        fbc: fbc ?? undefined,
        fbEventId: fbEventId ?? undefined,
        emailHash: email ? hashSha256(email) : undefined,
        clientIp: ip,
        userAgent: ua,
      },
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
