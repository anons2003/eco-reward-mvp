import { z } from "zod";

export const autocompleteQuerySchema = z.object({
  input: z.string().trim().min(2).max(120),
  location: z.string().trim().regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/).optional(),
});

export const placeDetailQuerySchema = z.object({
  placeId: z.string().trim().min(4).max(160),
});

export type GoongSuggestion = {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

export type GoongPlaceDetail = {
  place_id: string;
  formatted_address?: string;
  name?: string;
  geometry?: {
    location?: {
      lat?: number;
      lng?: number;
    };
  };
};
