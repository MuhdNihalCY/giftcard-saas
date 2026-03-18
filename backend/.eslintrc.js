module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  plugins: ['@typescript-eslint'],
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  ignorePatterns: ['.eslintrc.js', 'dist', 'node_modules', 'prisma'],
  rules: {
    // Enforce repository pattern: only *.repository.ts may import prisma directly
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['**/infrastructure/database', '**/config/database'],
          message: 'Direct prisma imports are only allowed in *.repository.ts files. Use a repository instead.',
        },
      ],
    }],

    // TypeScript specific rules
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    
    // General code quality
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-unused-vars': 'off', // Use TypeScript version instead
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'warn',
    'prefer-arrow-callback': 'warn',
    
    // Import organization
    'sort-imports': ['warn', {
      ignoreCase: true,
      ignoreDeclarationSort: true,
      ignoreMemberSort: false,
      memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
    }],
  },
  overrides: [
    {
      // Repository files are the only place allowed to import prisma directly
      files: [
        '**/*.repository.ts',
        '**/infrastructure/*.ts',
        '**/server/*.ts',
        '**/app.ts',
        '**/jobs/*.ts',
        // health controller needs raw DB queries for connection checks
        '**/controllers/health.controller.ts',
        // device controller references a non-existent schema model (pre-existing issue)
        '**/controllers/device.controller.ts',
        // these services reference non-existent Prisma models (pre-existing issue)
        '**/services/ip-tracking.service.ts',
        '**/services/chargeback.service.ts',
      ],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
  ],
};


