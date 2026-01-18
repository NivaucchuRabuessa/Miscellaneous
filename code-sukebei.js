export default new class {
  // Sukebei RSS URL
  url = "https://sukebei.nyaa.si/?page=rss&f=1&c=1_1&q=";

  // Helper to parse the size string into bytes
  pS(s) {
    const u = { 'KiB': 1024, 'MiB': 1048576, 'GiB': 1073741824, 'TiB': 1099511627776 };
    const parts = s.split(' ');
    return Math.floor(parseFloat(parts[0]) * (u[parts[1]] || 1));
  }

  // Maps RSS items to Hayase TorrentResult format
  map(text) {
    const items = text.split("<item>");
    const results = [];
    for (let i = 1; i < items.length; i++) {
      const item = items[i];
      const title = (item.match(/<title>(.*?)<\/title>/)?.[1] || "").replace("<![CDATA[", "").replace("]]>", "");
      const link = (item.match(/<link>(.*?)<\/link>/)?.[1] || "").replace("<![CDATA[", "").replace("]]>", "");
      const seeders = item.match(/<nyaa:seeders>(\d+)<\/nyaa:seeders>/)?.[1] || "0";
      const size = item.match(/<nyaa:size>(.*?)<\/nyaa:size>/)?.[1] || "0 B";
      const date = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
      const hash = link.match(/btih:([a-zA-Z0-9]+)/)?.[1] || Math.random().toString(36);

      if (link.includes("magnet:")) {
        results.push({
          title: title,
          link: link,
          seeders: parseInt(seeders),
          leechers: 0,
          downloads: 0,
          hash: hash,
          size: this.pS(size),
          accuracy: "medium",
          date: new Date(date || Date.now())
        });
      }
    }
    return results;
  }

  // Hayase passes the query object as the first argument
  async single({ titles, episode }) {
    if (!titles || titles.length === 0) return [];
    const query = `${titles[0]} ${episode || ""}`;
    const res = await fetch(this.url + encodeURIComponent(query));
    if (!res.ok) return [];
    return this.map(await res.text());
  }

  async batch({ titles }) {
    if (!titles || titles.length === 0) return [];
    const res = await fetch(this.url + encodeURIComponent(titles[0] + " batch"));
    if (!res.ok) return [];
    return this.map(await res.text());
  }

  async movie({ titles }) {
    if (!titles || titles.length === 0) return [];
    const res = await fetch(this.url + encodeURIComponent(titles[0]));
    if (!res.ok) return [];
    return this.map(await res.text());
  }

  async test() {
    const res = await fetch("https://sukebei.nyaa.si/static/favicon.png");
    return res.ok;
  }
};