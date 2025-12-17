import React from 'react';
import { Product, Category } from './types';
import { Zap, Headphones, Watch, Smartphone, Activity, Layers } from 'lucide-react';

export const CATEGORIES: Category[] = [
  { id: 'tech', name: 'CyberDeck', icon: <Layers className="w-5 h-5" /> },
  { id: 'audio', name: 'Audio', icon: <Headphones className="w-5 h-5" /> },
  { id: 'wear', name: 'Wearables', icon: <Watch className="w-5 h-5" /> },
  { id: 'mobile', name: 'Mobile', icon: <Smartphone className="w-5 h-5" /> },
  { id: 'sport', name: 'Active', icon: <Activity className="w-5 h-5" /> },
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'NeonX Runner Vapor',
    price: 149.99,
    originalPrice: 220.00,
    rating: 4.9,
    reviews: 128,
    image: 'https://picsum.photos/400/400?random=1',
    category: 'Active',
    isFlash: true,
    timeLeft: '04:23:12',
    description: "Built for speed. The NeonX Runner Vapor features ultra-light composite materials and energy-return foam."
  },
  {
    id: '2',
    title: 'CyberSync Headset Pro',
    price: 299.00,
    rating: 4.8,
    reviews: 854,
    image: 'https://picsum.photos/400/400?random=2',
    category: 'Audio',
    isHot: true,
    description: "Zero latency audio for the competitive edge. Noise cancellation so deep you will hear your own heartbeat."
  },
  {
    id: '3',
    title: 'Quantm Smart Watch',
    price: 350.00,
    rating: 4.7,
    reviews: 342,
    image: 'https://picsum.photos/400/400?random=3',
    category: 'Wearables',
    description: "Track every metric. The Quantm allows for biometric streaming and instant notifications."
  },
  {
    id: '4',
    title: 'Velocity Drone MK-II',
    price: 899.00,
    originalPrice: 1200.00,
    rating: 5.0,
    reviews: 42,
    image: 'https://picsum.photos/400/400?random=4',
    category: 'Tech',
    isFlash: true,
    timeLeft: '01:15:00',
    description: "Capture the impossible. 8K video at 120fps with obstacle avoidance and 45 minute flight time."
  },
  {
    id: '5',
    title: 'MechKey RGB 60%',
    price: 120.00,
    rating: 4.6,
    reviews: 1102,
    image: 'https://picsum.photos/400/400?random=5',
    category: 'Tech',
    description: "Tactile bliss. Hot-swappable switches and per-key RGB programming."
  },
  {
    id: '6',
    title: 'Urban Drift Pack',
    price: 85.00,
    rating: 4.8,
    reviews: 215,
    image: 'https://picsum.photos/400/400?random=6',
    category: 'Active',
    description: "Waterproof, tear-proof, bullet-resistant. The ultimate urban carrier."
  },
    {
    id: '7',
    title: 'HoloLens Visor',
    price: 450.00,
    originalPrice: 600.00,
    rating: 4.5,
    reviews: 88,
    image: 'https://picsum.photos/400/400?random=7',
    category: 'Tech',
    isFlash: true,
    timeLeft: '00:45:00',
    description: "Augmented reality for the everyday. Navigation, notifications, and media overlay."
  },
  {
    id: '8',
    title: 'Boost Juice PowerBank',
    price: 45.00,
    rating: 4.9,
    reviews: 3320,
    image: 'https://picsum.photos/400/400?random=8',
    category: 'Tech',
    isHot: true,
    description: "20,000mAh in your pocket. Charge your laptop, phone, and watch simultaneously."
  }
];
