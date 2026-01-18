export default new class SukebeiSource {
  baseUrl = "https://sukebei.nyaa.si/?page=rss&f=1&c=1_1&q=";

  /**
   * Helper: Converts Nyaa size strings (e.g. "1.2 GiB") to bytes
   */
  parseSize(sizeStr) {
    const units = { 'KiB': 1024, 'MiB': 1048576, 'GiB': 1073741824, 'TiB': 1099511627776 };
    const [val, unit] = sizeStr.split(' ');
    return Math.floor(parseFloat(val) * (units[unit] || 1));
  }

  /**
   * Core search logic
   */
  async fetchResults(queryStr) {
    try {
      const response = await fetch(this.baseUrl + encodeURIComponent(queryStr));
      if (!response.ok) return [];
      const text = await response.text();
      
      const results = [];
      const items = text.split("<item>");
      
      for (let i = 1; i < items.length; i++) {
        const item = items[i];
        const title = (item.match(/<title>(.*?)<\/title>/)?.[1] || "").replace("<![CDATA[", "").replace("]]>", "");
        const link = (item.match(/<link>(.*?)<\/link>/)?.[1] || "").replace("<![CDATA[", "").replace("]]>", "");
        const seeders = item.match(/<nyaa:seeders>(\d+)<\/nyaa:seeders>/)?.[1] || "0";
        const leechers = item.match(/<nyaa:leechers>(\d+)<\/nyaa:leechers>/)?.[1] || "0";
        const sizeStr = item.match(/<nyaa:size>(.*?)<\/nyaa:size>/)?.[1] || "0 B";
        const dateStr = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
        
        const hashMatch = link.match(/btih:([a-zA-Z0-9]+)/);

        if (link.includes("magnet:")) {
          results.push({
            title: title,
            link: link,
            seeders: parseInt(seeders),
            leechers: parseInt(leechers),
            downloads: 0,
            hash: hashMatch ? hashMatch[1] : Math.random().toString(36),
            size: this.parseSize(sizeStr), // Must be a Number
            accuracy: "medium",
            date: dateStr ? new Date(dateStr) : new Date() // Must be a Date object
          });
        }
      }
      return results;
    } catch (e) {
      return [];
    }
  }

  /** @type {import('./index.js').SearchFunction} */
  async single(query) {
    // query.titles is an array provided by Hayase
    const name = query.titles && query.titles.length > 0 ? query.titles[0] : "";
    const ep = query.episode ? ` ${query.episode}` : "";
    return await this.fetchResults(name + ep);
  }

  /** @type {import('./index.js').SearchFunction} */
  async batch(query) {
    const name = query.titles && query.titles.length > 0 ? query.titles[0] : "";
    return await this.fetchResults(name + " batch");
  }

  /** @type {import('./index.js').SearchFunction} */
  async movie(query) {
    const name = query.titles && query.titles.length > 0 ? query.titles[0] : "";
    return await this.fetchResults(name);
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