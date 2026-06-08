import fs from "fs/promises";
import path from "path";
import { cache } from "react";

export interface WhyChooseUsItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface OurAdvantagesItem {
  id: string;
  title: string;
  value: string;
  description: string;
  icon: string;
}

export interface TrustBuildersItem {
  id: string;
  label: string;
  value: number;
  suffix: string;
}

export interface HomepageSettings {
  whyChooseUs: WhyChooseUsItem[];
  ourAdvantages: OurAdvantagesItem[];
  trustBuilders: TrustBuildersItem[];
}

const SETTINGS_FILE_PATH = path.join(process.cwd(), "data", "homepage-settings.json");

// Cache read operations using React Cache for App Router request-level caching
export const getHomepageSettings = cache(async (): Promise<HomepageSettings> => {
  try {
    const data = await fs.readFile(SETTINGS_FILE_PATH, "utf-8");
    return JSON.parse(data) as HomepageSettings;
  } catch (error) {
    console.error("[getHomepageSettings] Error reading settings, using fallback", error);
    // Provide hardcoded fallback if file read fails
    return {
      whyChooseUs: [],
      ourAdvantages: [],
      trustBuilders: []
    };
  }
});

export async function updateHomepageSettings(settings: HomepageSettings): Promise<boolean> {
  try {
    await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("[updateHomepageSettings] Error writing settings file", error);
    return false;
  }
}
