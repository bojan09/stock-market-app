import { describe, it, expect, vi, beforeEach } from "vitest";

const getSessionMock = vi.fn();

vi.mock("@/lib/better-auth/auth", () => ({
  getAuth: vi.fn(async () => ({
    api: { getSession: getSessionMock },
  })),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

import { requireUser } from "./session-guard";

describe("requireUser", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
  });

  it("returns null when no userId is claimed", async () => {
    expect(await requireUser("")).toBeNull();
  });

  it("returns null when there is no active session", async () => {
    getSessionMock.mockResolvedValue(null);
    expect(await requireUser("user-1")).toBeNull();
  });

  it("returns null when the session belongs to a different user (IDOR attempt)", async () => {
    getSessionMock.mockResolvedValue({ user: { id: "attacker-id" } });
    expect(await requireUser("victim-id")).toBeNull();
  });

  it("returns the userId when the session matches the claimed user", async () => {
    getSessionMock.mockResolvedValue({ user: { id: "user-1" } });
    expect(await requireUser("user-1")).toBe("user-1");
  });
});
