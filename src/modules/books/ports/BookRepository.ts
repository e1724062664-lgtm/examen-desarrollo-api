import { Book, NewBook } from '../domain/Book';

// Contrato que debe cumplir CUALQUIER lugar donde se guarden libros.
export interface BookRepository {
  // Devuelve todos los libros.
  findAll: () => Promise<Book[]>;

  // Busca un libro por su id. Devuelve el libro, o undefined si no existe.
  findById: (id: number) => Promise<Book | undefined>;

  // Guarda un libro nuevo (sin id) y devuelve el libro ya con su id.
  save: (newBook: NewBook) => Promise<Book>;
}
