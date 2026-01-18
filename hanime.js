export default new class {
    url = "https://hanime-stremio.fly.dev";

    // This matches the property structure in your AnimeTosho example
    map(streams) {
        if (!Array.isArray(streams)) return [];
        return streams.map(s => ({
            title: s.title || s.name || "Direct Stream",
            link: s.url,
            seeders: 0,
            leechers: 0,
            downloads: 0,
            hash: s.url.split('/').pop() || "0000", // Hayase often needs a 'hash' string
            size: 0,
            accuracy: "high",
            date: new Date()
        }));
    }

    async single(args) {
        try {
            // Check for anidbEid (standard Hayase) or generic id
            const id = args?.anidbEid || args?.id;
            if (!id) return [];

            const sid = String(id).includes("hanime:") ? id : `hanime:${id}`;
            const response = await fetch(`${this.url}/stream/anime/${sid}.json`);
            
            if (!response.ok) return [];
            
            const data = await response.json();
            // Crucial: return the result of map, which is an array
            return data.streams ? this.map(data.streams) : [];
        } catch (e) {
            // Returning an empty array prevents "o is not iterable"
            return [];
        }
    }

    async movie(args) {
        // Movies use anidbAid in Hayase
        const id = args?.anidbAid || args?.id;
        return await this.single({ id });
    }

    async batch(args) {
        return []; // Always return an array
    }

    async test() {
        try {
            const res = await fetch(`${this.url}/manifest.json`);
            return res.ok;
        } catch (e) {
            return false;
        }
    }
};