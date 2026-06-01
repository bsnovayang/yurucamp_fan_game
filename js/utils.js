function item(id, name, price, weight, tags, desc, effects) {
  return { id, name, price, weight, tags, desc, effects };
}

function check(id, label, sourceText, sourceCharacter, requiredTags) {
  return { id, label, sourceText, sourceCharacter, requiredTags, status: "hinted" };
}

function choice(label, desc, effects, checks, nextMode) {
  return { label, desc, effects, checks, nextMode };
}
