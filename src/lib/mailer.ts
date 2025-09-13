// src/lib/mailer.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// 🔑 Old function (link-based) — keep it if you still want fallback magic links
export async function sendVerificationEmail(to: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/auth/verify?token=${token}`;

  await transporter.sendMail({
    from: `"Pantry Pal Support" <${process.env.GMAIL_USER}>`,
    to,
    subject: '[Pantry Pal] Verify Your Email',
    html: `
      <p>Hi there!</p>
      <p>Thanks for signing up for <strong>Pantry Pal</strong>. Please verify your email by clicking below:</p>
      <p style="text-align: center; margin: 20px 0;">
        <a href="${verificationUrl}" style="
          background-color: #28a745;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        ">Verify Email</a>
      </p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not create an account, you can safely ignore this email.</p>
      <p>— The Pantry Pal Team</p>
    `,
  });
}

export async function sendVerificationCode(to: string, code: string) {
  await transporter.sendMail({
    from: `"Pantry Pal Support" <${process.env.GMAIL_USER}>`,
    to,
    subject: '[Pantry Pal] Your Verification Code',
    html: `
      <p>Hi there!</p>
      <p>Thanks for signing up for <strong>Pantry Pal</strong>. Use the following code to verify your email:</p>
      <p style="text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
        ${code}
      </p>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not create an account, you can safely ignore this email.</p>
      <p>— The Pantry Pal Team</p>
    `,
  });
}
