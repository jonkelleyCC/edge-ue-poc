function transformButtonDiv(buttonRows) {
  if (!buttonRows.length) return null;
  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'buttons-container';
  const [labelDiv, linkDiv, variantDiv] = buttonRows;
  const label = labelDiv?.textContent.trim();
  const href = linkDiv?.querySelector('a')?.href || linkDiv?.textContent.trim();
  const variant = variantDiv?.textContent.trim() || 'primary';
  if (!label || !href) return null;
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  a.className = `button ${variant}`;
  buttonsDiv.append(a);
  return buttonsDiv;
}

export default transformButtonDiv;
