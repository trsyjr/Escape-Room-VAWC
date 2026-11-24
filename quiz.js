export async function loadQuestionnaire(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to load questionnaire (${response.status}) from ${url}`);
  }
  return response.json();
}

export function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function normalizeList(values = []) {
  return values.map(normalize);
}

export function indexSteps(part) {
  const steps = {};
  for (const room of part.rooms ?? []) {
    for (const step of room.steps ?? []) {
      steps[step.id] = step;
    }
  }
  return steps;
}

export function getStep(steps, id) {
  const step = steps[id];
  if (!step) {
    throw new Error(`Unknown room step: ${id}`);
  }
  return step;
}

export function checkFields(step, getValue) {
  if (!step.fields) return true;
  return step.fields.every((field) => {
    const value = normalize(getValue(field.input));
    return normalizeList(field.answerKey).includes(value);
  });
}

export function checkSelect(step, selectedValues = []) {
  if (!step.select) return true;
  const selected = normalizeList(selectedValues);
  const expected = normalizeList(step.select.answerKey);
  return (
    selected.length === expected.length &&
    expected.every((value) => selected.includes(value))
  );
}

export function checkMatching(step, selections = {}) {
  if (!step.matching) return true;
  return Object.entries(step.matching.answerKey).every(
    ([position, expected]) => normalize(selections[position]) === normalize(expected)
  );
}
