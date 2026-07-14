import webpush from "web-push";

let configured = false;

function ensureConfigured() {
  if (configured) return;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:support@signalist.app";

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys are not configured");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export async function sendPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: { title: string; body: string; url?: string },
) {
  ensureConfigured();
  return webpush.sendNotification(subscription, JSON.stringify(payload));
}

export { webpush };
