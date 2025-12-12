import Dexie, { Table } from "dexie";
import type { Book, ReadingLog } from "./types";

export class QuietReadsDB extends Dexie {
  books!: Table<Book, string>;
  logs!: Table<ReadingLog, string>;

  constructor() {
    super("quietReadsDB");

    this.version(1).stores({
      books: "id, status, title, updatedAt",
      logs: "id, date, bookId, [date+bookId]"
    });
  }
}

export const db = new QuietReadsDB();
