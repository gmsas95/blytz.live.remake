import { api } from './api';

export interface Bid {
  id: string;
  auction_id: string;
  user_id: string;
  amount: number;
  is_autobid: boolean;
  created_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface Auction {
  id: string;
  product_id: string;
  seller_id: string;
  title: string;
  description?: string;
  starting_price: number;
  reserve_price?: number;
  current_price: number;
  buy_now_price?: number;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  image?: string;
  total_bids: number;
  min_bid_increment: number;
  is_live: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuctionStats {
  total_bids: number;
  unique_bidders: number;
  highest_bid: number;
  lowest_bid: number;
  average_bid: number;
  bid_history: Bid[];
}

export interface AutoBidSettings {
  enabled: boolean;
  max_amount: number;
}

export const auctionService = {
  async getAuctions(params?: { page?: number; limit?: number; status?: string }): Promise<{ auctions: Auction[]; total: number }> {
    const response = await api.get('/auctions', { params });
    return {
      auctions: response.data.auctions || response.data || [],
      total: response.data.total || 0
    };
  },

  async getLiveAuctions(): Promise<Auction[]> {
    const response = await api.get('/auctions/live');
    return response.data.auctions || response.data || [];
  },

  async getAuction(id: string): Promise<Auction> {
    const response = await api.get(`/auctions/${id}`);
    return response.data;
  },

  async getAuctionBids(id: string, params?: { limit?: number }): Promise<{ bids: Bid[]; total: number }> {
    const response = await api.get(`/auctions/${id}/bids`, { params });
    return {
      bids: response.data.bids || response.data || [],
      total: response.data.total || 0
    };
  },

  async getAuctionStats(id: string): Promise<AuctionStats> {
    const response = await api.get(`/auctions/${id}/stats`);
    return response.data;
  },

  async createAuction(data: {
    product_id: string;
    starting_price: number;
    reserve_price?: number;
    buy_now_price?: number;
    start_time: string;
    end_time: string;
  }): Promise<Auction> {
    const response = await api.post('/auctions', data);
    return response.data;
  },

  async placeBid(auctionId: string, amount: number): Promise<Bid> {
    const response = await api.post(`/auctions/${auctionId}/bid`, { amount });
    return response.data;
  },

  async setAutoBid(auctionId: string, settings: AutoBidSettings): Promise<any> {
    const response = await api.post(`/auctions/${auctionId}/autobid`, settings);
    return response.data;
  },

  async joinAuction(auctionId: string): Promise<any> {
    const response = await api.post(`/auctions/${auctionId}/join`);
    return response.data;
  },

  async leaveAuction(auctionId: string): Promise<any> {
    const response = await api.post(`/auctions/${auctionId}/leave`);
    return response.data;
  },

  async startAuction(auctionId: string): Promise<Auction> {
    const response = await api.put(`/auctions/${auctionId}/start`);
    return response.data;
  },

  async endAuction(auctionId: string): Promise<Auction> {
    const response = await api.put(`/auctions/${auctionId}/end`);
    return response.data;
  }
};
