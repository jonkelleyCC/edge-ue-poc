import { BASE_PATH } from '../constant/common.js';

export default function getCardDetail(matrix) {
  if (!matrix) return null;
  return `${BASE_PATH}/getVikingCardByPath;path=${matrix};cb=${Date.now()}`;
}
