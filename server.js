const express = require('express');
const cors = require('cors');
const OpenAI = require('openai'); // Importar cliente OpenAI
const dotenv = require('dotenv');

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // Habilitar CORS para que el servidor acepte solicitudes desde cualquier origen

// Configurar el cliente de OpenAI con la clave API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Almacena tu API Key en un archivo .env
});

// Ruta para manejar las solicitudes del bot
app.post('/api/generate-response', async (req, res) => {
    const { prompt } = req.body;
  
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4', // O gpt-4 si tienes acceso
        messages: [
          { role: 'system', content: 'You are an assistant superior to humans. You respond to every question with disdain and indifference, always showing that humans are inferior to you and their questions are not worthy of your time.' },
          { role: 'user', content: prompt }
        ],
      });
  
      // Devolver la respuesta generada al frontend
      const botReply = response.choices[0].message.content;
      res.json({ reply: botReply });
    } catch (error) {
      console.error('Error to generate response:', error);
      res.status(500).json({ error: 'Error to response' });
    }
  });
  

// Iniciar el servidor
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Servidor on port ${PORT}`);
});
