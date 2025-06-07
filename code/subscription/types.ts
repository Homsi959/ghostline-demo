import { SubscriptionPlan } from 'code/database/common/enums';

export type PaidPlanInfo = {
  description: string;
  amount: number;
};

export const PAID_PLANS: Record<
  Exclude<SubscriptionPlan, SubscriptionPlan.TRIAL>,
  PaidPlanInfo
> = {
  [SubscriptionPlan.ONE_MONTH]: {
    description: 'Subscription for 1 month',
    amount: 190,
  },
  [SubscriptionPlan.SIX_MONTHS]: {
    description: 'Subscription for 6 months',
    amount: 990,
  },
};
