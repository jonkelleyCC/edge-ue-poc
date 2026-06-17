import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function buildSection(row) {
  const section = document.createElement('div');
  section.className = 'footer-section';
  moveInstrumentation(row, section);

  const [titleRow, ...linkRows] = [...row.children];

  if (titleRow?.textContent.trim()) {
    const title = document.createElement('p');
    title.className = 'footer-section-title';
    title.textContent = titleRow.textContent.trim();
    section.append(title);
  }

  const ul = document.createElement('ul');
  linkRows.forEach((linkRow) => {
    const [linkDiv, labelDiv] = [...linkRow.children];
    const href = linkDiv?.querySelector('a')?.href || linkDiv?.textContent.trim();
    const label = labelDiv?.textContent.trim() || linkDiv?.textContent.trim();
    if (!href) return;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
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
  // Block has authored content — decorate directly (also prevents recursion when
  // this function is called again on the inner footer block during fragment loading)
  if ([...block.children].some((row) => row.textContent.trim())) {
    decorateContent(block);
    return;
  }

  // Block is empty (programmatically created) — load /footer as a fragment.
  // loadFragment calls footer.js on the inner footer block which has content,
  // so it takes the decorateContent path above (no infinite recursion).
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  if (fragment) {
    block.textContent = '';
    const wrapper = document.createElement('div');
    while (fragment.firstElementChild) wrapper.append(fragment.firstElementChild);
    block.append(wrapper);
  }
}
