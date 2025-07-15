/**
 * OrderService provides methods for managing orders and order statistics.
 * 
 * Error Handling Contract:
 * - All async methods may throw errors (from Supabase or custom Error instances).
 * - Callers MUST wrap calls in try/catch and provide user feedback as appropriate.
 * - Errors are logged to the console for debugging, but not handled internally.
 */
import { supabase } from '../lib/supabase';
import type { Order } from '../lib/supabase';

// Helper to format Supabase errors
function formatSupabaseError(error: any, fallback: string): Error {
  if (error && error.message) {
    return new Error(error.message);
  }
  return new Error(fallback);
}

export class OrderService {
  static async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
    if (error) {
      console.error('Error creating order:', error);
      throw formatSupabaseError(error, 'Failed to create order. Please try again.');
    }
    return data;
  }

  static async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching orders:', error);
      throw formatSupabaseError(error, 'Failed to fetch orders. Please try again.');
    }
    return data;
  }

  static async getOrderById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Error fetching order by ID:', error);
      throw formatSupabaseError(error, 'Failed to fetch order. Please try again.');
    }
    return data;
  }

  static async updateOrderStatus(id: string, status: Order['status']) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating order status:', error);
      throw formatSupabaseError(error, 'Failed to update order status. Please try again.');
    }
    return data;
  }

  static async updatePaymentStatus(id: string, paymentStatus: Order['payment_status']) {
    const { data, error } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating payment status:', error);
      throw formatSupabaseError(error, 'Failed to update payment status. Please try again.');
    }
    return data;
  }

  static async getOrderStats() {
    try {
      // Get all orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select('status, total_amount, payment_status');

      if (error) {
        console.error('Error fetching order stats:', error);
        throw formatSupabaseError(error, 'Failed to fetch order statistics. Please try again.');
      }

      // Calculate statistics
      const stats = {
        totalOrders: orders?.length || 0,
        pendingOrders: orders?.filter(order => order.status === 'pending').length || 0,
        processingOrders: orders?.filter(order => order.status === 'processing').length || 0,
        shippedOrders: orders?.filter(order => order.status === 'shipped').length || 0,
        deliveredOrders: orders?.filter(order => order.status === 'delivered').length || 0,
        totalRevenue: orders?.reduce((sum, order) => {
          // Only count paid orders in revenue
          if (order.payment_status === 'paid') {
            return sum + parseFloat(order.total_amount.toString());
          }
          return sum;
        }, 0) || 0
      };

      return stats;
    } catch (error) {
      console.error('Error in getOrderStats:', error);
      throw new Error('Failed to fetch order statistics. Please try again.');
    }
  }

  static async deleteOrder(id: string) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting order:', error);
      throw formatSupabaseError(error, 'Failed to delete order. Please try again.');
    }
  }
}