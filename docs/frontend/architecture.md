# Frontend Architecture Documentation

## Overview

The frontend will be a modern, responsive web application built with Next.js 16+, TypeScript, and Tailwind CSS. It will provide an intuitive interface for buyers and sellers participating in live auctions and marketplace activities.

## Technology Stack

### Framework & Language
- **Next.js 16+**: React framework with App Router
- **TypeScript 5+**: Type-safe JavaScript
- **React 18+**: UI library with hooks and concurrent features

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible component primitives
- **Custom Components**: Branded components built on top of Radix

### State Management
- **React Query**: Server state management and caching
- **Context API**: Global client state (authentication, theme)
- **Zustand**: (Optional) Lightweight state management

### Forms & Validation
- **React Hook Form**: Performant forms with hooks
- **Zod**: TypeScript-first schema validation
- **React Hook Form + Zod**: Integration for form validation

### Real-time Features
- **Socket.IO Client**: WebSocket communication
- **React Query WebSockets**: Real-time data synchronization

### Development Tools
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **TypeScript**: Static type checking

## Project Structure

```
frontend/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/             # Authentication routes group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/         # Dashboard routes group
│   │   │   ├── buyer/
│   │   │   └── seller/
│   │   ├── auctions/            # Auction pages
│   │   ├── products/           # Product pages
│   │   ├── profile/            # User profile pages
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── loading.tsx         # Loading states
│   ├── components/              # Reusable React components
│   │   ├── ui/               # Base UI components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Table/
│   │   │   └── index.ts
│   │   ├── auth/             # Authentication components
│   │   │   ├── LoginForm/
│   │   │   ├── RegisterForm/
│   │   │   └── ProtectedRoute/
│   │   ├── auctions/         # Auction components
│   │   │   ├── AuctionCard/
│   │   │   ├── AuctionItem/
│   │   │   ├── BidPanel/
│   │   │   └── LiveStream/
│   │   ├── products/         # Product components
│   │   │   ├── ProductCard/
│   │   │   ├── ProductGrid/
│   │   │   ├── ProductForm/
│   │   │   └── ProductFilters/
│   │   ├── layout/           # Layout components
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── Sidebar/
│   │   │   └── Navigation/
│   │   └── common/          # Common components
│   │       ├── LoadingSpinner/
│   │       ├── ErrorBoundary/
│   │       ├── ImageUpload/
│   │       └── SearchBox/
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts        # Authentication state
│   │   ├── useSocket.ts      # WebSocket connection
│   │   ├── useLocalStorage.ts # Local storage operations
│   │   └── useDebounce.ts    # Debounce utility
│   ├── lib/                   # Utility libraries
│   │   ├── api/              # API client functions
│   │   │   ├── auth.ts
│   │   │   ├── products.ts
│   │   │   ├── auctions.ts
│   │   │   └── client.ts
│   │   ├── utils/            # Helper functions
│   │   │   ├── validation.ts
│   │   │   ├── formatting.ts
│   │   │   ├── constants.ts
│   │   │   └── helpers.ts
│   │   ├── socket/           # Socket.IO setup
│   │   │   ├── index.ts
│   │   │   ├── events.ts
│   │   │   └── handlers.ts
│   │   └── config/           # Configuration
│   │       ├── env.ts
│   │       └── constants.ts
│   ├── types/                 # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── auction.ts
│   │   ├── api.ts
│   │   └── global.d.ts
│   ├── styles/                # Style files
│   │   ├── globals.css
│   │   ├── components.css
│   │   └── animations.css
│   └── assets/                # Static assets
│       ├── images/
│       ├── icons/
│       └── fonts/
├── public/                   # Public static files
├── next.config.js            # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── package.json            # Dependencies and scripts
├── .env.example           # Environment variables template
└── README.md              # Project documentation
```

## Architecture Patterns

### 1. Feature-Based Structure
Components are organized by feature/domain rather than file type, making it easier to locate and maintain related code.

### 2. Atomic Design
Components follow atomic design principles:
- **Atoms**: Basic UI elements (Button, Input)
- **Molecules**: Combinations of atoms (SearchBox)
- **Organisms**: Complex UI sections (Header, ProductGrid)
- **Templates**: Page layouts
- **Pages**: Complete page implementations

### 3. Server Components vs Client Components
Using Next.js 13+ app router:
- **Server Components**: Default, run on server, can access server resources
- **Client Components**: Use 'use client', have interactivity and state

### 4. Progressive Enhancement
Core functionality works without JavaScript, enhanced experience when JavaScript is available.

## Component Architecture

### Base UI Components
```typescript
// src/components/ui/Button/Button.tsx
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/helpers';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
export { Button, buttonVariants };
```

### Authentication Components
```typescript
// src/components/auth/ProtectedRoute/ProtectedRoute.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'buyer' | 'seller' | 'admin';
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return fallback || <div>Loading...</div>;
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return fallback || <div>Access denied</div>;
  }

  return <>{children}</>;
}
```

## State Management

### Authentication State
```typescript
// src/hooks/useAuth.ts
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/auth';
import { apiClient } from '@/lib/api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post('/auth/login', {
            email,
            password,
          });

          const { user, access_token, refresh_token } = response.data;
          
          set({
            user,
            token: access_token,
            refreshToken: refresh_token,
            isLoading: false,
          });

          // Configure API client with token
          apiClient.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${access_token}`;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
        });
        delete apiClient.defaults.headers.common['Authorization'];
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          get().logout();
          return;
        }

        try {
          const response = await apiClient.post('/auth/refresh', {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: new_refresh_token } = response.data;
          
          set({
            token: access_token,
            refreshToken: new_refresh_token,
          });

          apiClient.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${access_token}`;
        } catch (error) {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### Server State with React Query
```typescript
// src/lib/api/products.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { Product, CreateProductRequest } from '@/types/product';

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await apiClient.get('/products', { params: filters });
      return response.data;
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateProductRequest) => {
      const response = await apiClient.post('/products', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

## Real-time Features

### Socket.IO Integration
```typescript
// src/lib/socket/index.ts
'use client';

import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';

export function useSocket() {
  const { token } = useAuth();
  
  const socket: Socket = io(process.env.NEXT_PUBLIC_WS_URL, {
    auth: { token },
  });

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return socket;
}

// Usage in auction component
export function useAuctionSocket(auctionId: string) {
  const socket = useSocket();

  useEffect(() => {
    socket.emit('join-auction', { auctionId });

    socket.on('new-bid', (bid) => {
      // Handle new bid
    });

    socket.on('auction-ended', (result) => {
      // Handle auction completion
    });

    return () => {
      socket.emit('leave-auction', { auctionId });
    };
  }, [socket, auctionId]);

  const placeBid = (amount: number) => {
    socket.emit('place-bid', { auctionId, amount });
  };

  return { placeBid };
}
```

## Forms & Validation

### Form with Zod Validation
```typescript
// src/components/products/ProductForm/ProductForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateProduct } from '@/lib/api/products';

const createProductSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category_id: z.string().uuid('Invalid category'),
  starting_price: z.number().min(0.01, 'Starting price must be > 0'),
  buy_now_price: z.number().optional(),
});

type CreateProductFormData = z.infer<typeof createProductSchema>;

export function ProductForm() {
  const createProduct = useCreateProduct();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
  });

  const onSubmit = (data: CreateProductFormData) => {
    createProduct.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register('title')}
        error={errors.title?.message}
        placeholder="Product title"
      />
      
      <Input
        {...register('starting_price', { valueAsNumber: true })}
        error={errors.starting_price?.message}
        type="number"
        step="0.01"
        placeholder="Starting price"
      />
      
      <Button
        type="submit"
        disabled={createProduct.isLoading}
      >
        {createProduct.isLoading ? 'Creating...' : 'Create Product'}
      </Button>
    </form>
  );
}
```

## Performance Optimizations

### 1. Code Splitting
```typescript
// Dynamic imports for large components
const AuctionStream = dynamic(
  () => import('@/components/auctions/LiveStream'),
  { loading: () => <div>Loading stream...</div> }
);
```

### 2. Image Optimization
```typescript
// Next.js Image component with optimization
import Image from 'next/image';

<Image
  src={product.imageUrl}
  alt={product.title}
  width={300}
  height={200}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 3. Caching Strategy
```typescript
// React Query caching configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});
```

## Security Implementation

### 1. Content Security Policy
```javascript
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' ${process.env.NEXT_PUBLIC_WS_URL};
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
];
```

### 2. API Security
```typescript
// Secure API client with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        await refreshAuth();
        // Retry original request
        return apiClient.request(error.config);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);
```

## Testing Strategy

### Unit Testing
```typescript
// __tests__/components/Button/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies variant styles', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
  });
});
```

### Integration Testing
```typescript
// __tests__/pages/auth/Login.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-query';
import LoginPage from '@/app/(auth)/login/page';

const mockLogin = jest.fn();
jest.mock('@/lib/api/auth', () => ({
  useLogin: () => ({ mutate: mockLogin }),
}));

describe('LoginPage', () => {
  it('submits login form', async () => {
    const user = userEvent.setup();
    
    render(
      <Provider>
        <LoginPage />
      </Provider>
    );

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
```

## Deployment Configuration

### Next.js Configuration
```javascript
// next.config.js
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['cdn.blytz.live'],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
```

This architecture provides a solid foundation for building a modern, scalable, and maintainable frontend application for the Blytz.live marketplace platform.