import { createOptimizedPicture } from '../../scripts/aem.js';
import { TOGGLE_LABEL_ICONS, BUTTON_LABELS } from '../../constant/common.js';

function updateImageToggleIcon(toggle, iconName, label) {
  toggle.replaceChildren();

  const icon = document.createElement('img');
  icon.src = `${window.hlx.codeBasePath}/icons/${iconName}.svg`;
  icon.alt = label;
  icon.loading = 'lazy';

  toggle.append(icon);
  toggle.setAttribute('aria-label', label);
  toggle.title = label;
}

function updateImageToggleState(imageColumn, toggle, showSubImages) {
  const mainImage = imageColumn.querySelector('.pricing-card-main-image');
  const subImages = [...imageColumn.querySelectorAll('.pricing-card-sub-image')];

  if (mainImage) {
    mainImage.hidden = showSubImages;
  }

  subImages.forEach((picture) => {
    picture.hidden = !showSubImages;
  });

  imageColumn.dataset.showSubImages = showSubImages;
  updateImageToggleIcon(
    toggle,
    showSubImages ? TOGGLE_LABEL_ICONS['main-icon'] : TOGGLE_LABEL_ICONS['sub-icon'],
    showSubImages ? TOGGLE_LABEL_ICONS['main-label'] : TOGGLE_LABEL_ICONS['sub-label'],
  );
  toggle.setAttribute('aria-pressed', showSubImages);
}

function createImageToggle(imageColumn) {
  const toggle = document.createElement('span');
  toggle.className = 'pricing-card-image-toggle';
  toggle.setAttribute('role', 'button');
  toggle.setAttribute('tabindex', '0');

  const toggleImages = () => {
    const showSubImages = imageColumn.dataset.showSubImages !== 'true';
    updateImageToggleState(imageColumn, toggle, showSubImages);
  };

  toggle.addEventListener('click', toggleImages);
  toggle.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleImages();
    }
  });

  updateImageToggleState(imageColumn, toggle, false);

  return toggle;
}

function extractValues(divs) {
  return {
    body: {
      title: divs[2] || '',
      destinations: divs[3] || '',
      schedule: divs[4] || '',
    },
    dtcp: {
      days: divs[5] || '0',
      tour: divs[6] || '0',
      countries: divs[7] || '0',
      price: divs[8] || 'AU$0.00',
    },
    buttons: {
      learnMoreLink: divs[9] || '#LearnMore',
      priceAndBuildLink: divs[10] || '#PriceAndBuild',
    },
  };
}

function buildOptimizedPictures(pictures) {
  if (!pictures.length) return null;
  return pictures.map((picture, index) => {
    const img = picture.querySelector('img');
    const pictureClass = index === 0 ? 'pricing-card-main-image' : 'pricing-card-sub-image';
    return createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }], pictureClass);
  });
}

function buildBody(bodyValues, learnMoreLink) {
  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('pricing-card-body');

  Object.entries(bodyValues).forEach(([field, item]) => {
    const element = document.createElement(field.startsWith('title') ? 'h2' : 'p');

    if (field.startsWith('title')) {
      const anchor = document.createElement('a');
      anchor.href = learnMoreLink;
      anchor.textContent = item;
      element.append(anchor);
    } else if (field === 'schedule') {
      element.classList.add('schedule');
      element.textContent = item;
    } else {
      element.textContent = item;
    }

    bodyDiv.append(element);
  });

  return bodyDiv;
}

function buildDtcp(dtcpValues) {
  const dtcpDiv = document.createElement('div');
  dtcpDiv.classList.add('pricing-card-body');

  const dl = document.createElement('dl');
  dl.classList.add('pricing-card-details');

  Object.entries(dtcpValues).forEach(([field, item]) => {
    const detailDiv = document.createElement('div');
    detailDiv.classList.add('pricing-card-detail');

    const dd = document.createElement('dd');
    dd.textContent = item;

    const dt = document.createElement('dt');
    dt.textContent = field;

    detailDiv.append(dd, dt);
    dl.append(detailDiv);
  });

  dtcpDiv.append(dl);
  return dtcpDiv;
}

function buildButton(buttonValues) {
  const buttonDiv = document.createElement('div');
  buttonDiv.classList.add('buttons-container');

  Object.entries(buttonValues).forEach(([field, link]) => {
    const buttonWrapper = document.createElement('p');
    buttonWrapper.classList.add('button-wrapper');

    const button = document.createElement('a');

    if (field === 'learnMoreLink') {
      button.classList.add('button', 'secondary');
      button.ariaLabel = BUTTON_LABELS['learn-more'];
      button.textContent = BUTTON_LABELS['learn-more'];
    } else {
      button.classList.add('button', 'primary');
      button.ariaLabel = BUTTON_LABELS['price-and-build'];
      button.textContent = BUTTON_LABELS['price-and-build'];
    }

    button.href = link;
    buttonWrapper.append(button);
    buttonDiv.append(buttonWrapper);
  });
  return buttonDiv;
}

function buildPricingCardMain(values) {
  const mainDiv = document.createElement('div');
  mainDiv.classList.add('pricing-card-main');
  mainDiv.append(
    buildBody(values.body, values.buttons.learnMoreLink),
    buildDtcp(values.dtcp),
    buildButton(values.buttons),
  );
  return mainDiv;
}

export default function decorate(block) {
  const divs = [...block.children];
  const ul = document.createElement('ul');

  divs.forEach((div) => {
    const li = document.createElement('li');
    const values = extractValues([...div.children].map((child) => child.textContent.trim()));
    const optimizedPictures = buildOptimizedPictures([...div.querySelectorAll('picture')]);

    if (optimizedPictures && optimizedPictures.length) {
      const imageDiv = document.createElement('div');
      imageDiv.classList.add('pricing-card-image');
      imageDiv.append(...optimizedPictures);
      imageDiv.append(createImageToggle(imageDiv));
      li.append(imageDiv);
    }

    const mainCard = buildPricingCardMain(values);
    li.append(mainCard);

    ul.append(li);
  });
  block.replaceChildren(ul);
}
