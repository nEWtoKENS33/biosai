const { TwitterApi } = require('twitter-api-v2');

// Configurar las credenciales de la API de Twitter
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_KEY_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { tweetContent } = req.body;

    try {
      // Publicar el tweet en Twitter
      const tweet = await client.v2.tweet(tweetContent);
      res.status(200).json({ success: true, tweetId: tweet.data.id });
    } catch (error) {
      console.error('Error al publicar el tweet:', error);
      res.status(500).json({ success: false, error: 'Error al publicar el tweet.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
