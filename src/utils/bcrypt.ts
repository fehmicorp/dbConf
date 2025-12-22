import * as bcrypt from "bcryptjs";

export async function verifyPassword(
  row: any,
  auth: any,
  body: any
): Promise<any | null> {
  let isMatched = false;
  for (const [plainKey, hashKey] of Object.entries(auth)) {
    const plainTextPassword = body[plainKey as string];
    const hashedPasswordFromDb = row[hashKey as string];
    if (plainTextPassword && hashedPasswordFromDb) {
      if (await bcrypt.compare(plainTextPassword, hashedPasswordFromDb)) {
        isMatched = true;
        break; 
      }
    }
  }
  if (isMatched) {
    const cleanedRow = { ...row };
    Object.values(auth).forEach((dbColumn: any) => {
      delete cleanedRow[dbColumn];
    });
    return cleanedRow;
  }
  return null;
}