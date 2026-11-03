// Error que se lanza cuando el recurso pedido no existe. El manejador de errores lo convierte en 404.
import { NotFoundError } from '../../../shared/NotFoundError';

// Del dominio: la regla de validación y el tipo Book.
import { Book, parseNewBook } from '../domain/Book';

// El contrato (puerto). El servicio solo conoce el contrato, no dónde se guardan los datos.
import { BookRepository } from '../ports/BookRepository';

// Mensaje para el usuario (en español). Se define una vez para no repetirlo.
const BOOK_NOT_FOUND_MESSAGE = 'Libro no encontrado';

// Un "servicio" agrupa los casos de uso relacionados con libros.
export class BookService {
  // Recibe el repositorio desde afuera (inyección de dependencias).
  constructor(private readonly repository: BookRepository) {}

  // CASO DE USO 1: listar todos los libros.
  list = async (): Promise<Book[]> => this.repository.findAll();

  // CASO DE USO 2: obtener un libro por su id.
  getById = async (id: number): Promise<Book> => {
    const book = await this.repository.findById(id);

    // Si no existe, se lanza NotFoundError (→ 404).
    if (!book) {
      throw new NotFoundError(BOOK_NOT_FOUND_MESSAGE);
    }

    return book;
  };

  // CASO DE USO 3: crear un libro.
  create = async (input: unknown): Promise<Book> => {
    // El dominio valida. Si hay un error, lanza DomainError y aquí se detiene.
    const newBook = parseNewBook(input);

    return this.repository.save(newBook);
  };
}
