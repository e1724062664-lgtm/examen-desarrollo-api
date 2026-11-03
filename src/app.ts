import express from 'express';

import { errorHandler, notFoundHandler } from './shared/httpErrorHandlers';

const app = express();

app.use(express.json());

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
