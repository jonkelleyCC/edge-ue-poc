import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function cellReducer(cell) {
  return cell ? [...cell.children].reduce((acc, child) => {
    if (child.tagName === 'HR') acc.push([]);
    else acc[acc.length - 1].push(child);
    return acc;
  }, [[]]) : [];
}

function buildColumn(row) {
  const column = document.createElement('div');
  column.className = 'footer-column';
  moveInstrumentation(row, column);

  const [titleCell, linksCell] = [...row.children];

  const titleText = titleCell?.textContent.trim();
  if (titleText) {
    const h3 = document.createElement('h3');
    h3.className = 'footer-title';
    h3.textContent = titleText;
    column.append(h3);
  }

  if (!linksCell) return column;

  const ul = document.createElement('ul');
  const groups = cellReducer(linksCell);

  groups.forEach((nodes) => {
    if (!nodes.length) return;
    let label = null;
    let href = null;
    nodes.forEach((node) => {
      const anchor = node.querySelector('a');
      if (anchor) href = anchor.href;
      else label = node.textContent.trim();
    });
    if (!label && !href) return;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = href || '#';
    a.textContent = label || href;
    li.append(a);
    ul.append(li);
  });

  if (ul.children.length) column.append(ul);
  return column;
}

function buildSocialArea(row) {
  const socialAreaWrapper = document.createElement('div');
  socialAreaWrapper.className = 'social-area-wrapper';

  const socialArea = document.createElement('div');
  socialArea.className = 'social-area';
  moveInstrumentation(row, socialArea);

  const [linksCell] = [...row.children];
  if (!linksCell) return socialArea;

  const groups = cellReducer(linksCell);

  groups.forEach((nodes) => {
    if (!nodes.length) return;
    let href = null;
    let variant = null;
    nodes.forEach((node) => {
      const anchor = node.querySelector('a');
      if (anchor) href = anchor.href;
      else variant = node.textContent.trim().toLowerCase();
    });
    if (!href && !variant) return;

    const item = document.createElement('div');
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = `/icons/${variant}.svg`;
    img.alt = variant || '';
    picture.append(img);

    const a = document.createElement('a');
    a.href = href || '#';
    a.setAttribute('aria-label', variant || '');

    item.append(picture, a);
    socialArea.append(item);
  });
  socialAreaWrapper.append(socialArea);
  return socialAreaWrapper;
}

function decorateSocialArea(footer) {
  const socialItems = [...footer.querySelectorAll('.social-area > div')];
  if (!socialItems.length) return;

  socialItems.forEach((item) => {
    item.classList.add('social-item');
    const picture = item.querySelector('picture');
    const link = item.querySelector('a');
    if (!picture || !link) return;
    link.innerHTML = '';
    link.append(picture);
    item.innerHTML = '';
    item.append(link);
  });
}

function decorateFooterColumns(footerArea) {
  const columns = [...footerArea.querySelectorAll('.footer-column')];
  if (!columns.length) return;

  const mobileQuery = window.matchMedia('(max-width: 1023px)');

  columns.forEach((column, index) => {
    const heading = column.querySelector('h3.footer-title');
    const linksPanel = column.querySelector('ul');
    if (!heading || !linksPanel) return;

    linksPanel.classList.add('footer-links-panel');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'footer-accordion-trigger';

    const triggerText = document.createElement('span');
    triggerText.className = 'footer-accordion-label';
    triggerText.textContent = heading.textContent.trim();

    const triggerIcon = document.createElement('span');
    triggerIcon.className = 'footer-accordion-icon';
    triggerIcon.setAttribute('aria-hidden', 'true');

    const triggerId = `footer-accordion-trigger-${index + 1}`;
    const panelId = `footer-accordion-panel-${index + 1}`;

    trigger.id = triggerId;
    trigger.setAttribute('aria-controls', panelId);
    trigger.append(triggerText, triggerIcon);

    heading.textContent = '';
    heading.append(trigger);

    linksPanel.id = panelId;
    linksPanel.setAttribute('aria-labelledby', triggerId);

    trigger.addEventListener('click', () => {
      if (!mobileQuery.matches) return;
      const isOpen = column.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      linksPanel.hidden = !isOpen;
    });
  });

  const syncAccordionState = (event) => {
    const isMobile = event.matches;
    columns.forEach((column) => {
      const trigger = column.querySelector('.footer-accordion-trigger');
      const linksPanel = column.querySelector('.footer-links-panel');
      if (!trigger || !linksPanel) return;

      if (isMobile) {
        const isOpen = column.classList.contains('is-open');
        trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        linksPanel.hidden = !isOpen;
      } else {
        column.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        linksPanel.hidden = false;
      }
    });
  };

  syncAccordionState(mobileQuery);
  mobileQuery.addEventListener('change', syncAccordionState);
}

function decorateContent(block) {
  const footerAreaWrapper = document.createElement('div');
  footerAreaWrapper.className = 'footer-area-wrapper';

  const footerArea = document.createElement('div');
  footerArea.className = 'footer-area';

  const footerBelowArea = document.createElement('div');
  footerBelowArea.className = 'footer-below-area';

  const footerBelowAreaWrapper = document.createElement('div');
  footerBelowAreaWrapper.className = 'footer-below-area-wrapper';

  const copyright = document.createElement('p');
  copyright.className = 'footer-copyright';

  const currentYear = new Date().getFullYear();
  copyright.innerText = `© Viking Cruises, ${currentYear}. All Rights Reserved.`;

  [...block.children].forEach((row) => {
    // footer-social has 1 child (links only); footer-section has 2 (title + links)
    if (row.children.length === 1 && row.children[0].querySelector('hr')) {
      footerBelowAreaWrapper.append(buildSocialArea(row));
    } else {
      footerArea.append(buildColumn(row));
    }
  });
  decorateFooterColumns(footerArea);
  decorateSocialArea(footerBelowAreaWrapper);
  footerAreaWrapper.append(footerArea);
  footerBelowAreaWrapper.append(copyright);
  footerBelowArea.append(footerBelowAreaWrapper);
  block.innerHTML = '';
  block.append(footerAreaWrapper);
  block.append(footerBelowArea);
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
