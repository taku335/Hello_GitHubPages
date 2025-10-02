export function validateName(value) {
  const trimmed = (value ?? '').trim();
  if (!trimmed) {
    return { valid: false, error: '名前を入力してください。' };
  }
  if (!/^[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}\p{P}\p{N}\p{Zs}A-Za-z]+$/u.test(trimmed)) {
    return { valid: false, error: '日本語の文字を中心に入力してください。' };
  }
  return { valid: true, value: trimmed };
}

export function validateNum(value) {
  const text = (value ?? '').trim();
  if (!text) {
    return { valid: false, error: '整数を入力してください。' };
  }
  if (!/^[-+]?\d+$/.test(text)) {
    return { valid: false, error: '整数のみ入力できます。' };
  }
  const parsed = Number.parseInt(text, 10);
  if (!Number.isSafeInteger(parsed)) {
    return { valid: false, error: '安全な範囲の整数を入力してください。' };
  }
  return { valid: true, value: parsed };
}

export function validateDate(value) {
  const text = (value ?? '').trim();
  if (!text) {
    return { valid: false, error: '日付を入力してください。' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return { valid: false, error: 'YYYY-MM-DD形式で入力してください。' };
  }
  const [year, month, day] = text.split('-').map((part) => Number.parseInt(part, 10));
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) {
    return { valid: false, error: '存在する日付を入力してください。' };
  }
  return { valid: true, value: text };
}

export function validateForm(values) {
  const results = {
    name: validateName(values.name),
    num: validateNum(values.num),
    date: validateDate(values.date),
  };
  const hasError = Object.values(results).some((result) => !result.valid);
  return {
    valid: !hasError,
    results,
  };
}
