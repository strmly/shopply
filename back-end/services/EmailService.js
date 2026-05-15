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

const renderCodeEmail = ({ subject, actionLine, code, label }) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0;padding:0;background:#f6f9ff;font-family:Inter,Arial,sans-serif;color:#101828">
    <tr>
      <td align="center" style="padding:34px 14px">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #d9e8ff;border-radius:28px;overflow:hidden;box-shadow:0 24px 70px rgba(16,24,40,0.10)">
          <tr>
            <td style="padding:0;background:linear-gradient(135deg,#3d81ef 0%,#5b6ff0 58%,#f59e0b 100%);height:8px;line-height:8px;font-size:1px">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:34px 30px 10px">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,#3d81ef,#2456c9);color:#ffffff;text-align:center;font-weight:900;font-size:22px;line-height:42px">S</td>
                  <td style="padding-left:12px">
                    <div style="font-size:18px;font-weight:900;letter-spacing:0;color:#101828">Shopply</div>
                    <div style="font-size:12px;font-weight:800;color:#3d81ef;text-transform:uppercase;letter-spacing:1px">Secure account code</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 30px 0">
              <h1 style="margin:0;font-size:28px;line-height:1.08;font-weight:900;color:#101828">${subject}</h1>
              <p style="margin:12px 0 0;color:#667085;font-size:15px;line-height:1.55">${actionLine}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:30px">
              <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;background:linear-gradient(135deg,#f1f7ff 0%,#ffffff 56%,#fff7ed 100%);border:1px solid #d9e8ff;border-radius:24px">
                <tr>
                  <td align="center" style="padding:30px 16px">
                    <div style="font-size:11px;font-weight:900;color:#1f4c8b;text-transform:uppercase;letter-spacing:1.4px;margin-bottom:12px">${label}</div>
                    <div style="display:inline-block;padding:16px 22px;border-radius:18px;background:#ffffff;border:1px solid #c7ddff;box-shadow:0 16px 36px rgba(61,129,239,0.16);font-size:36px;line-height:1;font-weight:900;color:#3d81ef;letter-spacing:10px">${code}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px 34px">
              <div style="padding:16px 18px;border-radius:18px;background:#f8fafc;border:1px solid #e4e7ec;color:#667085;font-size:13px;line-height:1.5">
                Expires in 5 minutes. If you did not request this, ignore this email.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

export const sendOtpEmail = async (to, otp, purpose = 'verify') => {
  const isReset = purpose === 'password reset';
  const subject = isReset ? 'Reset your Shopply password' : 'Your Shopply verification code';
  const actionLine = isReset
    ? 'Use the code below to reset your password.'
    : 'Use the code below to verify your email address.';
  const codeLabel = isReset ? 'Reset code' : 'Verification code';

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[email] ${purpose} code for ${to}: ${otp}`);
    return { sent: true, provider: 'console' };
  }

  const info = await getTransporter().sendMail({
    from: process.env.SMTP_FROM || '"Shopply" <noreply@shopply.co.za>',
    to,
    subject,
    text: `${subject}\n\n${actionLine}\n\n${otp}\n\nThis code expires in 5 minutes. If you did not request this, ignore this email.`,
    html: renderCodeEmail({ subject, actionLine, code: otp, label: codeLabel }),
  });

  if (Array.isArray(info.rejected) && info.rejected.length > 0) {
    const error = new Error(`Email was rejected for: ${info.rejected.join(', ')}`);
    error.statusCode = 502;
    throw error;
  }

  return {
    sent: true,
    provider: 'smtp',
    messageId: info.messageId,
    accepted: info.accepted || [],
  };
};
