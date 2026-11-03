import { Pool } from 'pg';

import { Book, NewBook } from '../../domain/Book';
import { BookRepository } from '../../ports/BookRepository';

// Cómo llega una fila desde la base de datos.
// OJO: copies es BIGINT, y pg entrega los BIGINT como texto ("3"), no como número.
type BookRow = {
  id: number;
  title: string;
  author: string;
  isbn: string;
  copies: string;
};

// Columnas solicitadas en cada consulta.
const COLUMNS = 'id, title, author, isbn, copies';

// Mayor valor que cabe en una columna INTEGER. Un id más grande no puede existir en la tabla.
const MAX_ID = 2147483647;

// Convierte una fila de la base de datos en un objeto Book (dominio).
const toBook = (row: BookRow): Book => ({
  id: row.id,
  title: row.title,
  author: row.author,
  isbn: row.isbn,
  copies: Number(row.copies),
});

// Adaptador de salida: cumple el contrato BookRepository guardando los libros en PostgreSQL.
export class PostgresBookRepository implements BookRepository {
  // Recibe el pool de conexiones desde afuera (inyección de dependencias).
  constructor(private readonly pool: Pool) {}

  // Devuelve todos los libros, ordenados por id.
  findAll = async (): Promise<Book[]> => {
    const result = await this.pool.query<BookRow>(`SELECT ${COLUMNS} FROM books ORDER BY id`);

    return result.rows.map(toBook);
  };

  // Busca un libro por id. $1 es un parámetro: el valor viaja aparte, nunca dentro del texto SQL.
  findById = async (id: number): Promise<Book | undefined> => {
    // Un id fuera del rango de INTEGER no puede existir: se responde "no existe" sin hacer fallar a PostgreSQL.
    if (id > MAX_ID) {
      return undefined;
    }

    const result = await this.pool.query<BookRow>(`SELECT ${COLUMNS} FROM books WHERE id = $1`, [id]);

    return result.rows[0] ? toBook(result.rows[0]) : undefined;
  };

  // Guarda un libro nuevo. La base asigna el id y RETURNING lo devuelve junto con el resto.
  save = async (newBook: NewBook): Promise<Book> => {
    const result = await this.pool.query<BookRow>(
      `INSERT INTO books (title, author, isbn, copies)
       VALUES ($1, $2, $3, $4)
       RETURNING ${COLUMNS}`,
      [newBook.title, newBook.author, newBook.isbn, newBook.copies],
    );

    return toBook(result.rows[0]);
  };
}
