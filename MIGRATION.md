## Migrating from v1 to v2

The changes from the original version of anime-scraper are quite drastic.
The project's source has been fully converted from JavaScript to CoffeeScript.

The biggest change with v2 is that you no longer need to maintain your Cloudflare cookie yourself.
Anime-scraper will fetch and keep your CloudFlare status up to date to ensure that you
are always authorised to scrape. This should hopefully prevent the 5 second delay every time you want to scrape,
or reduce the need for manual cookie storage.

Most (if not all) of the modules objects are now packaged inside of classes.

- Anime
- Episode
- SearchResult
- Video

The names of properties have also been changed in the majority of these classes for greater clarity.

#### Old vs New Structure
The method & variable names displayed on the right hand side are the new names

```js
Anime: {
  name: name
  url: url
  episodes: episodes
  info.names : summary
  info.genres : genres
  info.summary : summary
  info.airdates: -

  getVideoUrls: fetchAllEpisodes
}

Episode: {
  name: name
  pageUrl: url
  videoUrls: video_links

  getVideoUrl: fetch
}
```
