// Services index - exports all API services

export { api } from './api';

export { authService } from './authService';
export type { User, AuthResponse, LoginCredentials, RegisterData } from './authService';

export { cartService } from './cartService';
export type { AddToCartRequest, BackendCartItem } from './cartService';

export { productService } from './productService';
export type { BackendProduct, PaginatedResponse, transformProduct } from './productService';

export { orderService } from './orderService';
export type {
  Order,
  OrderItem,
  CreateOrderRequest,
  OrderStatistics
} from './orderService';

export { paymentService } from './paymentService';
export type {
  PaymentMethod,
  PaymentIntent,
  CreatePaymentIntentRequest,
  ConfirmPaymentRequest
} from './paymentService';

export { addressService } from './addressService';
export type {
  Address,
  CreateAddressRequest
} from './addressService';

export { auctionService } from './auctionService';
export type {
  Bid,
  Auction,
  AuctionStats,
  AutoBidSettings
} from './auctionService';

export { catalogService } from './catalogService';
export type {
  Category,
  CategoryAttribute,
  ProductVariant,
  ProductCollection,
  InventoryStock,
  StockMovement
} from './catalogService';
