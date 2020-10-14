import { Router } from 'express';
import StripeService from './services/StripeService';

const routes = Router();

routes.get('/', (_req, res) => {
  return res.json({ ok: true });
});

routes.post('/create-account', async (_req, res) => {
  const account = await StripeService.createAccount();

  return res.json(account);
});

routes.post('/create-links', async (req, res) => {
  const { account_id } = req.body;
  const account = await StripeService.createAccountLink(account_id);

  return res.json(account);
});

routes.post('/checkout', async (req, res) => {
  const { value, account_id, order } = req.body;

  const paymentIntent = await StripeService.checkout({
    stripeAccount: account_id,
    value,
    order,
  });

  return res.json(paymentIntent);
});

routes.post('/create-customer', async (req, res) => {
  const { name, email } = req.body;

  const customerAccount = await StripeService.createCustomerAccount({
    name,
    email,
  });

  return res.json(customerAccount);
});

routes.post('/create-save-card-intent', async (req, res) => {
  const { customer_id } = req.body;

  const client_secret = await StripeService.createSaveCardIntent(customer_id);

  return res.json({ client_secret });
});

routes.get('/list-cards/:customer_id', async (req, res) => {
  const { customer_id } = req.params;

  const cards = await StripeService.listCardsOfCustomer(customer_id);

  return res.json(cards);
});

routes.post('/payment', async (req, res) => {
  const { value, account_id, order } = req.body;
  const { customer_id, card_id } = req.body;

  const payment = await StripeService.payment({
    stripeAccount: account_id,
    value,
    order,
    customer: customer_id,
    paymentMethodId: card_id,
  });

  return res.json(payment);
});

routes.post('/refounds-payment', async (req, res) => {
  const { payment_intent_id, amount, stripe_account } = req.body;

  const data = await StripeService.refoundsPayment({
    paymentIntentId: payment_intent_id,
    amount,
    stripeAccount: stripe_account,
  });
  return res.json(data);
});

export default routes;
