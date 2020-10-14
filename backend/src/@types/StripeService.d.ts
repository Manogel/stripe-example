interface IAccount {
  stripeAccount: string;
  value: number;
  order: string;
}

type ICreateCustomer = {
  email: string;
  name: string;
};

type ICreatePayment = {
  stripeAccount: string;
  value: number;
  order: string;
  customer: string;
  paymentMethodId: string;
};

type IRefoundsPayment = {
  paymentIntentId: string;
  stripeAccount: string;
  amount?: number;
};

type ICreateNewCard = {
  paymentMethodId: string;
};

type IAttachPaymentMethodToCustomer = {
  paymentMethodId: string;
  stripeAccount?: string;
  customerId: string;
};

type IDefineDefaultPaymentMethodOfCustomer = {
  paymentMethodId: string;
  stripeAccount?: string;
  customerId: string;
};

type IClonePaymentType = {
  paymentMethodId: string;
  stripeAccount?: string;
  customerId: string;
};
