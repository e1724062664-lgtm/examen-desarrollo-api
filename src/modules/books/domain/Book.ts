import { DomainError } from '../../../shared/DomainError';

// Interface: define la estructura de los objetos libro.
export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  copies: number;
}

// Un libro nuevo: los datos que se esperan recibir desde el cliente (todavía sin id).
export type NewBook = Omit<Book, 'id'>;

// El ISBN tiene 10 o 13 dígitos (se aceptan guiones, que se ignoran al contar).
const ISBN_PATTERN = /^(\d{10}|\d{13})$/;

// Valida los datos recibidos y devuelve un NewBook limpio.
export const parseNewBook = (input: unknown): NewBook => {
  const { title, author, isbn, copies } = (input ?? {}) as Record<string, unknown>;

  // Regla 1: el título es obligatorio.
  if (typeof title !== 'string' || !title.trim()) {
    throw new DomainError('El título es obligatorio');
  }

  // Regla 2: el autor es obligatorio.
  if (typeof author !== 'string' || !author.trim()) {
    throw new DomainError('El autor es obligatorio');
  }

  // Regla 3: el ISBN debe tener 10 o 13 dígitos, aceptando guiones.
  if (typeof isbn !== 'string' || !ISBN_PATTERN.test(isbn.trim().replace(/-/g, ''))) {
    throw new DomainError('El ISBN no es válido');
  }

  // Regla 4: los ejemplares son un número entero mayor o igual que 0.
  if (typeof copies !== 'number' || !Number.isSafeInteger(copies) || copies < 0) {
    throw new DomainError('Los ejemplares deben ser un número igual o mayor que 0');
  }

  // Devuelve los datos limpios (sin espacios sobrantes).
  return { title: title.trim(), author: author.trim(), isbn: isbn.trim(), copies };
};
