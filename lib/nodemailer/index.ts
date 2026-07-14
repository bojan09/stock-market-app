import nodemailer from "nodemailer";
import {
  WELCOME_EMAIL_TEMPLATE,
  NEWS_SUMMARY_EMAIL_TEMPLATE,
  STOCK_ALERT_UPPER_EMAIL_TEMPLATE,
  STOCK_ALERT_LOWER_EMAIL_TEMPLATE,
} from "@/lib/nodemailer/templates";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL!,
    pass: process.env.NODEMAILER_PASSWORD!,
  },
});

export const sendWelcomeEmail = async ({
  email,
  name,
  intro,
}: WelcomeEmailData) => {
  const htmlTemplate = WELCOME_EMAIL_TEMPLATE.replace("{{name}}", name).replace(
    "{{intro}}",
    intro,
  );

  const mailOptions = {
    from: `"Signalist" <signalist@stocks.com>`,
    to: email,
    subject: `Welcome to Signalist - your stock market toolkit is ready!`,
    text: "Thanks for joining Signalist",
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPriceAlertEmail = async ({
  email,
  symbol,
  company,
  alertType,
  currentPrice,
  targetPrice,
  relatedNews,
}: {
  email: string;
  symbol: string;
  company: string;
  alertType: "upper" | "lower";
  currentPrice: number;
  targetPrice: number;
  relatedNews?: { headline: string; url: string; source: string } | null;
}): Promise<void> => {
  const template =
    alertType === "upper"
      ? STOCK_ALERT_UPPER_EMAIL_TEMPLATE
      : STOCK_ALERT_LOWER_EMAIL_TEMPLATE;

  const timestamp = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const relatedNewsSection = relatedNews
    ? `<div style="background-color: #212328; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">
          Likely explanation
        </h3>
        <a href="${relatedNews.url}" style="color: #ffffff; font-size: 15px; line-height: 1.5; text-decoration: none;">
          ${relatedNews.headline}
        </a>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280;">${relatedNews.source}</p>
      </div>`
    : "";

  const htmlTemplate = template
    .replace(/{{symbol}}/g, symbol)
    .replace(/{{company}}/g, company)
    .replace(/{{timestamp}}/g, timestamp)
    .replace(/{{currentPrice}}/g, currentPrice.toFixed(2))
    .replace(/{{targetPrice}}/g, targetPrice.toFixed(2))
    .replace("{{relatedNewsSection}}", relatedNewsSection);

  const mailOptions = {
    from: `"Signalist Alerts" <signalist@stocks.com>`,
    to: email,
    subject: `🔔 ${symbol} hit your ${alertType === "upper" ? "upper" : "lower"} price target`,
    text: `${symbol} is now at $${currentPrice.toFixed(2)}, past your target of $${targetPrice.toFixed(2)}.`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

export const sendNewsSummaryEmail = async ({
  email,
  date,
  newsContent,
}: {
  email: string;
  date: string;
  newsContent: string;
}): Promise<void> => {
  const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE.replace(
    "{{date}}",
    date,
  ).replace("{{newsContent}}", newsContent);

  const mailOptions = {
    from: `"Signalist News" <signalist@stocks.pro>`,
    to: email,
    subject: `📈 Market News Summary Today - ${date}`,
    text: `Today's market news summary from Signalist`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};
