const { TwitterApi } = require('twitter-api-v2');
const OpenAI = require('openai');

// Configurar las credenciales de la API de Twitter
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_KEY_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Función para publicar un nuevo tweet basado en un tema generado por OpenAI
const tweetFromAI = async () => {
  try {
    // Pedirle a OpenAI que genere una idea para un tweet
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Generate an interesting tweet topic for today.' },
      ],
    });

    const tweetContent = response.choices[0].message.content;

    // Publicar el tweet generado
    const tweet = await client.v2.tweet(tweetContent);
    console.log(`Tweet done: ${tweetContent}`);

  } catch (error) {
    console.error('Oops tweet error:', error);
  }
};

// Función para responder menciones y también comentar sobre ellas
const respondAndCommentMentions = async () => {
  try {
    // Obtener las menciones más recientes (últimos 5 tweets)
    const mentions = await client.v2.mentionsTimeline({
      max_results: 5,
    });

    for (const mention of mentions.data) {
      const tweetText = mention.text;
      const tweetId = mention.id;
      const username = mention.author_id;

      console.log(`Nueva mención de @${username}: ${tweetText}`);

      // Enviar el texto del tweet a OpenAI para generar una respuesta
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: `Reply to this tweet: "${tweetText}"` }],
      });

      const aiReply = response.choices[0].message.content;

      // Responder al tweet original
      await client.v2.reply(aiReply, tweetId);
      console.log(`Tweet about  @${username} to: ${aiReply}`);

      // Generar un comentario basado en la interacción
      const commentResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: `Comment on the conversation with: "${tweetText}"` }],
      });

      const aiComment = commentResponse.choices[0].message.content;

      // Publicar un tweet comentando sobre la interacción
      await client.v2.tweet(`Commenting on the conversation: ${aiComment}`);
      console.log(`Comment done: ${aiComment}`);
    }
  } catch (error) {
    console.error('Error to respond mentions:', error);
  }
};

// Ejecutar las funciones periódicamente
setInterval(tweetFromAI, 60000); // Publicar un nuevo tweet cada hora
setInterval(respondAndCommentMentions, 60000); // Responder y comentar menciones cada minuto

