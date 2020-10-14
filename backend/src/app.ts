import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import Stripe from 'stripe';
import routes from './routes';

type StrapiError = Stripe.StripeRawError;

const app = express();

app.use(express.json());

app.use(routes);

app.use(
  (
    err: Error | StrapiError,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    const strapiError = err as StrapiError;

    if (strapiError.type) {
      return res.status(strapiError.statusCode || 400).json({
        status: 'error',
        message: strapiError.message,
        type: strapiError.type,
      });
    }

    return res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
);

export default app;
