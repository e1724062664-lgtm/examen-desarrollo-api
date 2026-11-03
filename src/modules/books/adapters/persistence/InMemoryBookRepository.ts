import { Book, NewBook } from '../../domain/Book';
import { BookRepository } from '../../ports/BookRepository';

// Adaptador de salida: cumple el contrato BookRepository guardando los libros en un arreglo.
export class InMemoryBookRepository implements BookRepository {
  // La lista donde se guardan los libros. "private" = solo esta clase puede tocarla.
  private books: Book[];

  // El número que usará el próximo libro. Solo sube, así que un id nunca se reutiliza.
  private nextId: number;

  constructor(initialBooks: Book[] = []) {
    // Se copian la lista Y cada libro, para no depender de los objetos originales.
    this.books = initialBooks.map((book) => ({ ...book }));

    // El siguiente id es el mayor id existente + 1 (con lista vacía, empieza en 1).
    this.nextId = Math.max(0, ...initialBooks.map((book) => book.id)) + 1;
  }

  // Devuelve COPIAS de los libros, para que nadie de afuera pueda modificar los originales.
  findAll = async (): Promise<Book[]> => this.books.map((book) => ({ ...book }));

  // Busca un libro por id y devuelve una copia (o undefined si no existe).
  findById = async (id: number): Promise<Book | undefined> => {
    const book = this.books.find((item) => item.id === id);

    return book ? { ...book } : undefined;
  };

  // Guarda un libro nuevo asignándole el siguiente id.
  save = async (newBook: NewBook): Promise<Book> => {
    const book: Book = { id: this.nextId++, ...newBook };
    this.books.push(book);

    // Se devuelve una copia: lo guardado queda protegido.
    return { ...book };
  };
}
