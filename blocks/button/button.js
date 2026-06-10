import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const [linkRow, textRow, titleRow, typeRow] = [...block.children].map(
    (row) => row.firstElementChild,
  );
  console.log(123)

  const a = linkRow?.querySelector('a');
  if (!a) return;
  console.log(a)

  const linkText = textRow?.textContent.trim();
  const linkTitle = titleRow?.textContent.trim();
  const linkType = typeRow?.textContent.trim();

  if (linkText) a.textContent = linkText;
  if (linkTitle) a.title = linkTitle;
  a.className = ['button', linkType].filter(Boolean).join(' ');

  const p = document.createElement('p');
  p.className = 'button-wrapper';
  moveInstrumentation(block, p);
  p.append(a);
  block.replaceWith(p);
}
