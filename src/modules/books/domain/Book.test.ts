import { DomainError } from '../../../shared/DomainError';
import { parseNewBook } from './Book';

// Datos válidos de ejemplo (datos de prueba en español).
const validInput = {
  title: 'Cien años de soledad',
  author: 'Gabriel García Márquez',
  isbn: '978-0-306-40615-7',
  copies: 3,
};

describe('parseNewBook', () => {
  it('returns the book data trimmed', () => {
    const result = parseNewBook({ ...validInput, title: ' Cien años de soledad ', author: ' Gabriel García Márquez ' });

    expect(result).toEqual(validInput);
  });

  it('throws when the title is missing', () => {
    expect(() => parseNewBook({ ...validInput, title: '   ' })).toThrow(DomainError);
    expect(() => parseNewBook({ ...validInput, title: undefined })).toThrow('El título es obligatorio');
  });

  it('throws when the author is missing', () => {
    expect(() => parseNewBook({ ...validInput, author: '' })).toThrow(DomainError);
    expect(() => parseNewBook({ ...validInput, author: undefined })).toThrow('El autor es obligatorio');
  });

  it('accepts an ISBN of 10 or 13 digits, with or without hyphens', () => {
    expect(parseNewBook({ ...validInput, isbn: '0306406152' }).isbn).toBe('0306406152');
    expect(parseNewBook({ ...validInput, isbn: '0-306-40615-2' }).isbn).toBe('0-306-40615-2');
    expect(parseNewBook({ ...validInput, isbn: '9780306406157' }).isbn).toBe('9780306406157');
  });

  it('throws when the ISBN is not valid', () => {
    const message = 'El ISBN no es válido';

    expect(() => parseNewBook({ ...validInput, isbn: '12345' })).toThrow(DomainError);
    expect(() => parseNewBook({ ...validInput, isbn: '03064061X2' })).toThrow(message);
    expect(() => parseNewBook({ ...validInput, isbn: '978030640615' })).toThrow(message);
    expect(() => parseNewBook({ ...validInput, isbn: 9780306406157 })).toThrow(message);
    expect(() => parseNewBook({ ...validInput, isbn: undefined })).toThrow(message);
  });

  it('accepts zero copies', () => {
    expect(parseNewBook({ ...validInput, copies: 0 }).copies).toBe(0);
  });

  it('throws when copies is not an integer greater than or equal to 0', () => {
    const message = 'Los ejemplares deben ser un número igual o mayor que 0';

    expect(() => parseNewBook({ ...validInput, copies: -1 })).toThrow(DomainError);
    expect(() => parseNewBook({ ...validInput, copies: 2.5 })).toThrow(message);
    expect(() => parseNewBook({ ...validInput, copies: '3' })).toThrow(message);
    expect(() => parseNewBook({ ...validInput, copies: undefined })).toThrow(message);
  });
});
