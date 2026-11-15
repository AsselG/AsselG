import * as z from 'zod/v4';

/** What the model must return. Short verbatim quotes ("evidence") let us check each fact against the page. */
export const ExtractedItem = z.object({
  kind: z.enum(['event', 'place']),
  title: z.string(),
  summary: z.string(),
  language: z.enum(['ca', 'es', 'en']),
  themes: z.array(z.enum(['sport', 'art', 'education', 'fun', 'nature'])),
  ageMin: z.number().int().nullable(),
  ageMax: z.number().int().nullable(),
  price: z.number().nullable(),
  isFree: z.boolean().nullable(),
  indoor: z.boolean().nullable(),
  start: z.string().nullable(),
  end: z.string().nullable(),
  placeName: z.string().nullable(),
  address: z.string().nullable(),
  town: z.string().nullable(),
  bookingUrl: z.string().nullable(),
  evidence: z.object({
    title: z.string().nullable(),
    date: z.string().nullable(),
    price: z.string().nullable(),
    age: z.string().nullable(),
    place: z.string().nullable(),
  }),
});
export const Extraction = z.object({ items: z.array(ExtractedItem) });
export type ExtractedItemT = z.infer<typeof ExtractedItem>;
export type ExtractionT = z.infer<typeof Extraction>;
