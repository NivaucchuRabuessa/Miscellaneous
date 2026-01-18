export default new class {
    /**
     * Helper to parse Nyaa's RSS XML
     */
    parseRSS(xmlText, resolutionFilter) {
        const items = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;

        while ((match = itemRegex.exec(xmlText)) !== null) {
            const content = match[1];
            const title = (content.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "Unknown").replace("<![CDATA[", "").replace("]]>", "");
            
            // Manual Resolution Filter
            if (resolutionFilter !== "All" && !title.includes(resolutionFilter)) {
                continue;
            }

            const link = (content.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "").replace("<![CDATA[", "").replace("]]>", "");
            const seeders = content.match(/<nyaa:seeders>(\d+)<\/nyaa:seeders>/)?.[1] || 0;
            const size = content.match(/<nyaa:size>([\s\S]*?)<\/size>/)?.[1] || "0";
            const hashMatch = link.match(/btih:([a-zA-Z0-9]+)/);

            items.push({
                title: title,
                link: link,
                seeders: parseInt(seeders),
                leechers: 0,
                downloads: 0,
                hash: hashMatch ? hashMatch[1] : Math.random().toString(36),
                size: size,
                accuracy: "medium",
                date: new Date()
            });
        }
        return items;
    }

    /**
     * Main search function
     */
    async search(query, options) {
        try {
            const site = options?.site || "https://sukebei.nyaa.si/";
            const filter = options?.filter || "2"; // 2 = Trusted
            const resFilter = options?.resolution || "All";
            
            // Determine Category based on site
            // Nyaa Main Anime: 1_2 | Sukebei Anime: 1_1
            const category = site.includes("sukebei") ? "1_1" : "1_2";

            const url = `${site}?page=rss&f=${filter}&c=${category}&q=${encodeURIComponent(query)}`;
            
            const response = await fetch(url);
            if (!response.ok) return [];
            
            const text = await response.text();
            return this.parseRSS(text, resFilter);
        } catch (e) {
            return [];
        }
    }

    async single(args, options) {
        const query = args?.animeName ? `${args.animeName} ${args.episodeNumber || ""}` : "";
        return await this.search(query, options);
    }

    async movie(args, options) {
        return await this.search(args?.animeName || "", options);
    }

    async batch(args, options) {
        return await this.search((args?.animeName || "") + " batch", options);
    }

    async test() {
        return true;
    }
};