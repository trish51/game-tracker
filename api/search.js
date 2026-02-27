export default async function handler(req, res) {
    const apiKey = process.env.RAWG_API_KEY; 
    const { query } = req.query; 

    if(!query || query.trim() == "") {
        return res.status(400).json({ error: "Search query is required"});
    }

    const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);

        if(response.ok){
            return res.status(response.status).json({ error: "Error from RAWG API" });
        }

        const data = await response.json();
        res.status(200).json(data); 
    } catch (error) {
        res.status(500).json({ error: "API Failed" });
    }
}