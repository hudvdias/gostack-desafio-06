import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const incomeTransactions = await this.find({ where: { type: 'income' } });
    const income = incomeTransactions.reduce((preValue, transaction) => preValue + transaction.value, 0);
    const outcomeTransactions = await this.find({ where: { type: 'outcome' } });
    const outcome = outcomeTransactions.reduce((preValue, transaction) => preValue + transaction.value, 0);
    const total = (income - outcome);
    const balance = { income, outcome, total };
    return balance;
  }
}

export default TransactionsRepository;
