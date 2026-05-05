export function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function normalizePhone(value) {
  return String(value ?? "").trim();
}

export function getPhoneDigits(value) {
  return normalizePhone(value).replace(/\D/g, "");
}

export function isValidPhoneNumber(value) {
  const digits = getPhoneDigits(value);
  return digits.length === 10 || digits.length === 11 || digits.length === 12 || digits.length === 13;
}
