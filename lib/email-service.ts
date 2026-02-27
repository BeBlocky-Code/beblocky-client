import { ContactFormNotification } from "@/components/email/contact-form-notification";
import { ContactFormConfirmation } from "@/components/email/contact-form-confirmation";
import { render } from "@react-email/components";

export interface ContactFormData {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  userId?: string;
  userType?: string;
}

export interface EmailConfig {
  adminEmail: string;
  appUrl: string;
  adminDashboardUrl?: string;
  helpCenterUrl?: string;
}

class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  /**
   * Send contact form notification to admin
   */
  async sendContactFormNotification(
    contactData: ContactFormData,
    adminName?: string
  ): Promise<boolean> {
    try {
      const emailHtml = await render(
        ContactFormNotification({
          adminName,
          contactData,
          adminDashboardUrl:
            this.config.adminDashboardUrl ||
            `${this.config.appUrl}/admin/contact`,
          termsUrl: `${this.config.appUrl}/terms`,
        })
      );

      console.log("📧 [Email Service] Sending contact form notification:", {
        to: this.config.adminEmail,
        subject: `New Contact Form Submission: ${contactData.subject}`,
      });

      console.log(
        "📧 [Email Service] Email HTML generated:",
        emailHtml.substring(0, 500) + "..."
      );

      await new Promise((resolve) => setTimeout(resolve, 500));

      return true;
    } catch (error) {
      console.error(
        "❌ [Email Service] Failed to send contact form notification:",
        error
      );
      return false;
    }
  }

  /**
   * Send contact form confirmation to user
   */
  async sendContactFormConfirmation(
    userEmail: string,
    subject: string,
    messagePreview: string,
    userName?: string
  ): Promise<boolean> {
    try {
      const emailHtml = await render(
        ContactFormConfirmation({
          userEmail,
          subject,
          messagePreview,
          userName,
          helpCenterUrl:
            this.config.helpCenterUrl || `${this.config.appUrl}/help`,
        })
      );

      console.log("📧 [Email Service] Sending contact form confirmation:", {
        to: userEmail,
        subject: `We received your message: ${subject}`,
      });

      console.log(
        "📧 [Email Service] Confirmation email HTML:",
        emailHtml.substring(0, 500) + "..."
      );

      await new Promise((resolve) => setTimeout(resolve, 500));

      return true;
    } catch (error) {
      console.error(
        "❌ [Email Service] Failed to send contact form confirmation:",
        error
      );
      return false;
    }
  }

  /**
   * Send email verification email
   */
  async sendEmailVerification(
    userEmail: string,
    userName: string,
    verificationLink: string
  ): Promise<boolean> {
    try {
      // TODO: Implement email verification sending
      console.log("📧 [Email Service] Sending email verification:", {
        to: userEmail,
        userName,
        verificationLink,
      });

      return true;
    } catch (error) {
      console.error(
        "❌ [Email Service] Failed to send email verification:",
        error
      );
      return false;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    userEmail: string,
    userName: string
  ): Promise<boolean> {
    try {
      // TODO: Implement welcome email sending
      console.log("📧 [Email Service] Sending welcome email:", {
        to: userEmail,
        userName,
      });

      return true;
    } catch (error) {
      console.error("❌ [Email Service] Failed to send welcome email:", error);
      return false;
    }
  }
}

const defaultEmailService = new EmailService({
  adminEmail: process.env.ADMIN_EMAIL || "app@beblocky.com",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://code.beblocky.com",
  adminDashboardUrl: process.env.ADMIN_DASHBOARD_URL,
  helpCenterUrl: process.env.HELP_CENTER_URL,
});

export const sendContactFormNotification = (
  contactData: ContactFormData,
  adminName?: string
) => defaultEmailService.sendContactFormNotification(contactData, adminName);

export const sendContactFormConfirmation = (
  userEmail: string,
  subject: string,
  messagePreview: string,
  userName?: string
) =>
  defaultEmailService.sendContactFormConfirmation(
    userEmail,
    subject,
    messagePreview,
    userName
  );

export const sendEmailVerification = (
  userEmail: string,
  userName: string,
  verificationLink: string
) =>
  defaultEmailService.sendEmailVerification(
    userEmail,
    userName,
    verificationLink
  );

export const sendWelcomeEmail = (userEmail: string, userName: string) =>
  defaultEmailService.sendWelcomeEmail(userEmail, userName);

export { EmailService };
export default defaultEmailService;
