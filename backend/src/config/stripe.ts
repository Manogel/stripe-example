export default {
  publicKey: process.env.STRIPE_PUBLIC_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  apiVersion: process.env.STRIPE_API_VERSION as '2020-08-27',
} as const;
