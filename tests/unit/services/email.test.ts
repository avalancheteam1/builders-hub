import { describe, expect, it } from "vitest";
import { emailSchema, isValidEmail } from "@/lib/email";

// The invite route validates `z.array(emailSchema)` atomically, so any address the
// UI accepts must also pass the schema — otherwise one chip rejects a whole batch.
describe("isValidEmail / emailSchema agree", () => {
  const samples = [
    "user@example.com",
    "first.last@sub.example.co.uk",
    "user+tag@example.com",
    "user_name@example-domain.com",
    "josé@example.com",
    "用户@例子.广告",
    "a@b.c",
    "joe@example..com",
    ".a@b.com",
    "a@b.com.",
    "notanemail",
    "",
  ];

  it.each(samples)("%s: the UI check matches the server schema", (email) => {
    expect(isValidEmail(email)).toBe(emailSchema.safeParse(email).success);
  });

  it("accepts ordinary addresses", () => {
    expect(isValidEmail("teammate@example.com")).toBe(true);
  });

  it("rejects obvious garbage", () => {
    expect(isValidEmail("notanemail")).toBe(false);
    expect(isValidEmail("a b@example.com")).toBe(false);
  });
});
