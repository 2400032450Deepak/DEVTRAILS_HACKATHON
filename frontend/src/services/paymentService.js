import { createPayment } from "./api";

export const initiatePayment = async (payload) => {
  return createPayment(payload);
};

export const verifyPayment = async ({ paymentId }) => {
  // Future-ready: replace with backend endpoint call like POST /payment/verify.
  if (!paymentId) {
    return { verified: false };
  }
  return { verified: true };
};

export const paymentGatewayHandlers = {
  launchRazorpay: async (paymentResponse) => {
    // Hook Razorpay SDK modal integration here once backend sends order details.
    return Promise.resolve({ started: true, provider: "RAZORPAY", paymentResponse });
  },
  launchUpi: async (paymentResponse) => {
    // Hook UPI intent/deep-link flow here once backend sends UPI payload.
    return Promise.resolve({ started: true, provider: "UPI", paymentResponse });
  }
};
