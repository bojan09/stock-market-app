"use server";

import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";

/**
 * Verifies that the caller's actual session matches the userId they claim
 * to be acting as. Server Actions are POST endpoints reachable outside the
 * UI, so a client-supplied userId can never be trusted on its own.
 */
export async function requireUser(claimedUserId: string): Promise<string | null> {
  if (!claimedUserId) return null;

  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id || session.user.id !== claimedUserId) return null;

  return session.user.id;
}
