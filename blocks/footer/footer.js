import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function buildSection(row) {
  const section = document.createElement('div');
  section.className = 'footer-section';
  moveInstrumentation(row, section);

  const [titleCell, ...linkCells] = [...row.children];

  const titleText = titleCell?.textContent.trim();
  if (titleText) {
    const h3 = document.createElement('h3');
    h3.className = 'footer-section-title';
    h3.textContent = titleText;
    section.append(h3);
  }

  const ul = document.createElement('ul');
  linkCells.forEach((cell) => {
    const [labelDiv, linkDiv] = [...cell.children];
    const label = labelDiv?.textContent.trim();
    const href = linkDiv?.querySelector('a')?.href || linkDiv?.textContent.trim();
    if (!label && !href) return;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = href || '#';
    a.textContent = label || href;
    li.append(a);
    ul.append(li);
  });

  if (ul.children.length) section.append(ul);
  return section;
}

function decorateContent(block) {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Footer');
  [...block.children].forEach((row) => {
    if (row.textContent.trim()) nav.append(buildSection(row));
  });
  block.replaceChildren(nav);
}

export default async function decorate(block) {
  if ([...block.children].some((row) => row.textContent.trim())) {
    decorateContent(block);
    return;
  }

  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  if (fragment) {
    const footerBlock = fragment.querySelector('.footer');
    if (footerBlock) {
      while (footerBlock.firstChild) block.append(footerBlock.firstChild);
    }
  }
}
