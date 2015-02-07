# Node Anime Scraper
Scrapes information from KissAnime.com to get anime, episode &amp; video information &amp; urls.

## Introduction

```
var Anime = require('anime-scraper').Anime

Anime.fromName('Haikyuu!!').then(function(anime) {
  console.log(anime)
  
  anime.episodes[0].getVideoUrl().then(function(urls) {
    console.log(urls)
  })
})
```
## Outputs
```
{
    "names": [
        "High Kyuu!!",
        " ハイキュー!!",
        " Haikyu!!"
    ],
    "genres": [
        "Comedy",
        "Drama",
        "School",
        "Shounen",
        "Sports"
    ],
    "airdates": [
        "Apr 6, 2014",
        "Sep 21, 2014"
    ],
    "summary": "A chance event triggered Shouyou Hinata's love for volleyball. His club had no members, but somehow persevered and finally made it into its very first and final regular match of middle school, where it was steamrolled by Tobio Kageyama, a superstar player known as \"King of the Court.\" Vowing revenge, Hinata applied to the Karasuno High School volleyball club... only to come face-to-face with his hated rival, Kageyama! A tale of hot-blooded youth and volleyball from the pen of Haruichi Furudate!!"
}
```

```
[
    {
        "name": "1080p",
        "url": "https://redirector.googlevideo.com/videoplayback?requiressl=yes&shardbypass=yes&cmbypass=yes&id=ba7c0db28a7ba47f&itag=37&source=picasa&cmo=secure_transport=yes&ip=0.0.0.0&ipbits=0&expire=1425440950&sparams=requiressl,shardbypass,cmbypass,id,itag,source,ip,ipbits,expire&signature=B550EB1CB89B9471175F2B71BB47F9A1200EB065.A9920AB3DC8863B12956D240B42FFFC185757EF7&key=lh1"
    },
    {
        "name": "720p",
        "url": "https://redirector.googlevideo.com/videoplayback?requiressl=yes&shardbypass=yes&cmbypass=yes&id=ba7c0db28a7ba47f&itag=22&source=picasa&cmo=secure_transport=yes&ip=0.0.0.0&ipbits=0&expire=1425440950&sparams=requiressl,shardbypass,cmbypass,id,itag,source,ip,ipbits,expire&signature=8A5922708D5252D9600E4D2E7776A06AC283FC17.4F4C51F64F7179DCD85C9F9B05E9A8E927D36F22&key=lh1"
    },
    {
        "name": "360p",
        "url": "https://redirector.googlevideo.com/videoplayback?requiressl=yes&shardbypass=yes&cmbypass=yes&id=ba7c0db28a7ba47f&itag=18&source=picasa&cmo=secure_transport=yes&ip=0.0.0.0&ipbits=0&expire=1425440950&sparams=requiressl,shardbypass,cmbypass,id,itag,source,ip,ipbits,expire&signature=9E457C8B3501D62E67E31FEE59E336380A17F80.D2AEB76EB039DB58EE105F7B0491BC7027526499&key=lh1"
    }
]
```

## Install
```
npm install anime-scraper
```
