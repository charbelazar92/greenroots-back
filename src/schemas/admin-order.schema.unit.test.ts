import { describe, expect, test } from "vitest";

import { updateOrderStatusSchema } from "./admin-order.schema.ts";

describe("updateOrderStatusSchema", () => {
  test("accepte le statut validated", () => {
    const result = updateOrderStatusSchema.safeParse({
      status: "validated",
    });

    expect(result.success).toBe(true);
  });

  test("accepte le statut cancelled", () => {
    const result = updateOrderStatusSchema.safeParse({
      status: "cancelled",
    });

    expect(result.success).toBe(true);
  });

  test("refuse le statut pending", () => {
    const result = updateOrderStatusSchema.safeParse({
      status: "pending",
    });

    expect(result.success).toBe(false);
  });

  test("refuse un statut inexistant", () => {
    const result = updateOrderStatusSchema.safeParse({
      status: "archived",
    });

    expect(result.success).toBe(false);
  });
});