import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path'

import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import CreateTransactionService from '../services/CreateTransactionService';

interface Line {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const csvPath = path.resolve(uploadConfig.directory, filename);
    const readCSVStream = fs.createReadStream(csvPath);
    const parseStream = csvParse({ from_line: 2, ltrim: true, rtrim: true });
    const parseCsv = readCSVStream.pipe(parseStream);
    const lines: Line[] = [];
    parseCsv.on('data', async line => {
      const [ title, type, value, category ] = line;
      lines.push({ title, type, value, category });
    });
    await new Promise(resolve => parseCsv.on('end', resolve));
    const createTransaction = new CreateTransactionService();
    const transactions = [];
    for (const line of lines) {
      const transaction = await createTransaction.execute(line);
      transactions.push(transaction);
    }
    await fs.promises.unlink(csvPath);
    return transactions;
  }
}

export default ImportTransactionsService;
