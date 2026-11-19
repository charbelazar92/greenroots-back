import { describe, expect, test } from "vitest";

import { hashRefreshToken } from "./token.ts";

describe("hashRefreshToken", () => {
  test("hache le refresh token", () => {
    const refreshToken = "tokentest";

    const hashedToken = hashRefreshToken(refreshToken);

    expect(hashedToken).not.toBe(refreshToken);
    expect(hashedToken).toHaveLength(64);
    expect(hashRefreshToken(refreshToken)).toBe(hashedToken);
  });

  test("empreintes différentes pour chaque refresh token ", () => {
    const firstRefreshToken = "tokentest1";
    const secondRefreshToken = "token test2";

    const firstHashedToken = hashRefreshToken(firstRefreshToken);
    const secondHashedToken = hashRefreshToken(secondRefreshToken);

    expect(firstHashedToken).not.toBe(secondHashedToken);
  });
});