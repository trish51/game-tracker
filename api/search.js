export default async function handler(req, res) {
    const apiKey = process.env.RAWG_API_KEY; // The secret key stored in Vercel
    const { query } = req.query; // Gets the word you typed in the search bar

    const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${query}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.status(200).json(data); // Sends the game list back to your browser
    } catch (error) {
        res.status(500).json({ error: "API Failed" });
    }
}