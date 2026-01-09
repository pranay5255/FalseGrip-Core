import { readFile } from 'node:fs/promises';
import mime from 'mime-types';
import { OpenRouterClient } from './openrouter';
import { CALORIE_PROMPT_TEMPLATE, CALORIE_SYSTEM_PROMPT } from './modulePrompt';

export interface CalorieEstimate {
  kcal_low: number;
  kcal_high: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  notes: string;
}

export const buildCaloriePrompt = (caption: string): string => {
  const c = caption.trim();
  return CALORIE_PROMPT_TEMPLATE.replace('{{CAPTION_LINE}}', c ? `Caption: ${c}` : '');
};

const coerceNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.\-]/g, '');
    const n = parseFloat(cleaned);
    if (Number.isFinite(n)) return n;
  }
  return 0;
};

const tryParseEstimate = (text: string): CalorieEstimate | undefined => {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/\{[\s\S]*\}/);
  const candidate = fenceMatch ? fenceMatch[0] : trimmed;
  try {
    const raw = JSON.parse(candidate) as Partial<CalorieEstimate>;
    const est: CalorieEstimate = {
      kcal_low: coerceNumber(raw.kcal_low),
      kcal_high: coerceNumber(raw.kcal_high),
      protein_g: coerceNumber(raw.protein_g),
      carbs_g: coerceNumber(raw.carbs_g),
      fat_g: coerceNumber(raw.fat_g),
      notes: typeof raw.notes === 'string' ? raw.notes.trim() : ''
    };
    if (est.kcal_low === 0 && est.kcal_high === 0 && est.protein_g === 0 && est.carbs_g === 0 && est.fat_g === 0) {
      return undefined;
    }
    return est;
  } catch {
    return undefined;
  }
};

export const renderCalorieEstimate = (est: CalorieEstimate): string => {
  const lines = [
    `Calories: ${Math.round(est.kcal_low)}–${Math.round(est.kcal_high)} kcal`,
    `Macros: ${Math.round(est.protein_g)} g protein, ${Math.round(est.carbs_g)} g carbs, ${Math.round(est.fat_g)} g fat`,
    est.notes ? `Notes: ${est.notes}` : ''
  ].filter(Boolean);
  return lines.join('\n');
};

const buildDataUrl = (base64Data: string, mimeType: string): string => {
  if (base64Data.startsWith('data:')) {
    return base64Data;
  }
  return `data:${mimeType};base64,${base64Data}`;
};

const resolveImageDataUrl = async (params: {
  imagePath?: string;
  base64Data?: string;
  mimeType?: string;
}): Promise<string | undefined> => {
  const { imagePath, base64Data, mimeType } = params;

  if (base64Data) {
    const resolvedMime = mimeType ?? 'image/jpeg';
    return buildDataUrl(base64Data, resolvedMime);
  }

  if (imagePath) {
    const buffer = await readFile(imagePath);
    const lookedUp = mime.lookup(imagePath);
    const resolvedMime = typeof lookedUp === 'string' ? lookedUp : mimeType ?? 'image/jpeg';
    return buildDataUrl(buffer.toString('base64'), resolvedMime);
  }

  return undefined;
};

export interface EstimatePlateCaloriesParams {
  imagePath?: string;
  base64Data?: string;
  mimeType?: string;
  captionText: string;
  openRouterClient: OpenRouterClient;
}

export const estimatePlateCalories = async (params: EstimatePlateCaloriesParams): Promise<CalorieEstimate | undefined> => {
  const { imagePath, base64Data, mimeType, captionText, openRouterClient } = params;
  const instruction = buildCaloriePrompt(captionText);
  const imageUrl = await resolveImageDataUrl({ imagePath, base64Data, mimeType });
  const raw = await openRouterClient.describeImage({
    imageUrl,
    instruction,
    system: CALORIE_SYSTEM_PROMPT,
    maxTokens: 600,
    temperature: 0.1
  });
  return tryParseEstimate(raw);
};
