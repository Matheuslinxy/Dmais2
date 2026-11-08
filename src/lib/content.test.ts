import { describe, expect, it } from "vitest";
import { buildQuoteMessage, safeHex, whatsappLink, youtubeEmbed } from "./content";

describe("content helpers", () => {
  it("builds a WhatsApp link with only digits of the number", () => {
    expect(whatsappLink("+55 (62) 98150-4537", "Oi")).toBe("https://wa.me/5562981504537?text=Oi");
  });
  it("quote message includes name and service", () => {
    const m = buildQuoteMessage("Ana", "Fachada", "", "Dmais Comunicação Visual");
    expect(m).toContain("Nome: Ana");
    expect(m).toContain("Serviço: Fachada");
    expect(m).not.toContain("Projeto:");
  });
  it("rejects invalid brand colors", () => {
    expect(safeHex("#22E06B")).toBe("#22E06B");
    expect(safeHex("red; background:url(x)")).toBeUndefined();
  });
  it("converts youtube links to embeds", () => {
    expect(youtubeEmbed("https://youtu.be/dQw4w9WgXcQ")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(youtubeEmbed("https://example.com")).toBeNull();
  });
});
