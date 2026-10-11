import { z } from "zod";

export const pageSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PageInput = z.infer<typeof pageSchema>;

export interface Paged<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export function skipTake(p: PageInput) {
  return { skip: (p.page - 1) * p.limit, take: p.limit };
}
