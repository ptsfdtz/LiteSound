module.exports = {
  extends: [
    'stylelint-config-standard-scss', // SCSS 标准规则
    'stylelint-config-prettier', // 避免与 Prettier 冲突
  ],
  plugins: ['stylelint-order'],
  rules: {
    // 属性顺序规则
    'order/properties-order': [
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'display',
      'flex',
      'flex-direction',
      'justify-content',
      'align-items',
      'width',
      'height',
      'margin',
      'padding',
      'font',
      'color',
      'background',
      'border',
      'box-shadow',
      'transition',
      'animation',
    ],
    'declaration-block-trailing-semicolon': 'always',
    'block-no-empty': true,
    'unit-whitelist': ['em', 'rem', '%', 'px', 's', 'vh', 'vw'],
    'property-no-unknown': true,
  },
};
