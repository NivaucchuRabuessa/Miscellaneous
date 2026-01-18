export default new class {
    // RSS Feed URL
    url = "https://sukebei.nyaa.si/?page=rss&f=1&c=1_1&q=";

    async single(args) {
        // Always try-catch to prevent Hayase from crashing
        try {
            const query = args?.animeName || "";
            if (!query) return [];

            const response = await fetch(this.url + encodeURIComponent(query));
            
            // If the site is down or blocks the request (CORS), return empty list
            if (!response.ok) return [];

            const text = await response.text();
            
            // Basic parsing to extract item blocks
            const results = [];
            const items = text.split("<item>");
            
            // Skip the first part (RSS header)
            for (let i = 1; i < items.length; i++) {
                const item = items[i];
                
                const title = item.match(/<title>(.*?)<\/title>/)?.[1] || "Unknown";
                const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
                const seeders = item.match(/<nyaa:seeders>(\d+)<\/nyaa:seeders>/)?.[1] || "0";
                const size = item.match(/<nyaa:size>(.*?)<\/nyaa:size>/)?.[1] || "Unknown size";

                // Ensure it's a valid result before pushing
                if (link.includes("magnet:")) {
                    results.push({
                        title: title.replace("<![CDATA[", "").replace("]]>", ""),
                        link: link.replace("<![CDATA[", "").replace("]]>", ""),
                        seeders: parseInt(seeders),
                        leechers: 0,
                        downloads: 0,
                        hash: link.match(/btih:(.*?)&/)?.[1] || Math.random().toString(),
                        size: size,
                        accuracy: "medium",
                        date: new Date()
                    });
                }
            }

            return results; // This is the Array Hayase needs
        } catch (err) {
            console.error(err);
            return []; // Return empty Array to fix "o is not iterable"
        }
    }

    async movie(args) {
        return await this.single(args);
    }

    async batch(args) {
        return await this.single(args);
    }

    async test() {
        try {
            const res = await fetch("https://sukebei.nyaa.si/static/favicon.png");
            return res.ok;
        } catch (e) {
            return false;
        }
    }
};