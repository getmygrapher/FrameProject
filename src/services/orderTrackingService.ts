import { supabase } from "../lib/supabase";
import type { Order } from "../lib/supabase";

export interface OrderStatus {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}

export const orderStatuses: OrderStatus[] = [
  {
    id: "pending",
    name: "Order Placed",
    description: "Your order has been received and is being processed",
    icon: "📋",
    color: "blue",
    order: 1,
  },
  {
    id: "processing",
    name: "In Production",
    description: "Your custom frame is being crafted with care",
    icon: "🔨",
    color: "yellow",
    order: 2,
  },
  {
    id: "quality_check",
    name: "Quality Check",
    description: "Final quality inspection and packaging",
    icon: "✅",
    color: "orange",
    order: 3,
  },
  {
    id: "shipped",
    name: "Shipped",
    description: "Your order is on its way to you",
    icon: "🚚",
    color: "purple",
    order: 4,
  },
  {
    id: "delivered",
    name: "Delivered",
    description: "Your order has been successfully delivered",
    icon: "🎉",
    color: "green",
    order: 5,
  },
];

export interface OrderTracking {
  id: string;
  order_id: string;
  status: string;
  message: string;
  location?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  id?: string;
  user_id?: string;
  name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  created_at?: string;
}

export class OrderTrackingService {
  static async createOrderTracking(
    orderTracking: Omit<OrderTracking, "id" | "created_at" | "updated_at">,
  ) {
    const { data, error } = await supabase
      .from("order_tracking")
      .insert([orderTracking])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getOrderTracking(orderId: string): Promise<OrderTracking[]> {
    const { data, error } = await supabase
      .from("order_tracking")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async updateOrderStatus(
    orderId: string,
    status: string,
    message: string,
    trackingNumber?: string,
    estimatedDelivery?: string,
  ) {
    // Update order status
    const { error: orderError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (orderError) throw orderError;

    // Add tracking entry
    const trackingData: Omit<
      OrderTracking,
      "id" | "created_at" | "updated_at"
    > = {
      order_id: orderId,
      status,
      message,
      ...(trackingNumber && { tracking_number: trackingNumber }),
      ...(estimatedDelivery && { estimated_delivery: estimatedDelivery }),
    };

    return await this.createOrderTracking(trackingData);
  }

  static async getOrdersByUser(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async searchOrders(query: string, userId?: string): Promise<Order[]> {
    let queryBuilder = supabase.from("orders").select("*");

    if (userId) {
      queryBuilder = queryBuilder.eq("user_id", userId);
    }

    const { data, error } = await queryBuilder
      .or(
        `order_number.ilike.%${query}%,customer_email.ilike.%${query}%,customer_name.ilike.%${query}%`,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async saveShippingAddress(
    address: Omit<ShippingAddress, "id" | "created_at">,
  ): Promise<ShippingAddress> {
    const { data, error } = await supabase
      .from("shipping_addresses")
      .insert([address])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getShippingAddresses(
    userId: string,
  ): Promise<ShippingAddress[]> {
    const { data, error } = await supabase
      .from("shipping_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateShippingAddress(
    id: string,
    updates: Partial<ShippingAddress>,
  ): Promise<ShippingAddress> {
    const { data, error } = await supabase
      .from("shipping_addresses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteShippingAddress(id: string): Promise<void> {
    const { error } = await supabase
      .from("shipping_addresses")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  static async setDefaultShippingAddress(
    userId: string,
    addressId: string,
  ): Promise<void> {
    // First, unset all default addresses for the user
    await supabase
      .from("shipping_addresses")
      .update({ is_default: false })
      .eq("user_id", userId);

    // Then set the selected address as default
    const { error } = await supabase
      .from("shipping_addresses")
      .update({ is_default: true })
      .eq("id", addressId);

    if (error) throw error;
  }

  static getStatusInfo(status: string): OrderStatus | undefined {
    return orderStatuses.find((s) => s.id === status);
  }

  static getStatusProgress(status: string): number {
    const statusInfo = this.getStatusInfo(status);
    if (!statusInfo) return 0;
    return (statusInfo.order / orderStatuses.length) * 100;
  }

  static async generateTrackingNumber(): Promise<string> {
    const prefix = "FCF";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  static async estimateDelivery(
    shippingMethod: string = "standard",
  ): Promise<string> {
    const now = new Date();
    let deliveryDays = 7; // Default 7 days

    switch (shippingMethod) {
      case "express":
        deliveryDays = 3;
        break;
      case "priority":
        deliveryDays = 5;
        break;
      default:
        deliveryDays = 7;
    }

    const deliveryDate = new Date(
      now.getTime() + deliveryDays * 24 * 60 * 60 * 1000,
    );
    return deliveryDate.toISOString().split("T")[0]; // Return YYYY-MM-DD format
  }
}
