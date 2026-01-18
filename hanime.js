export default new class {
    url = "https://hanime-stremio.fly.dev";

    map(streams) {
        return (streams || []).map(s => ({
            title: s.title || s.name,
            link: s.url,
            size: 0,
            accuracy: "high"
        }));
    }

    async single({ id }) {
        if (!id) return [];
        const sid = id.includes("hanime:") ? id : `hanime:${id}`;
        const res = await fetch(`${this.url}/stream/anime/${sid}.json`);
        const data = await res.json();
        return this.map(data.streams);
    }

    async movie(args) {
        return this.single(args);
    }

    async test() {
        const res = await fetch(`${this.url}/manifest.json`);
        return res.ok;
    }
};