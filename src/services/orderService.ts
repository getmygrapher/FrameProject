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

export class OrderService {
  static async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getOrderById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateOrderStatus(id: string, status: Order['status']) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updatePaymentStatus(id: string, paymentStatus: Order['payment_status']) {
    const { data, error } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getOrderStats() {
    try {
      // Get all orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select('status, total_amount, payment_status');

      if (error) throw error;

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
      console.error('Error fetching order stats:', error);
      throw error;
    }
  }

  static async deleteOrder(id: string) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}