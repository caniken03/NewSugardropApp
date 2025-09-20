# Metro Bundler File Resolution Guide
**Context-Aware Checklist for Resolving React Native Import Errors**

## 🚨 Quick Diagnostic for Current Error

**Error Pattern**: `Unable to resolve module ../../src/services/api from /app/frontend/app/modals_add-entry.tsx`

**Root Cause**: File path structure mismatch in Metro bundler resolution

---

## 📋 Phase A: Core Path Resolution Patterns

### Pattern 1: Relative Import - Sibling `src/` Folder ✅ **YOUR CURRENT CASE**

**Scenario**: File at `frontend/app/(modals)/add-entry.tsx`, target at `frontend/src/services/api.ts`

**Directory Structure**:
```
frontend/
├── app/
│   ├── (tabs)/
│   │   └── home.tsx
│   └── (modals)/
│       └── add-entry.tsx    ← Import FROM here
└── src/
    └── services/
        └── api.ts           ← Import TO here
```

**✅ Correct Import Path**:
```typescript
// From: frontend/app/(modals)/add-entry.tsx
// To: frontend/src/services/api.ts
import { apiClient } from '../../src/services/api';
```

**❌ Common Mistakes**:
- `../src/services/api` (missing one level up)
- `./src/services/api` (wrong relative direction)
- `/src/services/api` (absolute path won't work)

---

### Pattern 2: Nested `src/` Inside `app/`

**Directory Structure**:
```
frontend/
└── app/
    ├── (modals)/
    │   └── add-entry.tsx    ← Import FROM here
    └── src/
        └── services/
            └── api.ts       ← Import TO here
```

**✅ Correct Import Path**:
```typescript
import { apiClient } from '../src/services/api';
```

---

### Pattern 3: Monorepo External `src/` Folder

**Directory Structure**:
```
project-root/
├── frontend/
│   └── app/
│       └── (modals)/
│           └── add-entry.tsx    ← Import FROM here
└── shared/
    └── src/
        └── services/
            └── api.ts           ← Import TO here
```

**Metro Config Required** (`metro.config.js`):
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.watchFolders = [
  path.resolve(__dirname, '../shared'),
];

module.exports = config;
```

**✅ Import Path**:
```typescript
import { apiClient } from '../../../shared/src/services/api';
```

---

### Pattern 4: Import from Folder with `index.ts`

**Directory Structure**:
```
frontend/
├── app/
│   └── (modals)/
│       └── add-entry.tsx
└── src/
    └── services/
        ├── index.ts         ← Re-exports api
        └── api.ts
```

**✅ Both Work**:
```typescript
// Direct file import
import { apiClient } from '../../src/services/api';

// Folder import (uses index.ts)
import { apiClient } from '../../src/services';
```

---

### Pattern 5: Case Sensitivity Issues (Linux/CI)

**❌ Problem on Linux**:
```typescript
// File exists as: Services/Api.ts
// Import uses: services/api.ts
import { apiClient } from '../../src/services/api'; // ❌ Fails on Linux
```

**✅ Solution**:
```typescript
// Match exact case
import { apiClient } from '../../src/Services/Api'; // ✅ Works everywhere
```

---

## 🔧 Phase B: Alias Import Support

### Setup TypeScript Path Mapping

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/services/*": ["src/services/*"],
      "@/utils/*": ["src/utils/*"]
    }
  }
}
```

### Setup Babel Module Resolver

**babel.config.js**:
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/services': './src/services',
            '@/utils': './src/utils',
          },
        },
      ],
    ],
  };
};
```

**Install Required Package**:
```bash
npm install --save-dev babel-plugin-module-resolver
# or
yarn add --dev babel-plugin-module-resolver
```

**✅ Alias Import Usage**:
```typescript
// Instead of: import { apiClient } from '../../src/services/api';
import { apiClient } from '@/services/api';
```

---

## 🛠️ Phase C: Advanced Resolution & Troubleshooting

### Metro Cache Issues

**Symptoms**: Import worked before but fails after file move/rename

**Solutions**:
```bash
# Expo projects
npx expo start -c

# React Native CLI projects
npx react-native start --reset-cache

# Manual cache clear
rm -rf node_modules/.cache
rm -rf .expo
```

### Metro Config for Complex Structures

**metro.config.js** (Advanced):
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Monorepo support
config.watchFolders = [
  path.resolve(__dirname, '../shared'),
  path.resolve(__dirname, '../packages'),
];

// Custom resolver
config.resolver = {
  ...config.resolver,
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@shared': path.resolve(__dirname, '../shared'),
  },
};

module.exports = config;
```

---

## 🚀 Immediate Fix for Current Issue

Based on your error: `Unable to resolve module ../../src/services/api from /app/frontend/app/modals_add-entry.tsx`

### Root Cause Analysis:
1. **File Location**: `/app/frontend/app/(modals)/add-entry.tsx`
2. **Target**: `/app/frontend/src/services/api.ts`
3. **Current Import**: `../../src/services/api`
4. **Issue**: Metro bundler path resolution with parentheses in folder names

### Immediate Solutions (Try in Order):

**Option 1: Clear Metro Cache**
```bash
cd /app/frontend
npx expo start -c
```

**Option 2: Fix Import Path Structure**
The path `../../src/services/api` should be correct, but Metro might have cached issues.

**Option 3: Verify File Structure**
```bash
# Verify files exist
ls -la /app/frontend/src/services/api.ts
ls -la /app/frontend/app/\(modals\)/add-entry.tsx
```

**Option 4: Temporary Alias Solution**
Add to `babel.config.js`:
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@services': './src/services',
          },
        },
      ],
    ],
  };
};
```

Then use:
```typescript
import { apiClient } from '@services/api';
```

---

## ✅ Validation Checklist

### Pre-Flight Checks:
- [ ] Target file exists at expected location
- [ ] Import path matches directory structure exactly  
- [ ] Case sensitivity matches (especially on Linux)
- [ ] No typos in file extensions (.ts vs .tsx)
- [ ] Metro cache cleared if files were moved recently

### Post-Fix Verification:
- [ ] `npx expo start` runs without import errors
- [ ] IDE/editor shows no red underlines
- [ ] TypeScript compilation succeeds
- [ ] Hot reload works without crashes

---

## 📚 Reference: All Evaluation Cases

1. ✅ **Relative Import - Sibling src/**: `../../src/services/api` (YOUR CASE)
2. ✅ **Nested src/ inside app/**: `../src/services/api`  
3. ✅ **Monorepo external src/**: Metro `watchFolders` config
4. ✅ **Folder with index.ts**: Both direct and folder imports work
5. ✅ **Alias import @/**: Babel + TS config required
6. ✅ **Case mismatch**: Exact case matching required
7. ✅ **Cache after file move**: `npx expo start -c`

**Status**: Phase A Complete ✅ | Phase B Ready ✅ | Phase C Ready ✅