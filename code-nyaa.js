/**
 * Standalone AbstractSource to ensure compatibility without external files
 */
class AbstractSource {
  async single(query) { throw new Error('Source doesn\'t implement single') }
  async batch(query) { throw new Error('Source doesn\'t implement batch') }
  async movie(query) { throw new Error('Source doesn\'t implement movie') }
  async test() { throw new Error('Source doesn\'t implement test') }
}

export default new class Nyaa extends AbstractSource {
  // Use Nyaa RSS URL
  url = "https://nyaa.si/?page=rss&f=2&c=1_2&q=";

  /**
   * Helper: Parses Nyaa's size string into bytes
   * @param {string} s 
   */
  pS(s) {
    const u = { 'KiB': 1024, 'MiB': 1048576, 'GiB': 1073741824, 'TiB': 1099511627776 };
    const parts = s.split(' ');
    const val = parseFloat(parts[0]);
    const unit = parts[1];
    return Math.floor(val * (u[unit] || 1));
  }

  /**
   * Helper: Parses Nyaa RSS XML into Hayase TorrentResult[]
   * @param {string} text 
   */
  map(text) {
    const items = text.split("<item>");
    const results = [];
    
    for (let i = 1; i < items.length; i++) {
      const item = items[i];
      const title = (item.match(/<title>(.*?)<\/title>/)?.[1] || "").replace("<![CDATA[", "").replace("]]>", "");
      const link = (item.match(/<link>(.*?)<\/link>/)?.[1] || "").replace("<![CDATA[", "").replace("]]>", "");
      const seeders = item.match(/<nyaa:seeders>(\d+)<\/nyaa:seeders>/)?.[1] || "0";
      const leechers = item.match(/<nyaa:leechers>(\d+)<\/nyaa:leechers>/)?.[1] || "0";
      const sizeStr = item.match(/<nyaa:size>(.*?)<\/nyaa:size>/)?.[1] || "0 B";
      const dateStr = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
      const hash = link.match(/btih:([a-zA-Z0-9]+)/)?.[1] || Math.random().toString(36);

      if (link.includes("magnet:")) {
        results.push({
          title: title,
          link: link,
          seeders: parseInt(seeders),
          leechers: parseInt(leechers),
          downloads: 0,
          hash: hash,
          size: this.pS(sizeStr),
          accuracy: "medium",
          date: new Date(dateStr || Date.now())
        });
      }
    }
    return results;
  }

  /** @type {import('./index.js').SearchFunction} */
  async single({ titles, episode }) {
    if (!titles?.length) return [];
    // Search Nyaa using the first title + episode number
    const query = `${titles[0]} ${episode || ""}`;
    const res = await fetch(this.url + encodeURIComponent(query));
    if (!res.ok) return [];
    return this.map(await res.text());
  }

  /** @type {import('./index.js').SearchFunction} */
  async batch({ titles }) {
    if (!titles?.length) return [];
    const res = await fetch(this.url + encodeURIComponent(titles[0] + " batch"));
    if (!res.ok) return [];
    return this.map(await res.text());
  }

  /** @type {import('./index.js').SearchFunction} */
  async movie({ titles }) {
    if (!titles?.length) return [];
    const res = await fetch(this.url + encodeURIComponent(titles[0]));
    if (!res.ok) return [];
    return this.map(await res.text());
  }

  async test() {
    try {
      const res = await fetch("https://nyaa.si/static/favicon.png");
      return res.ok;
    } catch (e) {
      return false;
    }
  }
}();