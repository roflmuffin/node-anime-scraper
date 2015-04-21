Node Anime Scraper
===================
Scrapes information from KissAnime.com to get anime, episode &amp; video information &amp; urls.

## NOT FUNCTIONAL
As of right now this module does not work due to the fact that KissAnime now uses CloudFlare on every request.

Anime-scraper is a module that provides an easy way to scrape KissAnime.com for anime information, including foreign names, genres & airdates as well as a brief summary.
On top of this, it is also possible to retrieve an animes list of episodes, as well as get their direct video links in a variety of qualities where available.

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
