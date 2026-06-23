import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { TITLE_SIZES } from '../../constant/common.js';
import transformButtonDiv from '../../helpers/transform-helper.js';
import getCardDetail from '../../api/card-api.js';

const getInnerText = (el) => el.innerText.trim();

function toItems(payload) {
  const single = payload?.data?.vikingCardByPath?.item;
  if (single) return [single];
  const list = payload?.data?.vikingCardsByPath?.items
    || payload?.data?.vikingCardList?.items
    || payload?.data?.items;
  return Array.isArray(list) ? list : [];
}

async function fetchCardData(href) {
  const path = new URL(href).pathname;
  try {
    const response = await fetch(getCardDetail(path));
    if (!response.ok) throw new Error(`${response.status} for ${path}`);
    return response.json();
  } catch (e) {
    return null;
  }
}

function buildInlineCard(li) {
  const cardChildren = [...li.children];
  const buttonRows = [];
  cardChildren.forEach((div, idx) => {
    if (idx === 0 && div.querySelector('picture')) div.className = 'card-image';
    else if (idx === 1) div.className = 'card-body';
    else { buttonRows.push(div); div.remove(); }
  });
  const buttons = transformButtonDiv(buttonRows);
  if (buttons) li.querySelector('.card-body')?.append(buttons);
}

function createCard(item, titleSize, textAlign) {
  const li = document.createElement('li');
  li.className = textAlign ? `text-${textAlign}` : 'text-left';

  /* eslint-disable no-underscore-dangle */
  const imageSrc = item?.image?._publishUrl
    || item?.image?._dynamicUrl
    || item?.image?._path;

  if (imageSrc) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'card-image';
    imageWrapper.append(
      createOptimizedPicture(imageSrc, item?.title?.plaintext || '', false, [{ width: '750' }]),
    );
    li.append(imageWrapper);
  }

  const body = document.createElement('div');
  body.className = 'card-body';

  if (item?.title?.html) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = item.title.html;
    body.append(...wrapper.childNodes);
  } else if (item?.title?.plaintext) {
    const h3 = document.createElement('h3');
    h3.textContent = item.title.plaintext;
    body.append(h3);
  }

  if (item?.description?.html) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = item.description.html;
    body.append(...wrapper.childNodes);
  } else if (item?.description?.plaintext) {
    const p = document.createElement('p');
    p.textContent = item.description.plaintext;
    body.append(p);
  }

  if (item?.buttonText && item?.buttonUrl) {
    const a = document.createElement('a');
    a.href = item.buttonUrl;
    a.textContent = item.buttonText;
    a.classList.add('button');
    if (item?.buttonStyle) a.classList.add(item.buttonStyle.toLowerCase());
    const p = document.createElement('p');
    p.className = 'button-wrapper';
    p.append(a);
    const btnWrapper = document.createElement('div');
    btnWrapper.className = 'buttons-container';
    btnWrapper.append(p);
    body.append(btnWrapper);
  }

  li.append(body);

  return li;
}

export default async function decorate(block) {
  const [type, cols, size, align] = [...block.children];
  const cardType = type ? getInnerText(type) : 'default';
  const columns = cols ? getInnerText(cols) : '';
  const textAlign = align ? getInnerText(align) : 'left';
  const titleSize = size ? getInnerText(size) : 'l';

  const ul = document.createElement('ul');
  ul.classList.add(`cards-${cardType}`);
  if (columns) ul.classList.add(columns);

  const cfLinks = [];

  [...block.children].forEach((row, index) => {
    if (index < 5) return;
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    li.className = textAlign ? `text-${textAlign}` : 'text-left';

    const firstDiv = li.children[0];
    const fragmentLink = firstDiv?.querySelector('a[href]');

    if (fragmentLink && !firstDiv?.querySelector('picture')) {
      cfLinks.push(fragmentLink.href);
      return;
    }

    buildInlineCard(li);
    ul.append(li);
  });

  if (cfLinks.length) {
    const results = await Promise.all(cfLinks.map(fetchCardData));
    results.flatMap(toItems).forEach((item) => {
      ul.append(createCard(item, titleSize, textAlign));
    });
  }

  ul.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    h.classList.add(TITLE_SIZES[titleSize]);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const opt = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, opt.querySelector('img'));
    img.closest('picture').replaceWith(opt);
  });

  block.replaceChildren(ul);
}
