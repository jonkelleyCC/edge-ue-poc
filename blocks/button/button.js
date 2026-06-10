export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const a = cells[0]?.querySelector('a');
  if (!a) return;

  const variant = cells[1]?.textContent.trim() || 'primary';
  a.className = `button ${variant}`;

  const p = document.createElement('p');
  p.className = 'button-wrapper';
  p.append(a);

  block.innerHTML = '';
  block.append(p);
}
