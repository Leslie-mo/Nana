import { NextResponse } from "next/server";
import { generateAnimatedPetAvatar } from "@/lib/gemini";
import type { Locale } from "@/types";

const locales = new Set(["zh", "en", "ja"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const rawLocale = formData.get("locale");
    const locale = typeof rawLocale === "string" && locales.has(rawLocale) ? (rawLocale as Locale) : "zh";

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    const result = await generateAnimatedPetAvatar(image, locale);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate avatar.",
      },
      { status: 500 },
    );
  }
}
