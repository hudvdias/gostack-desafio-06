import { getRepository, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface RequestDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({ title, type, value, category }: RequestDTO): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    if (type == 'outcome') {
      const balance = await transactionRepository.getBalance();
      if (value > balance.total) { 
        throw new AppError('balance is not enough for transaction', 400);
      }
    }
    const categoryRepository = getRepository(Category);
    const categoryExists = await categoryRepository.findOne({ where: { title: category } });
    let categoryId = '';
    if (categoryExists) {
      categoryId = categoryExists.id;
    } else {
      const newCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(newCategory);
      categoryId = newCategory.id;
    }
    const transaction = transactionRepository.create({ title, type, value, category_id: categoryId });
    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
