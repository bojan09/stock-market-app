import { inngest } from "@/lib/inngest/client";
import {
  NEWS_SUMMARY_EMAIL_PROMPT,
  PERSONALIZED_WELCOME_EMAIL_PROMPT,
} from "@/lib/inngest/prompts";
import {
  sendNewsSummaryEmail,
  sendWelcomeEmail,
  sendPriceAlertEmail,
} from "@/lib/nodemailer";
import {
  getAllUsersForNewsEmail,
  getUserEmailById,
} from "@/lib/actions/user.actions";
import { getWatchlistSymbolsById } from "@/lib/actions/watchlist.actions";
import { getNews, getStockQuote } from "@/lib/actions/finnhub.actions";
import { getSingleStockNews } from "@/lib/actions/news.actions";
import {
  getActiveAlertsGroupedBySymbol,
  markAlertTriggered,
} from "@/lib/actions/alert.actions";
import { getFormattedTodayDate } from "@/lib/utils";

export type UserForNewsEmail = {
  id: string;
  email: string;
  fullName?: string;
};

export const sendSignUpEmail = inngest.createFunction(
  { id: "sign-up-email" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    const userProfile = `
            - Country: ${event.data.country}
            - Investment goals: ${event.data.investmentGoals}
            - Risk tolerance: ${event.data.riskTolerance}
            - Preferred industry: ${event.data.preferredIndustry}
        `;

    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
      "{{userProfile}}",
      userProfile,
    );

    const response = await step.ai.infer("generate-welcome-intro", {
      model: step.ai.models.gemini({ model: "gemini-flash-latest" }),
      body: {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
    });

    await step.run("send-welcome-email", async () => {
      const part = response.candidates?.[0]?.content?.parts?.[0];
      const introText =
        (part && "text" in part ? part.text : null) ||
        "Thanks for joining Signalist. You now have the tools to track markets and make smarter moves.";

      const {
        data: { email, name },
      } = event;

      return await sendWelcomeEmail({ email, name, intro: introText });
    });

    return {
      success: true,
      message: "Welcome email sent successfully",
    };
  },
);

export const sendDailyNewsSummary = inngest.createFunction(
  { id: "daily-news-summary" },
  [{ event: "app/send.daily.news" }, { cron: "0 12 * * *" }],
  async ({ step }) => {
    // Step #1: Get all users for news delivery
    const users = await step.run("get-all-users", getAllUsersForNewsEmail);

    if (!users || users.length === 0)
      return { success: false, message: "No users found for news email" };

    // Step #2: For each user, get watchlist symbols -> fetch news (fallback to general)
    const results = await step.run("fetch-user-news", async () => {
      const perUser: Array<{
        user: UserForNewsEmail;
        articles: MarketNewsArticle[];
      }> = [];
      for (const user of users as UserForNewsEmail[]) {
        try {
          const symbols = await getWatchlistSymbolsById(user.id);
          let articles = await getNews(symbols);
          // Enforce max 6 articles per user
          articles = (articles || []).slice(0, 6);
          // If still empty, fallback to general
          if (!articles || articles.length === 0) {
            articles = await getNews();
            articles = (articles || []).slice(0, 6);
          }
          perUser.push({ user, articles });
        } catch (e) {
          console.error("daily-news: error preparing user news", user.email, e);
          perUser.push({ user, articles: [] });
        }
      }
      return perUser;
    });

    // Step #3: Summarize news via AI
    const userNewsSummaries: {
      user: UserForNewsEmail;
      newsContent: string | null;
    }[] = [];

    for (const { user, articles } of results) {
      try {
        const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace(
          "{{newsData}}",
          JSON.stringify(articles, null, 2),
        );

        const response = await step.ai.infer(`summarize-news-${user.email}`, {
          model: step.ai.models.gemini({ model: "gemini-flash-latest" }),
          body: {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          },
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        const newsContent =
          (part && "text" in part ? part.text : null) || "No market news.";

        userNewsSummaries.push({ user, newsContent });
      } catch (e) {
        console.error("Failed to summarize news for : ", user.email);
        userNewsSummaries.push({ user, newsContent: null });
      }
    }

    // Step #4: Send the emails
    await step.run("send-news-emails", async () => {
      await Promise.all(
        userNewsSummaries.map(async ({ user, newsContent }) => {
          if (!newsContent) return false;

          return await sendNewsSummaryEmail({
            email: user.email,
            date: getFormattedTodayDate(),
            newsContent,
          });
        }),
      );
    });

    return {
      success: true,
      message: "Daily news summary emails sent successfully",
    };
  },
);

export const checkPriceAlerts = inngest.createFunction(
  { id: "check-price-alerts" },
  { cron: "*/15 * * * *" },
  async ({ step }) => {
    const grouped = await step.run("get-active-alerts", getActiveAlertsGroupedBySymbol);
    const symbols = Object.keys(grouped);

    if (symbols.length === 0) {
      return { success: true, message: "No active alerts to check" };
    }

    const triggered = await step.run("check-quotes-and-notify", async () => {
      const results: Array<{ alertId: string; symbol: string }> = [];

      for (const symbol of symbols) {
        const quote = await getStockQuote(symbol);
        if (!quote || !quote.current) continue;

        const anyHit = grouped[symbol].some((alert) =>
          alert.alertType === "upper"
            ? quote.current >= alert.threshold
            : quote.current <= alert.threshold,
        );
        if (!anyHit) continue;

        let relatedNews: { headline: string; url: string; source: string } | null =
          null;
        try {
          const news = await getSingleStockNews(symbol);
          const top = news.success ? news.articles[0] : null;
          if (top) {
            relatedNews = { headline: top.title, url: top.url, source: top.source };
          }
        } catch (e) {
          console.error("Failed to fetch related news for alert", symbol, e);
        }

        for (const alert of grouped[symbol]) {
          const hit =
            alert.alertType === "upper"
              ? quote.current >= alert.threshold
              : quote.current <= alert.threshold;

          if (!hit) continue;

          const email = await getUserEmailById(alert.userId);
          if (!email) continue;

          try {
            await sendPriceAlertEmail({
              email,
              symbol: alert.symbol,
              company: alert.company,
              alertType: alert.alertType,
              currentPrice: quote.current,
              targetPrice: alert.threshold,
              relatedNews,
            });
            await markAlertTriggered(alert.id);
            results.push({ alertId: alert.id, symbol });
          } catch (e) {
            console.error("Failed to send price alert email", alert.id, e);
          }
        }
      }

      return results;
    });

    return {
      success: true,
      message: `Checked ${symbols.length} symbol(s), triggered ${triggered.length} alert(s)`,
    };
  },
);
