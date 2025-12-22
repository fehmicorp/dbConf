export const buildIdentityParams = (
  body: Record<string, any>,
  input: {
    required?: string[];
    map?: Record<string, string | string[]>;
  }
): Record<string, any> => {
  const params: Record<string, any> = {};

  const required = input?.required || [];
  const mapConfig = input?.map || {};

  // 1️⃣ Loop over required identity fields
  for (const reqKey of required) {

    const value = body[reqKey];
    if (value === undefined || value === null || value === "") {
      throw new Error(`Missing required field: ${reqKey}`);
    }

    const mappedCols = mapConfig[reqKey];

    if (!mappedCols) {
      throw new Error(`No mapping found for required field: ${reqKey}`);
    }

    // 2️⃣ One input → many DB columns (OR identity)
    if (Array.isArray(mappedCols)) {
      for (const col of mappedCols) {
        params[col] = value;
      }
    }
    // 3️⃣ One input → one DB column
    else if (typeof mappedCols === "string") {
      params[mappedCols] = value;
    }
  }

  return params;
};