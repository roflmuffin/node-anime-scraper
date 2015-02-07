# Node Anime Scraper
Scrapes information from KissAnime.com to get anime, episode &amp; video information &amp; urls.

## Introduction

```
var Anime = require('anime-scraper').Anime;

Anime.fromName('Haikyuu!!').then(function(anime) {
  console.log(anime);
  
  anime.episodes[0].getVideoUrl().then(function(urls) {
    console.log(urls);
  });
});
```

## Install
```
npm install anime-scraper
```
