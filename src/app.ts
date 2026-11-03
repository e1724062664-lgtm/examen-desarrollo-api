import express from 'express';

import { InMemoryBookRepository } from './modules/books/adapters/persistence/InMemoryBookRepository';
import { PostgresBookRepository } from './modules/books/adapters/persistence/PostgresBookRepository';
import { BookService } from './modules/books/application/BookService';
import { createBookRouter } from './modules/books/adapters/http/bookRoutes';
import { BookRepository } from './modules/books/ports/BookRepository';
import { createPostgresPool } from './shared/database/postgresPool';
import { errorHandler, notFoundHandler } from './shared/httpErrorHandlers';

const app = express();

app.use(express.json());

//1) Datos de ejemplo para el repositorio en memoria (en español)
const sampleBooks = [
    {id: 1, title: 'Cien años de soledad', author: 'Gabriel García Márquez', isbn: '978-0-306-40615-7', copies: 3},
    {id: 2, title: 'Rayuela', author: 'Julio Cortázar', isbn: '0-394-75284-4', copies: 2},
];

//2) Elige dónde se guardan los libros según la variable BOOKS_ADAPTER:
//   "sql" → PostgreSQL | cualquier otro valor, o sin variable → memoria (opción por defecto).
const createBookRepository = (): BookRepository => {
    const adapter = process.env.BOOKS_ADAPTER;
    const databaseUrl = process.env.DATABASE_URL;

    if (adapter === 'sql' && databaseUrl) {
        console.log('Books persistence: PostgreSQL');
        return new PostgresBookRepository(createPostgresPool(databaseUrl));
    }

    // Avisos para que un error de configuración no pase desapercibido.
    if (adapter === 'sql') {
        console.warn('Aviso: BOOKS_ADAPTER=sql requiere DATABASE_URL; se usa la memoria.');
    } else if (adapter && adapter !== 'memory') {
        console.warn(`Aviso: BOOKS_ADAPTER="${adapter}" no es válido (use "sql" o "memory"); se usa la memoria.`);
    }

    console.log('Books persistence: in memory');
    return new InMemoryBookRepository(sampleBooks);
};

//3) Servicio (casos de uso): recibe el repositorio elegido
const bookService = new BookService(createBookRepository());

//4) Rutas: se le entrega el servicio y se monta bajo el prefijo /books
app.use('/books', createBookRouter(bookService));

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
