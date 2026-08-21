import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { email, message } = await request.json()

    // Validate inputs
    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required" },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    // Create SMTP transporter from env vars
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10)
    const smtpUser = process.env.SMTP_USER
    const smtpPassword = process.env.SMTP_PASSWORD
    const fromEmail = process.env.FROM_EMAIL || "no-reply@yourdomain.com"

    if (!smtpHost || !smtpUser || !smtpPassword) {
      console.error("[v0] SMTP configuration missing")
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      )
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    })

    // Send thank you email to the user
    const portfolioUrl = "https://prashyam-portfolio.prashyamsmitra.workers.dev/"
    const projectLinks = [
      "https://care-sync-taupe.vercel.app/",
      "https://cv-analyzer-frontend-mu.vercel.app/",
      "https://smartlink-gules.vercel.app/",
    ]
    const featuredProject = projectLinks[Math.floor(Math.random() * projectLinks.length)]

    await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: "Thank you for stopping by!",
      text: `Hey,

Just wanted to say a genuine thank you for visiting my portfolio and sharing your email.

I'm still learning, building, breaking things, and figuring out how to make each project a little better. So having someone take the time to explore what I've built genuinely means a lot to me.

If you came across something interesting, I'd love to know what you thought. And if you're working on something yourself, maybe there's an opportunity for us to build something together.

Here's another project you might find interesting:

${featuredProject}

Thanks again for stopping by — I really appreciate it.

Maybe this visit turns into a conversation, an idea, or even something we build together.

— Prashyam
${portfolioUrl}`,
    })

    // Notify the portfolio owner
    await transporter.sendMail({
      from: fromEmail,
      to: "prashyam.mitra@outlook.com",
      subject: `New message from ${email}`,
      text: `Name: ${email}\n\nMessage:\n${message}`,
    })

    console.log("[v0] Contact form submission sent emails to:", { to: email, owner: "prashyam.mitra@outlook.com" })

    return NextResponse.json(
      { 
        success: true, 
        message: "Message received! I'll get back to you soon.",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] Contact form error:", error)
    return NextResponse.json(
      { error: "Failed to process your message" },
      { status: 500 }
    )
  }
}
