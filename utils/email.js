const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

/**
 * Email class.
 */
module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.fullName = user.fullName;
        this.url = url;
        this.from = `Natours Admin <${process.env.EMAIL_FROM}>`;
    }

    /**
     * Create transporter.
     */
    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            return 1; // TODO: implement real email 
        }
        if (process.env.NODE_ENV === 'development') {
            // transporter
            return nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
                }
            });
        }
    }

    /**
     * Send email.
     * @param {String} template Name of pug template
     * @param {String} subject Mail subject
     */
    async send(template, subject) {
        // redner HTML 
        const html = pug.renderFile(
            `${__dirname}/../views/emails/${template}.pug`,
            {
                fullName: this.fullName,
                url: this.url,
                subject: subject,
            },
        );
        // options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html,
            text: htmlToText(html),
        }
        // create transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    ////////// Mails //////////
    /**
     * Send welcome email.
     */
    async sendWelcome() {
        await this.send('welcome', 'Welcome to BlogPostic!');
    }

    /**
     * Send reset password email.
     */
    async sendPasswordReset() {
        await this.send('password-reset', 'Your password reset token (valid for 10 minutes)');
    }

    /**
    * Send reactivate user token email.
    */
    async sendReactivateUserToken() {
        await this.send('reactivate-user-token', 'Your reactivate user token (valid for 30 minutes)');
    }

    /**
    * Send reactivate user success email.
    */
    async sendReactivateUserSuccess() {
        await this.send('reactivate-user-success', 'Your user account has been successfully reactivated');
    }
}
