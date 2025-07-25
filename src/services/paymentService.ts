import { supabase } from "../lib/supabase";

// Razorpay configuration
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_demo";

export interface PaymentMethod {
  id: string;
  name: string;
  type: "card" | "upi" | "netbanking" | "wallet";
  icon: string;
  enabled: boolean;
}

export const paymentMethods: PaymentMethod[] = [
  {
    id: "razorpay_card",
    name: "Credit/Debit Card",
    type: "card",
    icon: "💳",
    enabled: true,
  },
  {
    id: "razorpay_upi",
    name: "UPI",
    type: "upi",
    icon: "📱",
    enabled: true,
  },
  {
    id: "razorpay_netbanking",
    name: "Net Banking",
    type: "netbanking",
    icon: "🏦",
    enabled: true,
  },
  {
    id: "paytm",
    name: "Paytm Wallet",
    type: "wallet",
    icon: "💰",
    enabled: true,
  },
  {
    id: "phonepe",
    name: "PhonePe",
    type: "upi",
    icon: "📞",
    enabled: true,
  },
  {
    id: "googlepay",
    name: "Google Pay",
    type: "upi",
    icon: "🔍",
    enabled: true,
  },
];

export interface PaymentData {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
}

export class PaymentService {
  private static loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  static async createOrder(orderData: PaymentData): Promise<any> {
    try {
      // In a real implementation, this would call your backend API
      // For demo purposes, we'll simulate order creation
      const order = {
        id: `order_${Date.now()}`,
        amount: Math.round(orderData.amount * 100), // Convert to paise
        currency: orderData.currency,
        receipt: orderData.orderId,
      };

      return order;
    } catch (error) {
      console.error("Error creating payment order:", error);
      throw error;
    }
  }

  static async processPayment(
    paymentData: PaymentData,
    paymentMethod: string = "razorpay_card",
  ): Promise<PaymentResult> {
    try {
      // Load Razorpay script
      const isLoaded = await this.loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Failed to load Razorpay SDK");
      }

      // Create order
      const order = await this.createOrder(paymentData);

      return new Promise((resolve) => {
        const options = {
          key: RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: "FrameCraft Pro",
          description: "Custom Photo Frame Order",
          order_id: order.id,
          prefill: {
            name: paymentData.customerName,
            email: paymentData.customerEmail,
            contact: paymentData.customerPhone || "",
          },
          theme: {
            color: "#2563eb",
          },
          method: this.getPaymentMethodConfig(paymentMethod),
          handler: (response: any) => {
            resolve({
              success: true,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            });
          },
          modal: {
            ondismiss: () => {
              resolve({
                success: false,
                error: "Payment cancelled by user",
              });
            },
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      });
    } catch (error) {
      console.error("Payment processing error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Payment failed",
      };
    }
  }

  private static getPaymentMethodConfig(method: string) {
    switch (method) {
      case "razorpay_upi":
        return { upi: true };
      case "razorpay_netbanking":
        return { netbanking: true };
      case "paytm":
        return { wallet: { paytm: true } };
      case "phonepe":
        return { upi: true };
      case "googlepay":
        return { upi: true };
      default:
        return { card: true };
    }
  }

  static async verifyPayment(
    paymentId: string,
    orderId: string,
    signature: string,
  ): Promise<boolean> {
    try {
      // In a real implementation, this would verify the payment signature on your backend
      // For demo purposes, we'll assume verification is successful
      console.log("Verifying payment:", { paymentId, orderId, signature });
      return true;
    } catch (error) {
      console.error("Payment verification error:", error);
      return false;
    }
  }

  static calculateVolumeDiscount(
    quantity: number,
    basePrice: number,
  ): { discount: number; finalPrice: number } {
    let discountPercentage = 0;

    if (quantity >= 10) {
      discountPercentage = 15; // 15% discount for 10+ items
    } else if (quantity >= 5) {
      discountPercentage = 10; // 10% discount for 5+ items
    } else if (quantity >= 3) {
      discountPercentage = 5; // 5% discount for 3+ items
    }

    const discount = (basePrice * discountPercentage) / 100;
    const finalPrice = basePrice - discount;

    return { discount, finalPrice };
  }

  static formatCurrency(amount: number, currency: string = "INR"): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }
}
