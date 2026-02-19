export default async function handler(req, res) {
    // This pulls the key you saved in Vercel's "Environment Variables"
    const apiKey = process.env.RAWG_API_KEY; 
    const { query } = req.query;

    const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${query}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        // Send the data back to your app
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch from RAWG" });
    }
}