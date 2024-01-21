import express from "express";
import 'dotenv/config';
import { chat } from './services/ChatService.js';

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const reply = await chat(message);
  res.send(reply);
});

app.listen(port, () => {
  console.log('Server started');
});

