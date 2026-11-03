import { Router } from 'express';

import { DomainError } from '../../../../shared/DomainError';
import { HTTP_STATUS } from '../../../../shared/httpStatus';

import { BookService } from '../../application/BookService';

// Convierte el id que llega como texto ("5") en número (5) y comprueba que sea válido.
const parseId = (value: string): number => {
  const id = Number(value);

  // Debe ser un entero positivo (no "abc", ni 1.5, ni -3).
  if (!Number.isInteger(id) || id <= 0) {
    throw new DomainError('El identificador no es válido');
  }

  return id;
};

// Recibe el servicio desde afuera (inyección de dependencias) y devuelve las rutas ya armadas.
export const createBookRouter = (service: BookService): Router => {
  const router = Router();

  // GET /books → listar todos los libros.
  router.get('/', async (req, res) => {
    const books = await service.list();

    res.status(HTTP_STATUS.OK).json(books);
  });

  // GET /books/:id → ver un libro.
  router.get('/:id', async (req, res) => {
    const book = await service.getById(parseId(req.params.id));

    res.status(HTTP_STATUS.OK).json(book);
  });

  // POST /books → crear un libro.
  router.post('/', async (req, res) => {
    // Si los datos son inválidos, el dominio lanza DomainError (→ 400).
    const book = await service.create(req.body);

    res.status(HTTP_STATUS.CREATED).json(book);
  });

  return router;
};
