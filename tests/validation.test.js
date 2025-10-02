import test from 'node:test';
import assert from 'node:assert/strict';
import { validateName, validateNum, validateDate, validateForm } from '../docs/scripts/validation.js';

test('validateName accepts Japanese characters', () => {
  const result = validateName('山田太郎');
  assert.equal(result.valid, true);
  assert.equal(result.value, '山田太郎');
});

test('validateName rejects empty value', () => {
  const result = validateName('   ');
  assert.equal(result.valid, false);
  assert.match(result.error, /名前/);
});

test('validateName rejects unsupported characters', () => {
  const result = validateName('John😀');
  assert.equal(result.valid, false);
  assert.match(result.error, /日本語/);
});

test('validateNum accepts positive integers', () => {
  const result = validateNum('42');
  assert.equal(result.valid, true);
  assert.equal(result.value, 42);
});

test('validateNum accepts negative integers', () => {
  const result = validateNum('-10');
  assert.equal(result.valid, true);
  assert.equal(result.value, -10);
});

test('validateNum rejects decimals', () => {
  const result = validateNum('3.14');
  assert.equal(result.valid, false);
  assert.match(result.error, /整数/);
});

test('validateNum rejects overly large numbers', () => {
  const result = validateNum(String(Number.MAX_SAFE_INTEGER + 1));
  assert.equal(result.valid, false);
  assert.match(result.error, /安全な範囲/);
});

test('validateDate accepts valid ISO dates', () => {
  const result = validateDate('2024-02-29');
  assert.equal(result.valid, true);
  assert.equal(result.value, '2024-02-29');
});

test('validateDate rejects invalid format', () => {
  const result = validateDate('2024/01/01');
  assert.equal(result.valid, false);
  assert.match(result.error, /YYYY-MM-DD/);
});

test('validateDate rejects nonexistent dates', () => {
  const result = validateDate('2024-02-30');
  assert.equal(result.valid, false);
  assert.match(result.error, /存在する日付/);
});

test('validateForm aggregates field results', () => {
  const result = validateForm({ name: '鈴木花子', num: '100', date: '2024-05-01' });
  assert.equal(result.valid, true);
  assert.equal(result.results.name.value, '鈴木花子');
  assert.equal(result.results.num.value, 100);
  assert.equal(result.results.date.value, '2024-05-01');
});

test('validateForm reports errors', () => {
  const result = validateForm({ name: '', num: 'abc', date: '2024-13-01' });
  assert.equal(result.valid, false);
  assert.equal(result.results.name.valid, false);
  assert.equal(result.results.num.valid, false);
  assert.equal(result.results.date.valid, false);
});
