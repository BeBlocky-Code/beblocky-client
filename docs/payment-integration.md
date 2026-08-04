# Payment Integration System

> **Outdated.** The client no longer builds gateway payloads or creates
> subscriptions. `lib/api/payment.ts` and the `/api/payment/webhook` route were
> removed; `usePayment` now exposes a single `startCheckout` that calls
> `POST /subscriptions/checkout`, and the success page polls
> `GET /subscriptions/checkout/:paymentId/status` until the server confirms the
> payment. See `beblocky-api/docs/subscription-system.md` for the current flow.
>
> Current client surface:
>
> - `usePayment().startCheckout({ planName, billingCycle, provider, phone?, quantity? })`
> - `useSubscription()` — reads `/subscriptions/me`, exposes
>   `hasEffectiveEntitlement()`, `getExpiryDate()`, `getDaysRemaining()` and
>   `cancelSubscription()`
> - Gating uses `isEntitlementEffective` / `isEffectiveEntitlement`, which
>   require `status === "active"` **and** `endDate > now`

## Overview

The payment system provides a seamless experience for users to upgrade their subscriptions with support for:

- **ArifPay**: Ethiopian local payment methods (Telebirr, Awash Bank, CBE, Amole, etc.)
- **Stripe**: International payment methods (Visa, Mastercard, American Express)
- **Subscription Management**: Automatic subscription creation and management
- **Webhook Handling**: Real-time payment status updates

## Architecture

### Components

1. **Payment API** (`lib/api/payment.ts`)

   - ArifPay integration
   - Stripe integration
   - Payment status management

2. **Subscription API** (`lib/api/subscription.ts`)

   - Subscription creation and management
   - Plan hierarchy and feature access

3. **Payment Hooks** (`hooks/use-payment.ts`)

   - React hooks for payment operations
   - Session management

4. **Subscription Hooks** (`hooks/use-subscription.ts`)

   - React hooks for subscription management
   - Feature access control

5. **UI Components**
   - Payment method selector
   - Upgrade page integration
   - Success page

## Payment Flow

### 1. Plan Selection

User selects a plan on the upgrade page:

- Free Plan (no payment required)
- Starter Plan ($6.99/month or $59.99/year)
- Builder Plan ($9.99/month or $89.99/year)
- Pro Bundle ($13.99/month or $119.99/year)

### 2. Payment Method Selection

User chooses between:

- **Local Payment (ArifPay)**: Recommended for Ethiopian users
- **International Payment (Stripe)**: For international users

### 3. Payment Processing

- **ArifPay**: Redirects to ArifPay payment page
- **Stripe**: Redirects to Stripe Checkout

### 4. Payment Success

- User is redirected to success page
- Subscription is automatically created
- User gains access to premium features

## API Endpoints

### Payment Endpoints

#### Create Payment Session (ArifPay)

```typescript
POST /payment
{
  userId: string;
  amount: number;
  cancelUrl: string;
  successUrl: string;
  errorUrl: string;
  notifyUrl: string;
  items: PaymentItem[];
  // ... other fields
}
```

#### Create Stripe Checkout

```typescript
POST / stripe / stripe - checkout;
{
  items: {
    price: string;
    quantity: number;
  }
  successUrl: string;
  cancelUrl: string;
  userId: string;
}
```

#### Get User Payments

```typescript
GET /payment/:userId
```

### Subscription Endpoints

#### Create Subscription

```typescript
POST / subscriptions;
{
  userId: string;
  planName: SubscriptionPlan;
  startDate: Date;
  endDate: Date;
  price: number;
  billingCycle: BillingCycle;
  // ... other fields
}
```

#### Get User Subscriptions

```typescript
GET /subscriptions/user/:userId
```

## Usage Examples

### Creating a Payment Session

```typescript
import { usePayment } from "@/hooks/use-payment";

function UpgradeComponent() {
  const { createArifPayPayment, createStripePayment } = usePayment();

  const handleUpgrade = async (planId: string, isAnnual: boolean) => {
    try {
      // For ArifPay
      await createArifPayPayment(planId, "Starter Plan", 6.99, isAnnual);

      // For Stripe
      await createStripePayment(
        planId,
        "Starter Plan",
        "price_starter_monthly",
        isAnnual
      );
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };
}
```

### Checking Subscription Status

```typescript
import { useSubscription } from "@/hooks/use-subscription";

function FeatureComponent() {
  const { hasActiveSubscription, canAccessFeature } = useSubscription();

  // Check if user has any active subscription
  const hasSubscription = hasActiveSubscription();

  // Check if user can access specific feature
  const canAccessProFeature = canAccessFeature("Pro-Bundle");

  return <div>{canAccessProFeature ? <ProFeature /> : <UpgradePrompt />}</div>;
}
```

## Environment Variables

### Required Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-backend.com

# ArifPay Configuration (Backend)
PAYMENT_BENEFICIARIES={"accountNumber":"1234567890","bankCode":"1234"}

# Stripe Configuration (Backend)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Database
DATABASE_URL=your-mongodb-connection-string
```

## Plan Hierarchy

The system supports a hierarchical plan structure:

```
Free (0) < Starter (1) < Builder (2) < Pro-Bundle (3) < Organization (4)
```

Users can access features from their current plan level and all levels below.

## Feature Access Control

```typescript
// Check if user can access a feature
const canAccessFeature = (requiredPlan: SubscriptionPlan): boolean => {
  const planHierarchy = {
    Free: 0,
    Starter: 1,
    Builder: 2,
    "Pro-Bundle": 3,
    Organization: 4,
  };

  const userPlanLevel = planHierarchy[userPlan] || 0;
  const requiredPlanLevel = planHierarchy[requiredPlan] || 0;

  return userPlanLevel >= requiredPlanLevel;
};
```

## Webhook Handling

### Payment Status Webhook

The system handles payment status updates via webhooks:

```typescript
// Webhook endpoint: /api/payment/webhook
POST / api / payment / webhook;
{
  uuid: string;
  transactionStatus: PaymentStatus;
  sessionId: string;
  // ... other fields
}
```

### Webhook Processing

1. **Payment Success**: Automatically creates subscription
2. **Payment Failure**: Logs error and notifies user
3. **Payment Cancellation**: Cleans up session data

## Error Handling

### Common Error Scenarios

1. **Payment Creation Failed**

   - Network issues
   - Invalid payment data
   - API rate limits

2. **Payment Processing Failed**

   - Insufficient funds
   - Card declined
   - Payment gateway errors

3. **Subscription Creation Failed**
   - Database connection issues
   - Invalid subscription data

### Error Recovery

```typescript
const { createArifPayPayment } = usePayment({
  onError: (error) => {
    toast({
      title: "Payment Error",
      description: error,
      variant: "destructive",
    });
  },
});
```

## Testing

### Test Payment Flow

1. **Development Environment**

   - Use test credentials for both ArifPay and Stripe
   - Test all payment methods
   - Verify webhook handling

2. **Test Data**
   ```typescript
   const testPayment = {
     userId: "test_user_123",
     amount: 100,
     items: [{ name: "Test Plan", quantity: 1, price: 100 }],
   };
   ```

### Test Scenarios

- ✅ Successful payment flow
- ✅ Payment cancellation
- ✅ Payment failure
- ✅ Subscription creation
- ✅ Feature access control
- ✅ Webhook processing

## Security Considerations

1. **Authentication**: All API calls require valid session
2. **Validation**: Payment data is validated on both frontend and backend
3. **HTTPS**: All payment communications use HTTPS
4. **Webhook Verification**: Verify webhook signatures (implement as needed)
5. **Rate Limiting**: Implement rate limiting for payment endpoints

## Monitoring and Logging

### Payment Events

- Payment session creation
- Payment success/failure
- Subscription creation
- Webhook processing

### Logging

```typescript
console.log("Payment session created:", sessionId);
console.log("Payment successful:", transactionId);
console.log("Subscription created:", subscriptionId);
```

## Troubleshooting

### Common Issues

1. **Payment Session Not Found**

   - Check localStorage for payment session
   - Verify session hasn't expired

2. **Webhook Not Received**

   - Check webhook URL configuration
   - Verify network connectivity
   - Check webhook endpoint logs

3. **Subscription Not Created**
   - Check payment status
   - Verify webhook processing
   - Check database connection

### Debug Tools

- Browser developer tools for frontend debugging
- Network tab for API call monitoring
- Console logs for payment flow tracking
- Database queries for subscription verification

## Future Enhancements

- [ ] Add payment retry logic
- [ ] Implement subscription upgrades/downgrades
- [ ] Add payment analytics dashboard
- [ ] Support for additional payment methods
- [ ] Implement subscription cancellation flow
- [ ] Add payment receipt generation
- [ ] Implement refund processing
- [ ] Add subscription renewal reminders

## Support

For payment-related issues:

1. Check the logs for error details
2. Verify environment variables are set correctly
3. Test with payment gateway test credentials
4. Contact support with error details and user context

---

This payment integration system provides a robust, scalable solution for handling subscriptions with support for both local and international payment methods.
