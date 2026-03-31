"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const emailModel_1 = require("../models/message/emailModel");
const companyModel_1 = require("../models/company/companyModel");
function sendEmail(username, userEmail, emailName, data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // ✅ Only send emails in development environment
            if (process.env.NODE_ENV !== 'development') {
                console.log(`Email sending skipped: ${process.env.NODE_ENV} environment`);
                return true; // Return success so it doesn't break app logic
            }
            const templatePath = path_1.default.join(process.cwd(), 'public', 'templates', 'emailTemplate.html');
            let templateContent = yield fs_1.promises.readFile(templatePath, 'utf-8');
            const email = yield emailModel_1.Email.findOne({ name: emailName });
            const [company] = yield companyModel_1.Company.find();
            if (!email)
                throw new Error(`Email template '${emailName}' not found`);
            if (!company)
                throw new Error('Company information is missing');
            let content = email.content;
            content = String(content)
                .replace('{{username}}', username)
                .replace('{{greetings}}', String(email.greetings));
            templateContent = templateContent
                .replace(/{{title}}/g, email.title)
                .replace(/{{content}}/g, content)
                .replace(/{{username}}/g, username)
                .replace(/{{domain}}/g, company.domain)
                .replace(/{{companyName}}/g, company.name)
                .replace(/{{greetings}}/g, String(email.greetings))
                .replace(/{{logo}}/g, `${company.domain}/images/NewLogo.png`)
                .replace(/{{whiteLogo}}/g, `${company.domain}/images/NewLogoWhite.png`);
            const transporter = nodemailer_1.default.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '465'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: company.email,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });
            const mailOptions = {
                from: process.env.EMAIL_USERNAME,
                to: userEmail,
                subject: email.title,
                html: templateContent,
            };
            yield transporter.sendMail(mailOptions);
            return true;
        }
        catch (error) {
            if (error instanceof Error) {
                console.error('Error sending email:', {
                    message: error.message,
                    user: userEmail,
                });
            }
            else {
                console.error('Unexpected error:', error);
            }
            return false;
        }
    });
}
