# Razorpay Environment Variables Configuration

To successfully integrate Razorpay into the Cotton Brokerage platform, you must configure your environment variables for both the backend (Django) and frontend (Next.js).

## 1. Backend (`backend/.env`)

These variables are required for the Django API to securely generate subscription checkout links and verify incoming webhooks from Razorpay.

```env
# Your Razorpay Public API Key
RAZORPAY_KEY_ID=rzp_test_your_key_id_here

# Your Razorpay Secret API Key (Keep this secret!)
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# A custom webhook secret you configure in the Razorpay Dashboard to secure webhook endpoints
RAZORPAY_WEBHOOK_SECRET=your_custom_webhook_secret_here

# The exact Plan IDs generated in your Razorpay Dashboard under Subscriptions > Plans
RAZORPAY_PLAN_1_YEAR=plan_xyz123...
RAZORPAY_PLAN_3_YEAR=plan_xyz456...
RAZORPAY_PLAN_5_YEAR=plan_xyz789...
```

## 2. Frontend (`frontend/.env.local`)

Only the Public Key is required on the frontend to initialize the Razorpay checkout modal securely.

```env
# Notice the NEXT_PUBLIC_ prefix, which allows Next.js to expose this to the browser
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
```

### Next Steps for the Admin:
1. Go to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Account & Settings > API Keys** to generate your `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
3. Navigate to **Subscriptions > Plans** to create 1-Year, 3-Year, and 5-Year plans. Copy their `plan_...` IDs.
4. Navigate to **Account & Settings > Webhooks**. Add a new webhook pointing to `https://your-domain.com/api/payments/webhook/`.
   - Select events: `subscription.charged` and `payment.captured`.
   - Set the Secret field to whatever you used for `RAZORPAY_WEBHOOK_SECRET`.
