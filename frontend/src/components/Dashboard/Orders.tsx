import React, { useState, useEffect } from 'react';
import { Package, DollarSign, Search, CheckCircle, Clock, Truck, XCircle, Eye } from 'lucide-react';
import { Button, Badge, Input } from '../UI';
import { orderService, Order } from '../../services/orderService';

interface DashboardOrdersProps {
  onBack: () => void;
}

export const DashboardOrders: React.FC<DashboardOrdersProps> = ({ onBack }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : undefined;
      const response = await orderService.getOrders(params);
      setOrders(response.orders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs font-bold border border-yellow-500/30">Pending</span>;
      case 'processing':
        return <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">Processing</span>;
      case 'shipped':
        return <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/30">Shipped</span>;
      case 'delivered':
        return <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">Delivered</span>;
      case 'cancelled':
        return <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">Cancelled</span>;
      default:
        return <span className="px-2 py-1 rounded bg-gray-500/20 text-gray-400 text-xs font-bold border border-gray-500/30">{status}</span>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing': return <Package className="w-4 h-4 text-blue-500" />;
      case 'shipped': return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold text-white mb-4">Order Management</h2>
        <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2">
          ← Back to Dashboard
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
              statusFilter === status 
                ? 'bg-blytz-neon text-black' 
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-blytz-dark border border-white/10 rounded-lg overflow-hidden flex flex-col min-h-[600px]">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="inline-block w-8 h-8 border-2 border-blytz-neon border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 py-20">
            <Package className="w-16 h-16 mb-4 opacity-20" />
            <p>No orders found</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs text-gray-500 uppercase tracking-widest bg-white/5">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-sm font-mono text-blytz-neon">#{order.id.slice(0, 8)}</td>
                  <td className="p-4 text-sm text-white">
                    {order.shipping_address?.first_name} {order.shipping_address?.last_name || 'N/A'}
                  </td>
                  <td className="p-4 text-sm text-gray-400">{order.items.length} items</td>
                  <td className="text-white font-bold">${order.total_amount.toFixed(2)}</td>
                  <td className="p-4">{getStatusBadge(order.status)}</td>
                  <td className="p-4 text-sm text-gray-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => alert(`Order ${order.id} details functionality coming soon!`)}
                      >
                        View
                      </Button>
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={async () => {
                            if (confirm(`Mark order ${order.id.slice(0, 8)} as processing?`)) {
                              try {
                                await orderService.updateOrderStatus(order.id, 'processing');
                                loadOrders();
                              } catch (error) {
                                console.error('Failed to update order:', error);
                                alert('Failed to update order status');
                              }
                            }
                          }}
                        >
                          Process
                        </Button>
                      )}
                      {order.status === 'processing' && (
                        <Button
                          size="sm"
                          onClick={async () => {
                            if (confirm(`Mark order ${order.id.slice(0, 8)} as shipped?`)) {
                              try {
                                await orderService.updateOrderStatus(order.id, 'shipped');
                                loadOrders();
                              } catch (error) {
                                console.error('Failed to update order:', error);
                                alert('Failed to update order status');
                              }
                            }
                          }}
                        >
                          Ship
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
