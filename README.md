Node Anime Scraper
===================

***

Scrapes information from GOGOAnime.io to get anime, episode &amp; video information &amp; urls.

Anime-scraper is a module that provides an easy way to scrape GOGOAnime.io for anime information, including genres and a brief summary.
On top of this, it is also possible to retrieve an animes list of episodes, as well as get their direct video links in a variety of qualities where available.

Currently GOGOAnime is using CloudFlare protection service which makes scraping difficult,
and as a result, anime-scraper makes use of [cloudscraper](https://github.com/codemanki/cloudscraper) to automatically
to bypass this restriction.

:white_check_mark: Anime-scraper automatically manages your CloudFlare cookie and ensures that it is always valid.

## Install
```
npm install anime-scraper
```

## Examples

#### Retrieve anime information of anime named 'Sword Art Online II'
```js
var Anime = require('anime-scraper').Anime

// Searches for anime using a POST request & uses first result
Anime.fromName('Sword Art Online').then(function (anime) {
  console.log(anime)
})

// You can also search and then choose manually
Anime.search('Sword Art Online').then(function (results) {
  // Same as above but uses the second search result rather than the first.
  results[1].toAnime().then(function (anime) {
    console.log(anime)
  })
})
```

#### Retrieve video links to first episode of anime named 'Haikyuu'
```js
Anime.fromName('Haikyuu!!').then(function (anime) {
  anime.episodes[0].fetch().then(function (episode) {
    console.log(episode)
  })
})
```

#### Retrieve all episode video data for anime named 'Yoru no Yatterman'
```js
Anime.fromName('Yoru no Yatterman').then(function(anime) {
  anime.fetchAllEpisodes().then(function(episodes) {
    console.log(episodes)
  })
})
```

### Get Anime from GOGOAnime URL
**NOTE**: This is much faster than instantiating using fromName as you do not have to make a POST request (1 request instead of 2).
```js
Anime.fromUrl('https://ww1.gogoanime.io/category/naruto-shippuden').then(function(anime) {
  console.log(anime)
})
```

### Other information
This package has just been re-created to use GOGOAnime after previously using KissAnime.
As such, there are currently no tests or testing as yet. Please raise an issue or submit a PR if you find anything that requires fixing.

Please note that this version of this package currently uses AirBNB ES6 as a style guide.

### Contributors

Many thanks to contributors.

- [van-nguyen](https://github.com/van-nguyen)
- [andrewprivate](https://github.com/andrewprivate)
