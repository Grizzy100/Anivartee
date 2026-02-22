// server/user-service/src/services/email.service.ts
console.log("LOADED FILE:", import.meta.url);
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

console.log("EMAIL TEMPLATE VERSION: v2.0 MODERN");

const LOGO_URL =
  `${env.FRONTEND_URL}/logo.png` ||
  "https://dummyimage.com/88x88/020617/ffffff.png&text=A";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("[EmailService] SMTP FAILED:", error);
  } else {
    console.log("[EmailService] SMTP READY");
  }
});

export class EmailService {

  // =================================================
  // PUBLIC EMAIL METHODS
  // =================================================

  async sendWelcomeEmail(email: string, username: string, role: string) {

    const roleText =
      role === "FACT_CHECKER" ? "Fact Checker" : "User";

    await transporter.sendMail({
      from: `"Anivartee" <${env.SMTP_USER}>`,
      to: email,
      subject: "Welcome to Anivartee",
      html: this.baseTemplate(
        "Welcome to Anivartee",
        `
        <p>Hi ${username},</p>

        <p>
        Your account has been successfully created as
        <strong>${roleText}</strong>.
        </p>

        <p>
        You can now participate in verification workflows
        and build your reputation.
        </p>
        `
      ),
    });

    logger.info(`Welcome email sent to ${email}`);
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    username: string
  ) {

    const url =
      `${env.FRONTEND_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"Anivartee Security" <${env.SMTP_USER}>`,
      to: email,
      subject: "Reset your password",
      html: this.baseTemplate(
        "Reset your password",
        `
        <p>Hi ${username},</p>

        <p>We received a password reset request.</p>

        ${this.button(url, "Reset password")}

        ${this.linkFallback(url)}

        ${this.warning(
          "This link expires in 1 hour."
        )}
        `
      ),
    });

    logger.info(`Password reset email sent to ${email}`);
  }

  async sendPasswordResetConfirmationEmail(
    email: string,
    username: string
  ) {

    await transporter.sendMail({
      from: `"Anivartee Security" <${env.SMTP_USER}>`,
      to: email,
      subject: "Password updated",
      html: this.baseTemplate(
        "Password updated",
        `
        <p>Hi ${username},</p>

        ${this.success(
          "Your password was successfully changed."
        )}

        <p>
        If you did not perform this action,
        contact support immediately.
        </p>
        `
      ),
    });

    logger.info(`Password reset confirmation sent to ${email}`);
  }

  async sendEmailVerificationEmail(
    email: string,
    token: string,
    username: string
  ) {

    const url =
      `${env.FRONTEND_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
      from: `"Anivartee Security" <${env.SMTP_USER}>`,
      to: email,
      subject: "Verify your email",
      html: this.baseTemplate(
        "Verify your email",
        `
        <p>Hi ${username},</p>

        <p>Please verify your email address.</p>

        ${this.button(url, "Verify email")}

        ${this.linkFallback(url)}
        `
      ),
    });

    logger.info(`Verification email sent to ${email}`);
  }

  // =================================================
  // BASE TEMPLATE
  // =================================================

  private baseTemplate(
    title: string,
    content: string
  ): string {

    return `
<!DOCTYPE html>
<html>
<body style="margin:0;background:#f8fafc;">

<table width="100%" cellpadding="0" cellspacing="0"
style="padding:40px 16px;font-family:Arial,Helvetica,sans-serif;">

<tr>
<td align="center">

<table width="560"
style="background:#ffffff;border-radius:12px;
border:1px solid #e2e8f0;padding:32px;">

${this.logo()}

<tr>
<td align="center"
style="font-size:20px;font-weight:600;padding-bottom:16px;">
${title}
</td>
</tr>

<tr>
<td style="font-size:14px;color:#334155;">
${content}
</td>
</tr>

${this.footer()}

</table>

</td>
</tr>
</table>

</body>
</html>
`;
  }

  // =================================================
  // COMPONENTS
  // =================================================

  private logo(): string {

    return `
<tr>
<td align="center" style="padding-bottom:24px;">
<img src="${LOGO_URL}"
width="44"
height="44"
style="display:block;border-radius:8px;"/>
</td>
</tr>
`;
  }

  private footer(): string {

    return `
<tr>
<td align="center"
style="padding-top:24px;
font-size:12px;color:#64748b;">

© ${new Date().getFullYear()} Anivartee

<br/>

Secure fact-checking infrastructure

</td>
</tr>
`;
  }

  private button(url: string, text: string): string {

    return `
<tr>
<td align="center" style="padding:24px 0;">

<a href="${url}"
style="
background:#020617;
color:#ffffff;
padding:12px 24px;
border-radius:8px;
text-decoration:none;
font-size:14px;
display:inline-block;
">

${text}

</a>

</td>
</tr>
`;
  }

  private linkFallback(url: string): string {

    return `
<tr>
<td>

<div style="
background:#f1f5f9;
padding:12px;
border-radius:8px;
font-size:12px;
word-break:break-all;
margin-top:8px;
">

${url}

</div>

</td>
</tr>
`;
  }

  private warning(text: string): string {

    return `
<tr>
<td>

<div style="
background:#fefce8;
border:1px solid #fde68a;
padding:12px;
border-radius:8px;
margin-top:16px;
font-size:13px;
">

${text}

</div>

</td>
</tr>
`;
  }

  private success(text: string): string {

    return `
<tr>
<td>

<div style="
background:#ecfdf5;
border:1px solid #6ee7b7;
padding:12px;
border-radius:8px;
margin-top:16px;
font-size:13px;
">

${text}

</div>

</td>
</tr>
`;
  }

}