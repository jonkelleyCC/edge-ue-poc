const BASE_PATH = 'https://publish-p123749-e1215043.adobeaemcloud.com/graphql/execute.json/Content-Fragments';

const TITLE_SIZES = {
  xxl: 'font-xxl',
  xl: 'font-xl',
  l: 'font-l',
  m: 'font-m',
  s: 'font-s',
  xs: 'font-xs',
};

const PRICING_DETAILS = [
  ['days', 'Days'],
  ['tour', 'Tours'],
  ['countries', 'Countries'],
  ['price', 'Price'],
];

const TOGGLE_LABEL_ICONS = {
  'sub-label': 'View Details',
  'main-label': 'Hide Details',
  'sub-icon': 'map-point',
  'main-icon': 'camera',
};

const EXCLUDED_BLOCKS = ['section-metadata', 'main-logo', 'footer-area', 'social-area', 'copyright'];

export {
  TITLE_SIZES,
  PRICING_DETAILS,
  TOGGLE_LABEL_ICONS,
  EXCLUDED_BLOCKS,
  BASE_PATH,
};
