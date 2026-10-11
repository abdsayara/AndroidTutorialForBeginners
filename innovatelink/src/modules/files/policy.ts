/**
 * Documents inherit permissions from their owner entity. The service resolves
 * the owner and passes the two booleans; this keeps the rule in one place.
 */
export function canUploadTo(canEditOwner: boolean): boolean {
  return canEditOwner;
}

export function canDownload(canViewOwner: boolean): boolean {
  return canViewOwner;
}
