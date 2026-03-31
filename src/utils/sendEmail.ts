import nodemailer from 'nodemailer'
import { promises as fs } from 'fs'
import path from 'path'
import { Email } from '../models/message/emailModel'
import { Company } from '../models/company/companyModel'

export async function sendEmail(
  username: string,
  userEmail: string,
  emailName: string,
  data?: Record<string, any>
): Promise<boolean> {
  try {
    // ✅ Only send emails in development environment
    if (process.env.NODE_ENV !== 'development') {
      console.log(`Email sending skipped: ${process.env.NODE_ENV} environment`)
      return true // Return success so it doesn't break app logic
    }

    const templatePath = path.join(
      process.cwd(),
      'public',
      'templates',
      'emailTemplate.html'
    )

    let templateContent = await fs.readFile(templatePath, 'utf-8')

    const email = await Email.findOne({ name: emailName })
    const [company] = await Company.find()

    if (!email) throw new Error(`Email template '${emailName}' not found`)
    if (!company) throw new Error('Company information is missing')

    let content = email.content

    content = String(content)
      .replace('{{username}}', username)
      .replace('{{greetings}}', String(email.greetings))

    templateContent = templateContent
      .replace(/{{title}}/g, email.title)
      .replace(/{{content}}/g, content)
      .replace(/{{username}}/g, username)
      .replace(/{{domain}}/g, company.domain)
      .replace(/{{companyName}}/g, company.name)
      .replace(/{{greetings}}/g, String(email.greetings))
      .replace(/{{logo}}/g, `${company.domain}/images/NewLogo.png`)
      .replace(/{{whiteLogo}}/g, `${company.domain}/images/NewLogoWhite.png`)

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: company.email,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: userEmail,
      subject: email.title,
      html: templateContent,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error sending email:', {
        message: error.message,
        user: userEmail,
      })
    } else {
      console.error('Unexpected error:', error)
    }
    return false
  }
}
