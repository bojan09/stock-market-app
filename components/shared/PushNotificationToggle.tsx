"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import {
  saveSubscription,
  removeSubscription,
} from "@/lib/actions/pushSubscription.actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export default function PushNotificationToggle({ userId }: { userId: string }) {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isSupported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setSupported(isSupported);

    if (!isSupported) return;

    navigator.serviceWorker.getRegistration().then(async (reg) => {
      const sub = await reg?.pushManager.getSubscription();
      setSubscribed(!!sub);
    });
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Notification permission denied");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        toast.error("Push notifications aren't configured");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const raw = subscription.toJSON();
      const result = await saveSubscription(userId, {
        endpoint: raw.endpoint!,
        keys: { p256dh: raw.keys!.p256dh, auth: raw.keys!.auth },
      });

      if (result.success) {
        setSubscribed(true);
        toast.success("Push alerts enabled for this browser");
      } else {
        toast.error(result.error || "Failed to enable push alerts");
      }
    } catch (error) {
      console.error("Push subscribe error:", error);
      toast.error("Couldn't enable push alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();

      if (subscription) {
        await removeSubscription(userId, subscription.endpoint);
        await subscription.unsubscribe();
      }

      setSubscribed(false);
      toast.success("Push alerts disabled for this browser");
    } catch (error) {
      console.error("Push unsubscribe error:", error);
      toast.error("Couldn't disable push alerts");
    } finally {
      setLoading(false);
    }
  };

  if (!supported) return null;

  return (
    <button
      onClick={subscribed ? handleDisable : handleEnable}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 border border-gray-600/50 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-all disabled:opacity-50"
    >
      {subscribed ? <BellOff size={16} /> : <Bell size={16} />}
      {loading
        ? "Working..."
        : subscribed
          ? "Disable Push Alerts"
          : "Enable Push Alerts"}
    </button>
  );
}
