# Frontend Architecture - Interview Preparation

## Overview

This document covers Next.js App Router structure, component architecture, state management, form handling, routing, and frontend patterns.

---

## Next.js App Router

### Why App Router?

**Benefits:**
- **Server Components:** Better performance, SEO
- **File-based Routing:** Intuitive routing structure
- **Built-in Features:** Image optimization, fonts, code splitting
- **Modern:** Latest React features support
- **Production Ready:** Optimized builds

**Alternatives:**
- **Pages Router:** Older Next.js routing (still supported)
- **Create React App:** No SSR, manual routing
- **Vite + React Router:** No SSR, more configuration

---

## Project Structure

### Directory Layout

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Route group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # Route group
│   │   │   └── dashboard/
│   │   │       ├── gift-cards/
│   │   │       ├── payments/
│   │   │       └── ...
│   │   └── (public)/         # Route group
│   │       └── browse/
│   ├── components/            # Reusable components
│   │   ├── ui/               # UI primitives
│   │   └── ...
│   ├── lib/                   # Utilities
│   │   ├── api.ts            # API client
│   │   ├── auth.ts           # Auth utilities
│   │   └── logger.ts         # Logging
│   └── store/                 # State management
│       └── authStore.ts
```

---

## Route Groups

### Purpose

**Route Groups:** Organize routes without affecting URL structure

**Example:**
```
app/
├── (auth)/
│   ├── login/        # URL: /login
│   └── register/     # URL: /register
├── (dashboard)/
│   └── dashboard/    # URL: /dashboard
└── (public)/
    └── browse/       # URL: /browse
```

**Benefits:**
- Organize routes logically
- Share layouts per group
- No URL impact

---

## Server vs Client Components

### Server Components (Default)

**Characteristics:**
- Run on server
- No JavaScript sent to client
- Can access databases, APIs directly
- Better performance, SEO

**Code Example:**
```typescript
// Server Component (default)
export default async function GiftCardsPage() {
  // This runs on server
  const giftCards = await fetchGiftCards();
  
  return (
    <div>
      {giftCards.map(card => (
        <GiftCardCard key={card.id} card={card} />
      ))}
    </div>
  );
}
```

### Client Components

**Characteristics:**
- Run in browser
- Can use hooks, event handlers
- Marked with `'use client'`

**Code Example:**
```typescript
'use client';

import { useState } from 'react';

export default function InteractiveComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

---

## Component Architecture

### Component Organization

**Structure:**
```
components/
├── ui/                    # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── Modal.tsx
├── dashboard/             # Feature-specific components
│   ├── Sidebar.tsx
│   ├── FilterBar.tsx
│   └── StatsCard.tsx
└── ...
```

### Component Principles

1. **Reusability:** Components used across pages
2. **Composition:** Build complex UIs from simple components
3. **Props Interface:** Clear prop types with TypeScript
4. **Single Responsibility:** Each component has one purpose

**Code Example:**
```typescript
// Reusable Button component
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  return (
    <button
      className={cn('btn', `btn-${variant}`)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Composed component
export function GiftCardForm() {
  return (
    <Card>
      <Input label="Amount" />
      <Button variant="primary">Create</Button>
    </Card>
  );
}
```

---

## State Management

### Zustand

**Why Zustand?**
- **Simplicity:** Minimal boilerplate
- **Performance:** Fast, no unnecessary re-renders
- **TypeScript:** Excellent TypeScript support
- **Size:** Small bundle size (~1KB)
- **No Provider:** No context provider needed

**Store Structure:**
```
store/
├── authStore.ts         # Authentication state
├── featureFlagStore.ts  # Feature flags
└── themeStore.ts        # Theme (dark/light)
```

**Code Example:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearAuth: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Usage in component
function Component() {
  const { user, setUser } = useAuthStore();
  // ...
}
```

**Alternatives:**
- **Redux:** More verbose, steeper learning curve
- **Context API:** Performance issues, prop drilling
- **Jotai/Recoil:** More complex, newer libraries

---

## Form Handling

### React Hook Form + Zod

**Why This Combination?**
- **React Hook Form:** Minimal re-renders, better performance
- **Zod:** Type-safe validation, schema validation
- **Integration:** Seamless integration between them

**Code Example:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const giftCardSchema = z.object({
  value: z.number().positive().max(10000),
  currency: z.string().length(3),
  expiryDate: z.date().optional(),
});

type GiftCardFormData = z.infer<typeof giftCardSchema>;

export function GiftCardForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GiftCardFormData>({
    resolver: zodResolver(giftCardSchema),
  });
  
  const onSubmit = async (data: GiftCardFormData) => {
    await createGiftCard(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register('value', { valueAsNumber: true })}
        error={errors.value?.message}
      />
      <Button type="submit">Create</Button>
    </form>
  );
}
```

**Benefits:**
- Type-safe forms
- Runtime validation
- Minimal re-renders
- Clear error messages

---

## API Integration

### Axios Client

**Configuration:**
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For CSRF token
});
```

### Request Interceptor

**Adds Auth Token and CSRF Token:**
```typescript
api.interceptors.request.use((config) => {
  // Add auth token
  const token = auth.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add CSRF token for state-changing requests
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  
  return config;
});
```

### Response Interceptor

**Handles Token Refresh:**
```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Refresh token
      const refreshToken = auth.getRefreshToken();
      const response = await axios.post('/auth/refresh', { refreshToken });
      
      // Update tokens
      auth.setTokens(response.data.accessToken, response.data.refreshToken);
      
      // Retry original request
      originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
      return api(originalRequest);
    }
    
    return Promise.reject(error);
  }
);
```

---

## Routing & Navigation

### File-based Routing

**Next.js App Router** provides file-based routing:

```
app/
├── page.tsx              # Route: /
├── about/
│   └── page.tsx         # Route: /about
├── dashboard/
│   ├── page.tsx         # Route: /dashboard
│   └── [id]/
│       └── page.tsx     # Route: /dashboard/:id
```

### Dynamic Routes

**Brackets indicate dynamic segments:**
```
app/
└── gift-cards/
    └── [id]/
        └── page.tsx     # Route: /gift-cards/:id
```

**Access in component:**
```typescript
export default function GiftCardPage({ params }: { params: { id: string } }) {
  const { id } = params;
  // Use id...
}
```

### Navigation

**Next.js Link Component:**
```typescript
import Link from 'next/link';

<Link href="/gift-cards/123">View Gift Card</Link>
```

**Programmatic Navigation:**
```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/gift-cards/123');
```

---

## Error Handling

### Error Boundaries

**React Error Boundaries:**
```typescript
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error caught by boundary', { error, errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    
    return this.props.children;
  }
}
```

### API Error Handling

**Try-Catch in Components:**
```typescript
const [error, setError] = useState<string | null>(null);

try {
  await createGiftCard(data);
} catch (err) {
  if (err instanceof AxiosError) {
    setError(err.response?.data?.error?.message || 'An error occurred');
  } else {
    setError('An error occurred');
  }
}
```

---

## Loading States

### Implementation

**Loading State:**
```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async (data: FormData) => {
  setLoading(true);
  try {
    await createGiftCard(data);
  } finally {
    setLoading(false);
  }
};

return (
  <Button disabled={loading}>
    {loading ? 'Creating...' : 'Create'}
  </Button>
);
```

**Suspense Boundaries:**
```typescript
import { Suspense } from 'react';

<Suspense fallback={<LoadingSpinner />}>
  <GiftCardsList />
</Suspense>
```

---

## Feature Flags

### Integration

**Feature Flag Store:**
```typescript
const useFeatureFlagStore = create((set) => ({
  flags: {},
  setFlags: (flags) => set({ flags }),
}));

// Check feature flag
const isEnabled = useFeatureFlagStore((state) => state.flags['new-feature']);

// Conditional rendering
{isEnabled && <NewFeature />}
```

---

## Interview Questions & Answers

### Q: Why Next.js App Router?

**A:** App Router chosen because:
1. **Server Components:** Better performance, SEO
2. **File-based Routing:** Intuitive routing structure
3. **Built-in Features:** Image optimization, code splitting
4. **Modern:** Latest React features support
5. **Production Ready:** Optimized builds

### Q: Explain server vs client components.

**A:** 
- **Server Components:** Run on server, no JavaScript sent, better performance/SEO
- **Client Components:** Run in browser, can use hooks/event handlers, marked with 'use client'

Use server components by default, client components only when needed.

### Q: Why Zustand over Redux?

**A:** Zustand chosen because:
1. **Simplicity:** Minimal boilerplate
2. **Performance:** Fast, no unnecessary re-renders
3. **TypeScript:** Excellent TypeScript support
4. **Size:** Small bundle size
5. **No Provider:** Simpler setup

Redux is more verbose and has steeper learning curve.

### Q: How do you handle forms?

**A:** React Hook Form + Zod:
1. **React Hook Form:** Minimal re-renders, better performance
2. **Zod:** Type-safe validation, schema validation
3. **Integration:** Seamless integration between them

Benefits: Type-safe forms, runtime validation, minimal re-renders.

---

## Key Takeaways

1. **Next.js App Router:** Server components, file-based routing
2. **Component Architecture:** Reusable, composable components
3. **State Management:** Zustand for global state
4. **Form Handling:** React Hook Form + Zod
5. **API Integration:** Axios with interceptors
6. **Error Handling:** Error boundaries, try-catch
7. **Loading States:** Loading indicators, Suspense
8. **45+ Pages:** Well-organized route structure

---

*See other documents for backend API details and authentication.*
