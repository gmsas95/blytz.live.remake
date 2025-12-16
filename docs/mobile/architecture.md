# Mobile Architecture Documentation

## Overview

The mobile application will be a React Native app built with Expo, providing a native mobile experience for the Blytz.live marketplace. It will offer core features like browsing products, participating in auctions, and managing user accounts on iOS and Android platforms.

## Technology Stack

### Framework & Language
- **Expo SDK 50+**: React Native development platform
- **React Native**: Native UI components and APIs
- **TypeScript**: Type-safe JavaScript development
- **Metro**: JavaScript bundler

### State Management
- **Redux Toolkit**: Global state management
- **RTK Query**: Data fetching and caching
- **Redux Persist**: State persistence

### Navigation
- **React Navigation 6**: Navigation library
- **Stack Navigator**: Screen navigation
- **Tab Navigator**: Bottom tab navigation
- **Drawer Navigator**: Side menu navigation

### UI Components & Styling
- **React Native Elements**: Pre-built UI components
- **React Native Vector Icons**: Icon library
- **Styled Components**: CSS-in-JS styling
- **React Native Reanimated**: Animations and gestures

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Flipper**: Debugging tool

### Platform-Specific Features
- **Expo Push Notifications**: Push notifications
- **Expo Camera**: Camera access for photos
- **Expo Image Picker**: Image selection
- **Expo Secure Store**: Secure storage

## Project Structure

```
mobile/
├── src/
│   ├── components/               # Reusable React Native components
│   │   ├── ui/               # Base UI components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   └── index.ts
│   │   ├── auth/             # Authentication components
│   │   │   ├── LoginForm/
│   │   │   ├── RegisterForm/
│   │   │   └── ProtectedScreen/
│   │   ├── auctions/         # Auction components
│   │   │   ├── AuctionCard/
│   │   │   ├── BidButton/
│   │   │   ├── CountdownTimer/
│   │   │   ├── LiveStream/
│   │   │   └── BidHistory/
│   │   ├── products/         # Product components
│   │   │   ├── ProductCard/
│   │   │   ├── ProductGrid/
│   │   │   ├── ProductDetails/
│   │   │   └── ProductForm/
│   │   ├── profile/          # Profile components
│   │   │   ├── UserAvatar/
│   │   │   ├── ProfileInfo/
│   │   │   └── SettingsList/
│   │   └── common/          # Common components
│   │       ├── LoadingSpinner/
│   │       ├── ErrorBoundary/
│   │       ├── ImageUpload/
│   │       ├── SearchBar/
│   │       └── TabBar/
│   ├── screens/               # Screen components
│   │   ├── auth/           # Authentication screens
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   └── VerifyEmailScreen.tsx
│   │   ├── home/           # Home screen
│   │   │   ├── HomeScreen.tsx
│   │   │   └── FeaturedAuctions.tsx
│   │   ├── products/       # Product screens
│   │   │   ├── ProductsScreen.tsx
│   │   │   ├── ProductDetailsScreen.tsx
│   │   │   ├── SearchScreen.tsx
│   │   │   └── CategoriesScreen.tsx
│   │   ├── auctions/       # Auction screens
│   │   │   ├── AuctionsScreen.tsx
│   │   │   ├── AuctionScreen.tsx
│   │   │   ├── LiveAuctionScreen.tsx
│   │   │   └── MyBidsScreen.tsx
│   │   ├── profile/        # Profile screens
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── EditProfileScreen.tsx
│   │   │   ├── MyProductsScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   └── seller/         # Seller screens
│   │       ├── SellerDashboard.tsx
│   │       ├── CreateProductScreen.tsx
│   │       ├── ManageAuctionsScreen.tsx
│   │       └── OrdersScreen.tsx
│   ├── navigation/            # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   ├── SellerNavigator.tsx
│   │   └── types.ts
│   ├── services/              # API and service layer
│   │   ├── api/            # API client setup
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── products.ts
│   │   │   ├── auctions.ts
│   │   │   └── types.ts
│   │   ├── storage/        # Storage services
│   │   │   ├── secureStore.ts
│   │   │   ├── asyncStorage.ts
│   │   │   └── imageCache.ts
│   │   ├── notifications/ # Push notifications
│   │   │   ├── pushNotifications.ts
│   │   │   └── notificationHandlers.ts
│   │   └── websocket/     # WebSocket connection
│   │       ├── socket.ts
│   │       ├── events.ts
│   │       └── handlers.ts
│   ├── store/                # Redux store configuration
│   │   ├── index.ts        # Store setup
│   │   ├── slices/         # Redux slices
│   │   │   ├── authSlice.ts
│   │   │   ├── productsSlice.ts
│   │   │   ├── auctionsSlice.ts
│   │   │   └── appSlice.ts
│   │   └── api/            # RTK Query API
│   │       ├── authApi.ts
│   │       ├── productsApi.ts
│   │       └── auctionsApi.ts
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useWebSocket.ts
│   │   ├── useCamera.ts
│   │   ├── usePermissions.ts
│   │   └── useDebounce.ts
│   ├── utils/                # Utility functions
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   ├── constants.ts
│   │   ├── permissions.ts
│   │   └── helpers.ts
│   ├── types/                # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── auction.ts
│   │   ├── navigation.ts
│   │   └── api.ts
│   ├── assets/               # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   └── styles/               # Style files
│       ├── theme.ts
│       ├── colors.ts
│       ├── typography.ts
│       └── spacing.ts
├── android/                  # Android-specific files
├── ios/                      # iOS-specific files
├── __tests__/                # Test files
├── App.tsx                   # Root app component
├── app.json                  # Expo configuration
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── babel.config.js            # Babel configuration
├── metro.config.js            # Metro bundler config
└── README.md                 # Project documentation
```

## Architecture Patterns

### 1. Component Architecture
- **Container Components**: Handle state and business logic
- **Presentation Components**: Handle UI rendering only
- **Component Composition**: Build complex UI from simple components
- **Prop Drilling**: Avoid with Redux and Context

### 2. State Management
- **Redux Toolkit**: Global state management
- **RTK Query**: Server state and caching
- **Local State**: React useState for component-specific state
- **Persistent State**: Redux Persist for app state

### 3. Navigation Architecture
- **Nested Navigators**: Auth and Main flow navigators
- **Screen Isolation**: Each screen is a separate component
- **Route Guards**: Protected screens for authenticated users
- **Deep Linking**: Handle external links to app content

## Component Implementation

### Base UI Components
```typescript
// src/components/ui/Button/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'medium',
  onPress,
  loading = false,
  disabled = false,
}: ButtonProps) {
  const theme = useTheme();
  
  const getButtonStyle = () => {
    const baseStyle = styles.button;
    const variantStyle = styles[variant];
    const sizeStyle = styles[size];
    
    return [
      baseStyle,
      variantStyle,
      sizeStyle,
      { backgroundColor: theme.colors[variant] },
      disabled && styles.disabled,
    ];
  };

  const getTextStyle = () => [
    styles.text,
    { color: theme.colors.buttonText },
  ];

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.buttonText} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primary: {},
  secondary: {
    borderWidth: 1,
  },
  outline: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  text: {
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
```

### Authentication Components
```typescript
// src/components/auth/LoginForm/LoginForm.tsx
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '@/store/api/authApi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { setCredentials } from '@/store/slices/authSlice';

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const dispatch = useDispatch();
  
  const [login, { isLoading }] = useLoginMutation();

  const handleInputChange = (field: keyof LoginFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const result = await login(formData).unwrap();
      dispatch(setCredentials(result));
      onLogin();
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="Email"
        value={formData.email}
        onChangeText={handleInputChange('email')}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <Input
        label="Password"
        value={formData.password}
        onChangeText={handleInputChange('password')}
        error={errors.password}
        secureTextEntry
      />
      
      <Button
        title="Login"
        onPress={handleSubmit}
        loading={isLoading}
        style={styles.loginButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  loginButton: {
    marginTop: 20,
  },
});
```

## State Management

### Redux Store Setup
```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authSlice } from './slices/authSlice';
import { productsSlice } from './slices/productsSlice';
import { api } from './api';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth state
};

const persistedAuthReducer = persistReducer(persistConfig, authSlice.reducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    products: productsSlice.reducer,
    api: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(api.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Auth Slice
```typescript
// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{
      user: User;
      access_token: string;
      refresh_token: string;
    }>) => {
      const { user, access_token, refresh_token } = action.payload;
      state.user = user;
      state.token = access_token;
      state.refreshToken = refresh_token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
```

### RTK Query API
```typescript
// src/store/api/authApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/store';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/register',
        method: 'POST',
        body: userData,
      }),
    }),
    refreshToken: builder.mutation<AuthResponse, { refresh_token: string }>({
      query: ({ refresh_token }) => ({
        url: '/refresh',
        method: 'POST',
        body: { refresh_token },
      }),
    }),
    getProfile: builder.query<User, void>({
      query: () => '/profile',
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useGetProfileQuery,
} = authApi;
```

## Navigation Architecture

### App Navigator
```typescript
// src/navigation/AppNavigator.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { RootState } from '@/store';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { SellerNavigator } from './SellerNavigator';

export function AppNavigator() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : user?.role === 'seller' || user?.role === 'admin' ? (
        <SellerNavigator />
      ) : (
        <MainNavigator />
      )}
    </NavigationContainer>
  );
}
```

### Main Tab Navigator
```typescript
// src/navigation/MainNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { HomeScreen } from '@/screens/home/HomeScreen';
import { ProductsScreen } from '@/screens/products/ProductsScreen';
import { AuctionsScreen } from '@/screens/auctions/AuctionsScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { ProductDetailsScreen } from '@/screens/products/ProductDetailsScreen';
import { AuctionScreen } from '@/screens/auctions/AuctionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="Auction" component={AuctionScreen} />
    </Stack.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string;
          
          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Products':
              iconName = 'shopping-bag';
              break;
            case 'Auctions':
              iconName = 'gavel';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Auctions" component={AuctionsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

## Real-time Features

### WebSocket Integration
```typescript
// src/services/websocket/socket.ts
import io, { Socket } from 'socket.io-client';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    this.socket = io(process.env.EXPO_PUBLIC_WS_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.handleReconnect();
    });

    this.socket.on('new-bid', (bid) => {
      // Dispatch to Redux store
      store.dispatch(auctionsSlice.actions.addBid(bid));
    });

    this.socket.on('auction-ended', (result) => {
      // Handle auction completion
      store.dispatch(auctionsSlice.actions.endAuction(result));
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      setTimeout(() => {
        const token = store.getState().auth.token;
        if (token) {
          this.connect(token);
        }
      }, delay);
    }
  }

  joinAuction(auctionId: string) {
    this.socket?.emit('join-auction', { auctionId });
  }

  placeBid(auctionId: string, amount: number) {
    this.socket?.emit('place-bid', { auctionId, amount });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const webSocketService = new WebSocketService();
```

### Custom Hook for WebSocket
```typescript
// src/hooks/useWebSocket.ts
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { webSocketService } from '@/services/websocket/socket';
import { auctionsSlice } from '@/store/slices/auctionsSlice';

export function useWebSocket() {
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated && token) {
      webSocketService.connect(token);
    }

    return () => {
      webSocketService.disconnect();
    };
  }, [isAuthenticated, token]);

  return {
    joinAuction: webSocketService.joinAuction.bind(webSocketService),
    placeBid: webSocketService.placeBid.bind(webSocketService),
  };
}
```

## Performance Optimizations

### 1. Image Caching
```typescript
// src/services/storage/imageCache.ts
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

class ImageCacheService {
  private cacheDirectory = FileSystem.cacheDirectory + 'images/';

  async cacheImage(uri: string): Promise<string> {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      uri
    );
    const cachePath = `${this.cacheDirectory}${hash}`;

    try {
      const info = await FileSystem.getInfoAsync(cachePath);
      if (info.exists) {
        return cachePath;
      }

      await FileSystem.makeDirectoryAsync(this.cacheDirectory, { intermediates: true });
      await FileSystem.downloadAsync(uri, cachePath);
      return cachePath;
    } catch (error) {
      console.error('Error caching image:', error);
      return uri;
    }
  }
}

export const imageCache = new ImageCacheService();
```

### 2. List Optimization
```typescript
// src/components/products/ProductGrid/ProductGrid.tsx
import React, { memo } from 'react';
import { FlatList, View } from 'react-native';
import { ProductCard } from '@/components/products/ProductCard';
import { Product } from '@/types/product';

interface ProductGridProps {
  products: Product[];
  onEndReached?: () => void;
  loading?: boolean;
}

const ProductItem = memo(({ item }: { item: Product }) => (
  <ProductCard product={item} />
));

export function ProductGrid({ products, onEndReached, loading }: ProductGridProps) {
  const renderItem = ({ item }: { item: Product }) => (
    <ProductItem item={item} />
  );

  const keyExtractor = (item: Product) => item.id;

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={2}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loading ? <ActivityIndicator /> : null}
      getItemLayout={(data, index) => ({
        length: 200, // Approximate item height
        offset: 200 * index,
        index,
      })}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
    />
  );
}
```

## Security Implementation

### Secure Storage
```typescript
// src/services/storage/secureStore.ts
import * as SecureStore from 'expo-secure-store';

class SecureStorageService {
  async storeToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync('auth_token', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('auth_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('auth_token');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }
}

export const secureStorage = new SecureStorageService();
```

### Network Security
```typescript
// src/services/api/client.ts
import axios from 'axios';
import { RootState } from '@/store';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh
      const refreshToken = store.getState().auth.refreshToken;
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth/refresh`,
            { refresh_token: refreshToken }
          );
          
          const { access_token } = response.data;
          store.dispatch(setCredentials(response.data));
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${access_token}`;
          return apiClient.request(error.config);
        } catch (refreshError) {
          // Refresh failed, logout user
          store.dispatch(logout());
        }
      }
    }
    return Promise.reject(error);
  }
);
```

## Testing Strategy

### Component Testing
```typescript
// __tests__/components/Button/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with title', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} loading />
    );
    
    // Should show activity indicator instead of text
    expect(() => getByText('Test Button')).toThrow();
  });
});
```

### E2E Testing with Detox
```typescript
// e2e/LoginFlow.e2e.ts
import { element, by, expect } from 'detox';

describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should show error for invalid credentials', async () => {
    await element(by.id('email-input')).typeText('invalid@example.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    await element(by.id('login-button')).tap();
    
    await expect(element(by.text('Invalid email or password'))).toBeVisible();
  });
});
```

## Deployment Configuration

### Expo Configuration
```json
{
  "expo": {
    "name": "Blytz Live",
    "slug": "blytz-live",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.blytz.live"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.blytz.live"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-font",
      "expo-secure-store",
      "expo-camera",
      "expo-image-picker",
      "expo-push-notifications"
    ],
    "extra": {
      "apiUrl": process.env.EXPO_PUBLIC_API_URL,
      "wsUrl": process.env.EXPO_PUBLIC_WS_URL
    }
  }
}
```

This mobile architecture provides a solid foundation for building native iOS and Android applications with excellent performance, security, and user experience for the Blytz.live marketplace platform.