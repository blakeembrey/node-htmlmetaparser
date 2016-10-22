const thenify = require('thenify')
const writeFile = thenify(require('fs').writeFile)
const mkdir = thenify(require('fs').mkdir)
const stat = thenify(require('fs').stat)
const join = require('path').join
const filenamify = require('filenamify')
const popsicle = require('popsicle')
const stringify = require('json-stable-stringify')

const FIXTURE_DIR = join(__dirname, '../test/fixtures')

// Fixtures to store for extraction tests.
const FIXTURES = [
  // Source code repository.
  'https://github.com/blakeembrey/popsicle',
  'https://github.com/moment/moment/pull/3323',
  'https://github.com/Microsoft/TypeScript/issues/10462',
  // Profile pages.
  'https://github.com/blakeembrey',
  'https://twitter.com/blakeembrey',
  // Music pages.
  'https://soundcloud.com/lifeofdesiigner/desiigner-panda',
  'https://soundcloud.com/tobiasvanschneider/ntmy-episode-1-pieter-levels',
  'https://slant6.bandcamp.com/',
  // Movie pages.
  'http://www.imdb.com/title/tt1375666/',
  'https://www.rottentomatoes.com/m/inception/',
  'https://trakt.tv/movies/kung-fury-2015',
  // File pages.
  'http://d.pr/a/q3z9',
  // Information pages.
  'https://en.wikipedia.org/wiki/TypeScript',
  'https://en.wikipedia.org/wiki/Jean-Luc_Picard',
  // Places.
  'https://www.google.com/maps/place/Boba+Guys/@37.7600441,-122.4233333,17z/data=!4m5!3m4!1s0x808f7e3cfdb89265:0x8ae0820c41111f70!8m2!3d37.7600017!4d-122.4211124',
  'https://foursquare.com/v/boba-guys/51abb0a3498eb42c0d5cf324',
  'https://foursquare.com/v/sydney-opera-house/4b058762f964a5201b8f22e3',
  'https://foursquare.com/v/royal-botanic-garden/4b058761f964a520188f22e3',
  'https://foursquare.com/v/bondi-beach/4b058763f964a520848f22e3',
  'https://foursquare.com/v/darling-harbour/4b058762f964a5201d8f22e3',
  'https://foursquare.com/v/the-baxter-inn/4ed4896c775b45f6ed7b0182',
  'https://foursquare.com/v/mrs-macquaries-point/4b3c2445f964a520348225e3',
  'https://foursquare.com/v/bourke-street-bakery/4b0b4a63f964a520fa2f23e3',
  'http://www.yelp.com/biz/boba-guys-san-francisco-4',
  // Social media posts.
  'https://news.ycombinator.com/item?id=12282756',
  'https://www.reddit.com/r/news/comments/4p1enj/uk_man_tried_to_kill_trump_court_papers/',
  'https://twitter.com/typescriptlang/status/743113612407889920',
  'https://twitter.com/ericclemmons/status/749223563790471169',
  'https://twitter.com/alexisohanian/status/764997551384776704',
  'https://twitter.com/SeanTAllen/status/764993929469161472',
  // Image pages.
  'https://www.flickr.com/photos/timdrivas/27999498362/in/explore-2016-07-05/',
  'https://www.flickr.com/photos/fabianf_/28229743586/sizes/o/',
  'https://www.instagram.com/p/BG0m4IDGaqk/',
  // Pricing pages.
  'http://cloudinary.com/pricing',
  // Forum posts.
  'https://discourse.codinghorror.com/t/the-raspberry-pi-has-revolutionized-emulation/4462/29',
  // Video pages.
  'https://www.youtube.com/watch?v=W9ZnpIGvZUo',
  'https://www.ted.com/talks/tim_harford_how_messy_problems_can_inspire_creativity',
  'https://www.ted.com/playlists/321/talks_to_form_better_habits?utm_campaign=social&utm_medium=referral&utm_source=facebook.com&utm_content=playlist&utm_term=social-science',
  'https://www.youtube.com/watch?v=ZynZdGqxT7Q',
  // XKCD entries.
  'http://xkcd.com/208/',
  // Schema pages.
  'https://schema.org/WebSite',
  // Documentation.
  'https://developers.google.com/search/docs/guides/intro-structured-data',
  'https://learnxinyminutes.com/docs/standard-ml/',
  'https://dev.twitter.com/cards/types/player',
  'https://www.w3.org/TR/json-ld/',
  'http://knexjs.org/',
  'https://codex.wordpress.org/Embeds/',
  // Product pages.
  'https://bjango.com/mac/istatmenus/',
  'http://www.newegg.com/Product/Product.aspx?Item=28-840-014',
  'https://www.etsy.com/listing/230389421/agents-of-shield-decal-sticker-for-car?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=&ref=sr_gallery_20',
  'https://www.thinkgeek.com/product/jjip/?pfm=HP_ProdTab_1_7_NewStuff_jjip',
  'http://www.ebay.com/itm/Outdoor-Wicker-Patio-Furniture-Sofa-3-Seater-Luxury-Comfort-Brown-Wicker-Couch-/381228738769?&_trksid=p2056016.l4276',
  'http://store.steampowered.com/app/8930/',
  'https://itunes.apple.com/us/movie/the-avengers/id533654020',
  'http://www.mysteryranch.com/asap-pack',
  'http://www.bestbuy.com/site/apple-iphone-6s-64gb-space-gray-verizon-wireless/4447801.p?id=bb4447801&skuId=4447801',
  'https://itunes.apple.com/us/app/pokemon-go/id1094591345?mt=8',
  'https://smile.amazon.com/gp/product/1937785734/ref=s9_qpp_gw_d99_g14_i5_r?ie=UTF8&fpl=fresh&pf_rd_m=ATVPDKIKX0DER&pf_rd_s=desktop-1&pf_rd_r=92JG667YC8526036ANPR&pf_rd_t=36701&pf_rd_p=6aad23bd-3035-4a40-b691-0eefb1a18396&pf_rd_i=desktop', // Good cross-domain redirect test.
  'https://www.airbnb.com/rooms/2250401?checkin=06%2F24%2F2016&checkout=06%2F30%2F2016&guests=1&s=eI3nl9s6',
  'http://franz.com/agraph/allegrograph/',
  'http://shop.boostedboards.com/products/boosted-dual-plus?variant=1141824744',
  'https://www.kickstarter.com/projects/lactate-threshold/lvl-the-first-wearable-hydration-monitor?ref=category_featured',
  'https://pragprog.com/book/btlang/seven-languages-in-seven-weeks',
  'https://www.battlefield.com/buy/battlefield-1',
  // Documents.
  'https://drive.google.com/file/d/0B59Tysg-nEQZOGhsU0U5QXo0Sjg/view?usp=sharing',
  'https://docs.google.com/document/d/1GnsFxQZWERvB5A2cYnmpmNzgH_zAtUsUMQ-th1em2jQ/edit?usp=sharing',
  'https://docs.google.com/spreadsheets/d/1teKblpByMmLaSmRAqDCyLXf0RApcJg3sg4E0MMmfrPg/edit?usp=sharing',
  // Quora.
  'https://www.quora.com/How-do-I-impress-a-computer-programmer-on-a-date',
  // Homepages.
  'http://hackerne.ws', // Good redirection test.
  'https://www.spotify.com/',
  'https://github.com/',
  'https://www.facebook.com/',
  'https://twitter.com/',
  'http://www.reddit.com/',
  'http://ogp.me/',
  'https://techcrunch.com/',
  'http://cnn.com/',
  'https://www.ampproject.org/',
  'http://microformats.org/',
  // Blog/article posts.
  'http://www.lifehacker.com.au/2016/08/some-bill-providers-automatically-update-your-credit-card-when-you-get-a-new-one/',
  'http://www.theverge.com/2016/8/10/12416766/google-white-house-ostp-emails?utm_campaign=theverge&utm_content=chorus&utm_medium=social&utm_source=twitter',
  'http://gizmodo.com/the-dnc-hack-was-much-bigger-than-we-thought-1785145268?utm_campaign=socialflow_gizmodo_twitter&utm_source=gizmodo_twitter&utm_medium=socialflow',
  'https://bjango.com/articles/pngoptimisation/',
  'https://droplr.com/droplr-addition-google-chrome-extension',
  'https://adactio.com/journal/9881',
  'http://www.news.com.au/world/breaking-news/uk-man-tried-to-kill-trump-court-papers/news-story/c4116603f54f1b7c88339cd039c7e123',
  'http://html5doctor.com/microdata/',
  'http://www.nytimes.com/2016/06/15/opinion/campaign-stops/decoding-donald-trump.html?action=click&module=MostEmailed&region=Lists&pgtype=collection',
  'https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254#.a0wjf4ltt',
  'https://segment.com/blog/the-segment-aws-stack/',
  'http://mashable.com/2016/06/17/battle-of-the-bastards-game-of-thrones-fantasy-ending/#L2pP7_P5k5q3',
  'https://techcrunch.com/2016/06/17/the-europas-awards-2016-honored-the-best-tech-startups-in-europe/',
  'https://aaronparecki.com/2016/08/23/2/micropub-cr?utm_medium=email&utm_source=html5weekly',
  'http://ideas.ted.com/why-i-learned-20-languages-and-what-i-learned-about-myself-in-the-process/?utm_campaign=social&utm_medium=referral&utm_source=facebook.com&utm_content=ideas-blog&utm_term=education',
  'https://stratechery.com/2016/google-uber-and-the-evolution-of-transportation-as-a-service/',
  'https://github.com/blog/2242-git-2-10-has-been-released',
  'http://waitbutwhy.com/2016/09/marriage-decision.html',
  'http://arstechnica.com/gadgets/2016/10/google-pixel-review-bland-pricey-but-still-best-android-phone/',
  'https://dzone.com/articles/exploring-graph-representation',
  // Courses.
  'https://www.khanacademy.org/economics-finance-domain/core-finance/stock-and-bonds/stocks-intro-tutorial/v/bonds-vs-stocks',
  'https://www.coursera.org/learn/machine-learning',
  // Contact page.
  'https://www.mulesoft.com/contact',
  // Developer pages.
  'https://www.npmjs.com/package/filenamify',
  'https://atom.io/themes/aesthetic-ui',
  // Schema definitions.
  'https://schema.org/docs/schema_org_rdfa.html'
]

// Read each fixture, populating the raw content.
Promise.all(FIXTURES.map(function (fixtureUrl) {
  const filename = filenamify(fixtureUrl)
  const dir = join(FIXTURE_DIR, filename)

  function fetch () {
    console.log('Fetching "' + fixtureUrl + '"...')

    return popsicle.request({
      url: fixtureUrl,
      transport: popsicle.createTransport({
        type: 'buffer',
        jar: popsicle.jar(),
        maxBufferSize: 20 * 1000 * 1000
      })
    })
      .then(function (res) {
        return mkdir(dir)
          .then(function () {
            console.log('Writing "' + filename + '"...')

            const meta = {
              originalUrl: fixtureUrl,
              url: res.url,
              headers: res.headers,
              status: res.status,
              statusText: res.statusText
            }

            return Promise.all([
              writeFile(join(dir, 'meta.json'), stringify(meta, { space: 2 })),
              writeFile(join(dir, 'body.html'), res.body)
            ])
          })
      })
  }

  return stat(dir)
    .then(
      function (stats) {
        if (stats.isDirectory()) {
          console.log('Skipping "' + fixtureUrl + '"...')
          return
        }

        return fetch()
      },
      function () {
        return fetch()
      }
    )
}))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
