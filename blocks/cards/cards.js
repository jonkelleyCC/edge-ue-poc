import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { TITLE_SIZES } from '../../constant/common.js';
import transformButtonDiv from '../../helpers/transform-helper.js';

const getInnerText = (item) => item.innerText.trim();

export default function decorate(block) {
  const [type, cols, size, align] = [...block.children];

  const cardType = type ? getInnerText(type) : 'default';
  const columns = cols ? getInnerText(cols) : '';
  const textAlign = align ? getInnerText(align) : 'left';
  const titleSize = size ? getInnerText(size) : 'l';

  const ul = document.createElement('ul');
  ul.classList.add(`cards-${cardType}`);
  if (columns) ul.classList.add(columns);

  [...block.children].forEach((row, index) => {
    if (index < 5) return;
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    li.className = textAlign ? `text-${textAlign}` : 'text-left';

    const cardChildren = [...li.children];
    const buttonRows = [];

    cardChildren.forEach((div, idx) => {
      if (idx === 0 && div.querySelector('picture')) {
        div.className = 'card-image';
      } else if (idx === 1) {
        div.className = 'card-body';
      } else {
        buttonRows.push(div);
        div.remove();
      }
    });

    const buttons = transformButtonDiv(buttonRows);
    if (buttons) li.querySelector('.card-body').append(buttons);

    ul.append(li);
  });

  ul.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    heading.classList.add(TITLE_SIZES[titleSize]);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);
}
