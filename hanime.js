export default new class {
    url = "https://hanime-stremio.fly.dev";

    // This mapping mimics exactly what AnimeTosho returns
    map(streams) {
        if (!Array.isArray(streams)) return [];
        return streams.map(s => ({
            title: s.title || s.name || "Hanime Stream",
            link: s.url, // The app will treat this as the magnet/torrent link
            seeders: 100, // Dummy value
            leechers: 10,  // Dummy value
            downloads: 50, // Dummy value
            hash: btoa(s.url).substring(0, 20), // Needs a string hash
            size: 0,
            accuracy: "high",
            date: new Date()
        }));
    }

    async single(args) {
        try {
            // Hayase uses anidbEid for episodes
            const id = args?.anidbEid || args?.id;
            if (!id) return [];

            const sid = String(id).includes("hanime:") ? id : `hanime:${id}`;
            const res = await fetch(`${this.url}/stream/anime/${sid}.json`);
            
            if (!res.ok) return [];

            const data = await res.json();
            return data.streams ? this.map(data.streams) : [];
        } catch (e) {
            return [];
        }
    }

    async movie(args) {
        // Hayase uses anidbAid for movies
        const id = args?.anidbAid || args?.id;
        return await this.single({ id });
    }

    async batch(args) {
        // Must return an empty array, not undefined
        return [];
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