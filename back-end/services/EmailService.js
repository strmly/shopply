import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
  return transporter;
};

export const sendOtpEmail = async (to, otp, purpose = 'verify') => {
  const isReset = purpose === 'password reset';
  const subject = isReset ? 'Reset your Tsenga password' : 'Your Tsenga verification code';
  const actionLine = isReset
    ? 'Use the code below to reset your password.'
    : 'Use the code below to verify your email address.';

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[email] ${purpose} code for ${to}: ${otp}`);
    return { sent: true, provider: 'console' };
  }

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || '"Tsenga" <noreply@tsenga.co.za>',
    to,
    subject,
    text: `${subject}\n\n${actionLine}\n\n${otp}\n\nThis code expires in 5 minutes. If you did not request this, ignore this email.`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:34px 24px;background:#ffffff">
        <div style="display:inline-block;padding:8px 12px;border-radius:999px;background:#e8f1ff;color:#1f4c8b;font-size:12px;font-weight:900;margin-bottom:22px">Tsenga</div>
        <h1 style="font-size:24px;line-height:1.1;font-weight:900;color:#101828;margin:0 0 8px">${subject}</h1>
        <p style="color:#667085;margin:0 0 28px;font-size:14px;line-height:1.5">${actionLine}</p>
        <div style="display:inline-block;padding:18px 30px;background:linear-gradient(135deg,#f1f7ff,#f3f0fe);border:1px solid #d9e8ff;border-radius:18px;letter-spacing:10px;font-size:32px;font-weight:900;color:#3d81ef">${otp}</div>
        <p style="color:#98a2b3;font-size:12px;margin:28px 0 0">Expires in 5 minutes. If you did not request this, ignore this email.</p>
      </div>
    `,
  });

  return { sent: true, provider: 'smtp' };
};
