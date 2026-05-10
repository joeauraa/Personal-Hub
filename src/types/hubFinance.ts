export type Wallet = {
  id: string;
  name: string;
};

export type FinanceTransaction = {
  id: string;
  walletId: string;
  kind: "income" | "expense";
  amount: number;
  description: string;
  /** ISO datetime */
  at: string;
};
