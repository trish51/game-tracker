export default async function handler(req, res) {
    const apiKey = process.env.RAWG_API_KEY; // Replace this with your api key
    const { query } = req.query; 

    const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${query}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.status(200).json(data); 
    } catch (error) {
        res.status(500).json({ error: "API Failed" });
    }
}