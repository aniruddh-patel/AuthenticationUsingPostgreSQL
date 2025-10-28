export function validateEmail(email) {
  if (!email || typeof email !== "string") return false;

  const trimmed = email.trim().toLowerCase();

  let Count = 0;
  for (let ch of trimmed) {
    if (ch === '@') Count++;
    if (ch === ' ') return false;
  }
  if (Count !== 1) return false;

  const atIndex = trimmed.indexOf('@');
  const dotIndex = trimmed.lastIndexOf('.');

  if (atIndex <= 0) return false;
  if (dotIndex === trimmed.length - 1) return false;

  return true;
}

export function validateName(name) {
  if (!name || typeof name !== "string") return false;

  const trimmed = name.trim();
  if (trimmed.length < 3 || trimmed.length > 30) return false;
  if (trimmed.startsWith(".") || trimmed.endsWith(".")) return false;
  if (trimmed.includes("..")) return false;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];

    if ((ch >= "A" && ch <= "Z") || (ch >= "a" && ch <= "z")) {} 
    else if (ch === " " || ch === ".") {} 
    else {
      return false;
    }
  }

  return true;
}
