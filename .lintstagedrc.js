module.exports = {
  'backend/src/**/*.ts': [
    'eslint --fix',
    'prettier --write',
  ],
  'frontend/src/**/*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  '**/*.{json,md,yml,yaml}': [
    'prettier --write',
  ],
};


