import { createOptimizedPicture } from '../../scripts/aem.js';

function buildVideo(src, posterSrc) {
  const video = document.createElement('video');
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.className = 'hero-video';
  if (posterSrc) video.poster = posterSrc;
  const source = document.createElement('source');
  source.src = src;
  source.type = 'video/mp4';
  video.append(source);
  return video;
}

export default function decorate(block) {
  const [imageRow, videoRow, altRow, blurbRow] = [...block.children];

  const picture = imageRow?.querySelector('picture');
  const videoSrc = videoRow?.querySelector('a')?.href;
  const alt = altRow?.textContent.trim();

  const dom = document.createElement('div');
  dom.classList.add('hero-content');

  if (videoSrc) {
    const posterSrc = picture?.querySelector('img')?.getAttribute('src');
    dom.append(buildVideo(videoSrc, posterSrc));
  } else if (picture) {
    const img = picture.querySelector('img');
    dom.append(createOptimizedPicture(img.src, alt, false));
  }

  if (blurbRow?.innerHTML) {
    const blurbDiv = document.createElement('div');
    blurbDiv.classList.add('hero-blurb');
    blurbDiv.innerHTML = blurbRow.innerHTML;
    dom.append(blurbDiv);
  }

  block.innerHTML = '';
  block.append(dom);
}
