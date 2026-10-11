import { route, query, requireActor } from "@/lib/api/handler";
import { AppError } from "@/lib/api/errors";
import { importProjects } from "@/modules/projects/service";

/** FR-3.5: body is the raw CSV (text/csv) or multipart with a `file` field. */
export const POST = route(async ({ req, actor }) => {
  const a = requireActor(actor);
  const ct = req.headers.get("content-type") ?? "";
  let csv: string;
  if (ct.includes("multipart/form-data")) {
    const f = (await req.formData()).get("file");
    if (!(f instanceof File)) throw new AppError("bad_request", "file_required");
    if (f.size > 5 * 1024 * 1024) throw new AppError("validation_error", "file_too_large");
    csv = await f.text();
  } else csv = await req.text();
  return importProjects(a, csv, req.nextUrl.searchParams.get("org_id") ?? undefined);
});
