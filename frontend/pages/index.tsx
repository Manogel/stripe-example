import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CardSetupForm from '../components/CardSetupForm';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripepk =
  'pk_test_51HaThVKGab1a7o0aq4vYEGLQt0by95pwywtfTNsMjuiuLueOY0iZ7Ly0Q1WYN6RDaRuNc2hPPZ5qCXMCMIEX4fQd00hItWCp0N';

const stripePromise = loadStripe(stripepk);

export default function SaveCard() {
  return (
    <div className="container-app">
      <Elements stripe={stripePromise}>
        <CardSetupForm />
      </Elements>
    </div>
  );
}
