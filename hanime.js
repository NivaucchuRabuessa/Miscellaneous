export default new class {
    // The base URL for the Hanime Stremio Addon
    url = "https://hanime-stremio.fly.dev";

    /**
     * Helper to safely map streams to Hayase format.
     * Ensures we always return an array.
     */
    map(streams) {
        if (!streams || !Array.isArray(streams)) return [];
        
        return streams.map(s => ({
            title: s.title || s.name || "Unknown Video",
            link: s.url,
            size: 0, 
            accuracy: "high"
        }));
    }

    async single({ id }) {
        try {
            if (!id) return [];

            // Stremio IDs for this addon usually look like "hanime:slug-name"
            const sid = id.includes("hanime:") ? id : `hanime:${id}`;
            
            const res = await fetch(`${this.url}/stream/anime/${sid}.json`);
            
            if (!res.ok) return []; // Return empty array if addon is down or ID not found

            const data = await res.json();
            
            // data.streams must be an array for Hayase to iterate over it
            return this.map(data.streams);
        } catch (err) {
            console.error("Hanime Error:", err);
            return []; // Return empty array on error to prevent "o is not iterable"
        }
    }

    async movie(args) {
        return await this.single(args);
    }

    // Hayase sometimes checks for batch, we return empty array
    async batch() {
        return [];
    }

    async test() {
        try {
            const res = await fetch(`${this.url}/manifest.json`);
            return res.ok;
        } catch {
            return false;
        }
    }
};