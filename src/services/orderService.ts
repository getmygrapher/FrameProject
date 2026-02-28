import { supabase } from '../lib/supabase';
import type { Order } from '../lib/supabase';

type OrderItem = Order['order_items'][number];

export class OrderService {
  static async uploadOrderPhoto(file: File): Promise<string> {
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `orders/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from('order-photos')
      .upload(filePath, file, { upsert: false });

    if (error) throw error;
    return filePath;
  }

  static async getSignedOrderPhotoUrl(photoPath: string): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from('order-photos')
      .createSignedUrl(photoPath, 60 * 10);

    if (error) {
      console.error('Failed to create signed order photo URL:', error);
      return null;
    }

    return data?.signedUrl || null;
  }

  static async hydrateOrderPhotoUrls(orders: Order[]): Promise<Order[]> {
    return Promise.all(
      (orders || []).map(async (order) => {
        const hydratedItems = await Promise.all(
          (order.order_items || []).map(async (item: OrderItem) => {
            if (item.photo_path) {
              const signedUrl = await this.getSignedOrderPhotoUrl(item.photo_path);
              return { ...item, signed_photo_url: signedUrl || item.photo_url || null };
            }
            return { ...item, signed_photo_url: item.photo_url || null };
          })
        );

        return { ...order, order_items: hydratedItems };
      })
    );
  }

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

  static async getOrderByNumber(orderNumber: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .maybeSingle();

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
