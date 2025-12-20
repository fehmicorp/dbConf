export const buildParams = (
  body: Record<string, any>,
  input: any
): Record<string, any> => {
  const params: Record<string, any> = {};
  const requiredFields = input?.required || [];
  const mapConfig = input?.map || {};
  for (const field of requiredFields) {
    if (
      body[field] === undefined ||
      body[field] === null ||
      body[field] === ""
    ) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  // 2️⃣ Build params using map
  for (const [inputKey, dbMap] of Object.entries(mapConfig)) {
    const value = body[inputKey];    if (value === undefined) continue;
    // Case: input → multiple DB columns (OR case)
    if (Array.isArray(dbMap)) {
      for (const column of dbMap) {
        params[column] = value;
      }
    }
    // Case: input → single DB column (AND case)
    else if (typeof dbMap === "string") {
      params[dbMap] = value;
    }
  }
  return params;
}