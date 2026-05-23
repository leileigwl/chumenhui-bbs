import nodemailer from 'nodemailer'

function createTransport() {
  const host = process.env['SMTP_HOST'] ?? 'smtp.163.com'
  const port = parseInt(process.env['SMTP_PORT'] ?? '465', 10)
  const secure = process.env['SMTP_SECURE'] !== 'false' // default true
  const user = process.env['SMTP_USER'] ?? ''
  const pass = process.env['SMTP_PASS'] ?? ''

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
}

/**
 * Send a password-reset email containing a clickable reset URL.
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
): Promise<void> {
  const transport = createTransport()
  const from = process.env['SMTP_FROM'] ?? `楚门会 <${process.env['SMTP_USER']}>`

  await transport.sendMail({
    from,
    to: email,
    subject: '【楚门会】重置密码',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>重置您的密码</h2>
        <p>我们收到了您的密码重置请求，点击下方按钮完成重置：</p>
        <a
          href="${resetUrl}"
          style="
            display: inline-block;
            padding: 12px 24px;
            background: #6366f1;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
            margin: 16px 0;
          "
        >重置密码</a>
        <p style="color: #888; font-size: 13px;">
          链接有效期 1 小时。若非本人操作，请忽略此邮件。
        </p>
        <p style="color: #888; font-size: 13px;">
          如按钮无法点击，请复制以下链接到浏览器：<br/>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
      </div>
    `,
    text: `重置密码链接（1 小时内有效）：${resetUrl}`,
  })
}
