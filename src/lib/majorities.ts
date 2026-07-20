export function computeMajorities(strength: number) {
  const simple =
    strength % 2 === 0 ? strength / 2 + 1 : Math.ceil(strength / 2);
  const special = Math.round((2 * strength) / 3);
  const third = Math.round(strength / 3);
  return { strength, simple, special, third };
}