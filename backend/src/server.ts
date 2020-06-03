import express from 'express';
import routes from './routes';
import path from 'path';

const app = express();

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')))
app.use(express.json());
app.use(routes);

app.listen(3333, () => {
  console.log('Server Running at Port 3333')
});