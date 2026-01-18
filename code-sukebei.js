export default new class SukebeiSource {
  // Base URL for Sukebei RSS
  url = "https://sukebei.nyaa.si/?page=rss&f=1&c=1_1&q=";

  parseSize(s) {
    const u = { 'KiB': 1024, 'MiB': 1048576, 'GiB': 1073741824, 'TiB': 1099511627776 };
    const parts = s.split(' ');
    const val = parseFloat(parts[0]);
    const unit = parts[1];
    return Math.floor(val * (u[unit] || 1));
  }

  async fetchNyaa(query) {
    try {
      const res = await fetch(this.url + encodeURIComponent(query));
      if (!res.ok) return [];
      const text = await res.text();
      
      const results = [];
      const items = text.split("<item>");
      
      for (let i = 1; i < items.length; i++) {
        const item = items[i];
        const title = (item.match(/<title>(.*?)<\/title>/)?.[1] || "").replace("<![CDATA[", "").replace("]]>", "");
        const link = (item.match(/<link>(.*?)<\/link>/)?.[1] || "").replace("<![CDATA[", "").replace("]]>", "");
        const seeders = item.match(/<nyaa:seeders>(\d+)<\/nyaa:seeders>/)?.[1] || "0";
        const leechers = item.match(/<nyaa:leechers>(\d+)<\/nyaa:leechers>/)?.[1] || "0";
        const size = item.match(/<nyaa:size>(.*?)<\/nyaa:size>/)?.[1] || "0 B";
        const date = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
        const hash = link.match(/btih:([a-zA-Z0-9]+)/)?.[1] || Math.random().toString(36);

        if (link.includes("magnet:")) {
          results.push({
            title,
            link,
            seeders: parseInt(seeders),
            leechers: parseInt(leechers),
            downloads: 0,
            hash,
            size: this.parseSize(size),
            accuracy: "medium",
            date: new Date(date || Date.now())
          });
        }
      }
      return results;
    } catch (e) {
      return [];
    }
  }

  async single(query) {
    const title = query.titles?.[0] || "";
    const ep = query.episode ? ` ${query.episode}` : "";
    return await this.fetchNyaa(title + ep);
  }

  async batch(query) {
    const title = query.titles?.[0] || "";
    return await this.fetchNyaa(title + " batch");
  }

  async movie(query) {
    const title = query.titles?.[0] || "";
    return await this.fetchNyaa(title);
  }

  async test() {
    try {
      const res = await fetch("https://sukebei.nyaa.si/static/favicon.png");
      return res.ok;
    } catch (e) {
      return false;
    }
  }
}();