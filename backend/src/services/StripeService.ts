import Stripe from 'stripe';
import stripeConfig from '../config/stripe';

class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(stripeConfig.secretKey, {
      apiVersion: stripeConfig.apiVersion,
    });
  }

  async createCustomerAccount(data: ICreateCustomer) {
    const { email, name } = data;

    const account = await this.stripe.customers.create({
      email,
      name,
    });

    return account;
  }

  async listCardsOfCustomer(customerId: string) {
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods;
  }

  async createAccount() {
    const account = await this.stripe.accounts.create({
      type: 'standard',
    });

    const accountLinks = await this.createAccountLink(account.id);

    return { ...accountLinks, account };
  }

  async createSaveCardIntent(customerId: string) {
    const intent = await this.stripe.setupIntents.create({
      customer: customerId,
    });

    return intent.client_secret;
  }

  async createAccountLink(accountId: string) {
    const accountLinks = await this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: 'https://manogel.com.br/reauth',
      return_url: 'https://manogel.com.br/reauth',
      type: 'account_onboarding',
    });

    return accountLinks;
  }

  async attachPaymentMethodToCustomer(data: IAttachPaymentMethodToCustomer) {
    const { paymentMethodId, customerId, stripeAccount } = data;

    const paymentMethod = await this.stripe.paymentMethods.attach(
      paymentMethodId,
      { customer: customerId },
      { stripeAccount }
    );

    await this.defineDefaultPaymentMethodOfCustomer({
      paymentMethodId,
      customerId,
      stripeAccount,
    });

    return paymentMethod;
  }

  async getDetailsOfCustomer(cutomerId: string) {
    return this.stripe.customers.retrieve(cutomerId);
  }

  async defineDefaultPaymentMethodOfCustomer(
    data: IDefineDefaultPaymentMethodOfCustomer
  ) {
    const { customerId, paymentMethodId, stripeAccount } = data;

    const customer = await this.stripe.customers.update(
      customerId,
      {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      },
      {
        stripeAccount,
      }
    );

    return customer;
  }

  async checkout(data: IAccount) {
    const { stripeAccount, value, order } = data;

    const paymentIntent = await this.stripe.paymentIntents.create(
      {
        payment_method_types: ['card'],
        amount: value,
        currency: 'brl',
        application_fee_amount: 150,
        metadata: {
          order_id: order,
        },
      },
      {
        stripeAccount,
      }
    );

    return paymentIntent;
  }

  async sharedCustomerToStripeAccount(
    customer: Stripe.Customer,
    stripeAccount: string
  ) {
    const acc_customer = await this.stripe.customers.create(
      {
        name: customer.name,
        email: customer.email,
      },
      {
        stripeAccount,
      }
    );

    return acc_customer;
  }

  async clonePaymentMethod(data: IClonePaymentType) {
    const { paymentMethodId, customerId, stripeAccount } = data;

    const paymentMethodCloned = await this.stripe.paymentMethods.create(
      {
        customer: customerId,
        payment_method: paymentMethodId,
      },
      {
        stripeAccount,
      }
    );

    return paymentMethodCloned;
  }

  async payment(data: ICreatePayment) {
    const { customer, paymentMethodId, order } = data;
    const { value, stripeAccount } = data;

    const customerResponse = await this.getDetailsOfCustomer(customer);
    const paymentMethodCloned = await this.clonePaymentMethod({
      paymentMethodId,
      stripeAccount,
      customerId: customer,
    });

    if (customerResponse.deleted) {
      throw new Error('Conta do cliente foi deletada');
    }

    const customerDetails = customerResponse as Stripe.Customer;

    const customerShared = await this.sharedCustomerToStripeAccount(
      customerDetails,
      stripeAccount
    );

    await this.attachPaymentMethodToCustomer({
      customerId: customerShared.id,
      paymentMethodId: paymentMethodCloned.id,
      stripeAccount,
    });

    const paymentIntent = await this.stripe.paymentIntents.create(
      {
        amount: value,
        currency: 'brl',
        customer: customerShared.id,
        payment_method_types: ['card'],
        payment_method: paymentMethodCloned.id,
        off_session: true,
        confirm: true,
        metadata: {
          order,
        },
        application_fee_amount: 150,
      },
      {
        stripeAccount,
      }
    );

    return paymentIntent;
  }

  async refoundsPayment(data: IRefoundsPayment) {
    const { paymentIntentId, amount, stripeAccount } = data;

    const refund = await this.stripe.refunds.create(
      {
        payment_intent: paymentIntentId,
        amount,
      },
      {
        stripeAccount,
      }
    );

    return refund;
  }
}

export default new StripeService();
