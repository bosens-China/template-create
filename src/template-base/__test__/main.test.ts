import { add, subtraction } from '../src/main';

test('1+1 to 2', () => {
  expect(add(1, 1)).toBe(2);
});

test('1-1 to 0', () => {
  expect(subtraction(1, 1)).toBe(0);
});
