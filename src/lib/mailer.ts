import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendVerificationEmail(to: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/auth/verify?token=${token}`;

  await transporter.sendMail({
    from: `"Pantry Pal Support" <${process.env.GMAIL_USER}>`,
    to,
    subject: '[Pantry Pal] Verify Your Email',
    html: `
      <p>Hi there!</p>
      <p>
        Thanks for signing up for <strong>Pantry Pal</strong>. Please verify your email by
        clicking the button below:
      </p>
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
