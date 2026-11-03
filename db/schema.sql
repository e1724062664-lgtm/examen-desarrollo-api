-- Crea la tabla de libros.
-- Los textos usan TEXT (sin límite) para aceptar cualquier valor que el dominio considere válido.
CREATE TABLE IF NOT EXISTS books (

  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  title TEXT NOT NULL,

  author TEXT NOT NULL,

  -- Se guarda tal como llegó (puede traer guiones), por eso es texto.
  isbn TEXT NOT NULL,

  -- BIGINT acepta cualquier entero que el dominio permita. pg lo devuelve como TEXTO,
  -- por eso el adaptador lo convierte con Number().
  copies BIGINT NOT NULL CHECK (copies >= 0)
);
