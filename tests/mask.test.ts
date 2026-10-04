import { describe, it, expect } from "vitest";
import { maskText } from "../src/lib/mask";

describe("maskText", () => {
  it("masks OTP correctly", () => {
    expect(maskText("OTP is 482913").text).toBe("OTP is [hidden:otp]");
    expect(maskText("Share the OTP 482913 now").text).toBe("Share the OTP [hidden:otp] now");
  });

  it("masks card numbers", () => {
    expect(maskText("Card 4111 1111 1111 1111").text).toBe("Card [hidden:card]");
  });

  it("masks Aadhaar numbers", () => {
    expect(maskText("Aadhaar 1234 5678 9012").text).toBe("Aadhaar [hidden:aadhaar]");
  });

  it("masks PAN codes", () => {
    expect(maskText("ABCDE1234F").text).toBe("[hidden:pan]");
  });

  it("masks phone numbers", () => {
    expect(maskText("Call 9876543210").text).toBe("Call [hidden:phone]");
    expect(maskText("Call +91 98765 43210").text).toBe("Call [hidden:phone]");
  });

  it("masks bank account numbers", () => {
    expect(maskText("account 123456789012345").text).toBe("account [hidden:account]");
  });

  it("leaves protected tokens unchanged", () => {
    const text = "Reg: INH000000000 rameshadvisor@okaxis 9876543210@ybl Rs 5000 10 slots http://x.example/a1234567890";
    expect(maskText(text).text).toBe(text);
  });

  it("is idempotent - running maskText on output changes nothing", () => {
    const sample = "OTP is 482913 with card 4111 1111 1111 1111 and call 9876543210";
    const res1 = maskText(sample);
    const res2 = maskText(res1.text);
    expect(res2.text).toBe(res1.text);
  });
});
