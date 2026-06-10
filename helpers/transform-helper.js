function transformButtonDiv(body, buttonsColumn) {
  if (!buttonsColumn) return;
  if (buttonsColumn && buttonsColumn.children.length <= 0) {
    buttonsColumn.remove();
  } else {
    buttonsColumn.className = 'buttons-container';
    const buttonWrapper = buttonsColumn.querySelectorAll('.button-wrapper');
    if (buttonWrapper.length === 1) {
      buttonsColumn.classList.add('buttons-single');
    }
    body.append(buttonsColumn);
  }
}

export default transformButtonDiv;
