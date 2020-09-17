import { getCustomRepository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Error from '../errors/AppError';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    let categoryTransaction = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryTransaction) {
      categoryTransaction = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryTransaction);
    }

    if (type === 'outcome') {
      const total = transactionRepository.getBalance();
      if (value > (await total).total) {
        throw new Error('Output greater than income', 400);
      }
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category: categoryTransaction,
    });

    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
