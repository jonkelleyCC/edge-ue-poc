function handleExtractSymbol(str, symbol) {
  const match = str.match(new RegExp(`\\${symbol}\\w+`));
  const value = match ? {
    fullText: match[0],
    text: match[0].replace(symbol, ''),
  } : null;
  return value;
}

function handleSplitValues(str) {
  return str.split(',').map((s) => s.trim());
}

export {
  handleExtractSymbol,
  handleSplitValues,
};
