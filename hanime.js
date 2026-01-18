export default new class {
    url = "https://hanime-stremio.fly.dev";

    async single(args, options) {
        try {
            // Hayase uses anidbEid for episodes. Stremio uses 'id'.
            // We check for both to be safe.
            const id = args?.anidbEid || args?.id;
            if (!id) return [];

            // Ensure ID is a string before calling .includes
            const sid = String(id).includes("hanime:") ? id : `hanime:${id}`;
            
            const res = await fetch(`${this.url}/stream/anime/${sid}.json`);
            if (!res.ok) return [];

            const data = await res.json();
            
            // If streams is missing or not an array, return empty array
            if (!data || !Array.isArray(data.streams)) return [];

            return data.streams.map(s => ({
                title: s.title || s.name || "Direct Link",
                link: s.url,
                size: 0,
                accuracy: "high"
            }));
        } catch (e) {
            console.error(e);
            return []; // Crucial: Always return an array to prevent "not iterable"
        }
    }

    // Hayase calls 'movie' for films
    async movie(args, options) {
        // Reuse the logic from single
        const id = args?.anidbAid || args?.id;
        return await this.single({ id }, options);
    }

    // Hayase calls 'batch' for series
    async batch(args, options) {
        const id = args?.anidbAid || args?.id;
        return await this.single({ id }, options);
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