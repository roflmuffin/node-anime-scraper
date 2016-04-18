Node Anime Scraper
===================

### :heavy_exclamation_mark: Transition
**This package is getting ready to transition to version 2. You should read through the [new branch README](https://github.com/roflmuffin/node-anime-scraper/tree/v2) and also familiarise yourself with the [migration document](https://github.com/roflmuffin/node-anime-scraper/blob/v2/MIGRATION.md). There are a few QOL improvements as well as API changes.**

***

Anime-scraper is a module that provides an easy way to scrape KissAnime.com for anime information, including foreign names, genres & airdates as well as a brief summary.
On top of this, it is also possible to retrieve an animes list of episodes, as well as get their direct video links in a variety of qualities where available.

Currently KissAnime is using CloudFlare protection service which makes scraping difficult,
and as a result, anime-scraper now requires a CloudFlare cookie string to be set before
any requests can be made.

#### Setting Session Cookie String
```js
var AnimeUtils = require('anime-scraper').AnimeUtils

var cookieString = '__cfduid=dff461762a5b0e6405a676b2d8ff7042d1432462170; cf_clearance=2ae261418c356fecf3c7535cf9d30df2b7604bc5-1432462177-604800'
AnimeUtils.setSessionCookie(cookieString)
```

#### How do I retrieve the CloudFlare Session Cookie?
I recommend using codemankis [Cloudscraper package](https://github.com/codemanki/cloudscraper)
to get a session cookie for use with anime-scraper. Simply use as follows:

```js
cloudscraper.get('http://kissanime.com', function(err, resp, body) {
  var cookieString = resp.request.headers.cookie
  AnimeUtils.setSessionCookie(cookieString)

  // You are now free to use any of the examples below!
});
```

## Examples

#### Retrieve anime information of anime named 'Sword Art Online II'
```js
var Anime = require('anime-scraper').Anime

// Searches for anime using a POST request & gets information.
Anime.fromName('Sword Art Online II').then(function (anime) {
  console.log(anime.info)  
})
```

#### Retrieve video links to first episode of anime named 'Haikyuu'
```js
Anime.fromName('Haikyuu!!').then(function (anime) {
  console.log(anime.info)

  // Retrieve videolinks from episode page.
  anime.episodes[0].getVideoUrl().then(function (urls) {
    console.log(urls)
  })
})
```

#### Retrieve all episode video data for anime named 'Yoru no Yatterman'
```js
Anime.fromName('Yoru no Yatterman').then(function(anime) {
  anime.getVideoUrls().then(function(results) {
    console.log(results)
  })
})
```

### Get Anime from KissAnime URL
**NOTE**: This is much faster than instantiating using fromName as you do not have to make a POST request (1 request instead of 2).
```js
Anime.fromUrl('http://kissanime.com/Anime/Naruto-Shippuuden').then(function(anime) {
  console.log(anime)
})
```

### Get list of all animes available on KissAnime.com
```js
var AnimeUtils = require('anime-scraper').AnimeUtils

AnimeUtils.searchByName('').then(function(results) {
    console.log(results);
})
```
##### Output
```json
{
  [
    {
      "name" : ".hack//G.U. Returner",
      "url" : "http://kissanime.com/Anime/hack-G-U-Returner"
    },
    {
      "name" : ".hack//G.U. Trilogy",
      "url" : "http://kissanime.com/Anime/hack-G-U-Trilogy"
    }
  ]
}
```
### Suggested Usage
Due to the nature of having to post 2 requests if you want to search by name, it is instead suggested that you maintain a cached version of all anime using:
```js
  AnimeUtils.searchByName('')
```
and then using:
```js
Anime.fromUrl()
```
to instantiate your anime object.


## Install
```
npm install anime-scraper
```
