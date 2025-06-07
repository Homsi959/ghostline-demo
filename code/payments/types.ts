/**
 * Data for creating a payment link for Robokassa.
 */
export interface PaymentRoboPayload {
  /** Payment amount, e.g., 199.00 */
  amount: number;

  /** Payment purpose, e.g., "servicevpnVPN subscription for 1 month" */
  description: string;

  /** User UUID */
  userId: string;
}

/**
 * Data for a single item to generate a Robokassa receipt.
 */
export interface ReceiptRoboItem {
  /** Name of the product or service */
  name: string;

  /** Amount for the product or service */
  sum: string;
}

/**
 * Parameters for generating the SignatureValue.
 */
export interface SignaturePayload {
  /** Merchant identifier in Robokassa (used for signing when sending the link) */
  merchantLogin?: string;

  /** Payment amount in the format 0.00 */
  outSum: string;

  /** Unique invoice number (usually matches transaction_id / InvId) */
  invId: string;

  /** String with the fiscal receipt (if fiscalization is used) */
  receipt?: string;

  /** Password for signing (Password #1 or #2 from Robokassa settings) */
  password: string;
}

export enum TypeSignature {
  SIGPAY = 'sigPay',
  SIGCHECK = 'sigCheck',
}

export interface RobokassaResult {
  invId: string;
  signatureValue: string;
}

export type CreatedPaymentTransaction = {
  link: string;
  invId: string;
};
