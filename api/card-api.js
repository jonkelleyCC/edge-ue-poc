import { BASE_PATH_PUBLISH, BASE_PATH_AUTHOR } from '../constant/common.js';

export default function getCardDetail(matrix) {
  if (!matrix) return null;
  const isAuthor = window.location.hostname.startsWith('author-');
  return `${isAuthor ? BASE_PATH_AUTHOR : BASE_PATH_PUBLISH}/getVikingCardByPath;path=${matrix};cb=${Date.now()}`;
}
