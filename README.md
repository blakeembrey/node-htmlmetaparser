# htmlmetaparser

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][build-image]][build-url]
[![Build coverage][coverage-image]][coverage-url]

> A `htmlparser2` handler for parsing rich metadata from HTML. Includes HTML metadata, JSON-LD, RDFa, microdata, OEmbed, Twitter cards and AppLinks.

## Installation

```sh
npm install htmlmetaparser --save
```

## Usage

[Try it using Runkit!](https://runkit.com/blakeembrey/htmlmetaparser)

```ts
import { Handler } from "htmlmetaparser";
import { Parser } from "htmlparser2";

const url =
  "https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254";

const handler = new Handler(
  (err, result) => {
    console.log(result);
  },
  {
    url, // The HTML pages URL is used to resolve relative URLs.
  }
);

// Create a HTML parser with the handler.
const parser = new Parser(handler, { decodeEntities: true });
parser.write(html);
parser.end();

/*
Object {
  "alternate": Array [],
  "applinks": Object {
    "android:app_name": "Medium",
    "android:package": "com.medium.reader",
    "android:url": "medium://p/e64b4bb9254",
    "ios:app_name": "Medium",
    "ios:app_store_id": "828256236",
    "ios:url": "medium://p/e64b4bb9254",
    "web:url": "https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254",
  },
  "html": Object {
    "author": "Matt Haughey",
    "canonical": "https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254",
    "description": "Let’s start with the most obvious question first. This is what an “unfurl” is:",
    "robots": "index, follow",
    "title": "Everything you ever wanted to know about unfurling but were afraid to ask /or/ How to make your… – Slack Platform Blog – Medium",
    "viewport": "width=device-width, initial-scale=1",
  },
  "jsonld": Object {
    "@context": "http://schema.org",
    "@type": "NewsArticle",
    "author": Object {
      "@type": "Person",
      "name": "Matt Haughey",
      "url": "https://medium.com/@mathowie",
    },
    "creator": Array [
      "Matt Haughey",
    ],
    "dateModified": "2016-04-08T05:59:26.776Z",
    "datePublished": "2015-11-24T21:33:25.196Z",
    "headline": "Everything you ever wanted to know about unfurling but were afraid to ask /or/ How to make your…",
    "image": Object {
      "@type": "ImageObject",
      "height": 2000,
      "url": "https://cdn-images-1.medium.com/max/1360/1*QOMaDLcO8rExD0ctBV3BWg.png",
      "width": 1360,
    },
    "keywords": Array [
      "Web Development",
      "Slack",
      "How To",
    ],
    "mainEntityOfPage": "https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254",
    "name": "Everything you ever wanted to know about unfurling but were afraid to ask /or/ How to make your…",
    "publisher": Object {
      "@type": "Organization",
      "logo": Object {
        "@type": "ImageObject",
        "height": 60,
        "url": "https://cdn-images-1.medium.com/max/215/1*5ztbgEt4NqpVaxTc64C-XA.png",
        "width": 215,
      },
      "name": "Slack Platform Blog",
      "url": "https://medium.com/slack-developer-blog",
    },
  },
  "rdfa": Object {
    "@context": Object {
      "article": "http://ogp.me/ns/article#",
      "cc": "https://creativecommons.org/ns#",
      "fb": "http://ogp.me/ns/fb#",
      "medium-com": "http://ogp.me/ns/fb/medium-com#",
      "og": "http://ogp.me/ns#",
    },
    "@graph": Array [
      Object {
        "al:android:app_name": "Medium",
        "al:android:package": "com.medium.reader",
        "al:android:url": "medium://p/e64b4bb9254",
        "al:ios:app_name": "Medium",
        "al:ios:app_store_id": "828256236",
        "al:ios:url": "medium://p/e64b4bb9254",
        "al:web:url": "https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254",
        "article:author": "https://medium.com/@mathowie",
        "article:published_time": "2015-11-24T21:33:25.196Z",
        "article:publisher": "https://www.facebook.com/medium",
        "cc:attributionName": Object {
          "@language": "en",
          "@type": undefined,
          "@value": "https://medium.com/@mathowie",
        },
        "cc:attributionUrl": Object {
          "@id": "https://medium.com/@mathowie",
        },
        "fb:app_id": "542599432471018",
        "fb:smart_publish:robots": "noauto",
        "og:description": "Let’s start with the most obvious question first. This is what an “unfurl” is:",
        "og:image": "https://cdn-images-1.medium.com/max/1200/1*QOMaDLcO8rExD0ctBV3BWg.png",
        "og:site_name": "Medium",
        "og:title": "Everything you ever wanted to know about unfurling but were afraid to ask /or/ How to make your… – Slack Platform Blog",
        "og:type": "article",
        "og:url": "https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254",
      },
    ],
  },
  "twitter": Object {
    "app:id:iphone": "828256236",
    "app:name:iphone": "Medium",
    "app:url:iphone": "medium://p/e64b4bb9254",
    "card": "summary_large_image",
    "creator": "@mathowie",
    "description": "Let’s start with the most obvious question first. This is what an “unfurl” is:",
    "image:src": "https://cdn-images-1.medium.com/max/1200/1*QOMaDLcO8rExD0ctBV3BWg.png",
    "site": "@Medium",
  },
}
*/
```

**Please note:** No HTTP requests are made by `htmlmetaparser`. You must decide what you want to retrieve by traversing the `alternate` array and making requests manually (E.g. external JSON-LD documents, RDF documents, OEmbed, RSS).

## Development

```sh
# Build fixtures and providers.
npm run vendor && npm run fixtures

# Run the test suite.
npm test

# Run the test suite and update snapshots.
npm test -- -u
```

## License

Apache 2.0

[npm-image]: https://img.shields.io/npm/v/htmlmetaparser.svg?style=flat
[npm-url]: https://npmjs.org/package/htmlmetaparser
[downloads-image]: https://img.shields.io/npm/dm/htmlmetaparser.svg?style=flat
[downloads-url]: https://npmjs.org/package/htmlmetaparser
[build-image]: https://img.shields.io/github/workflow/status/blakeembrey/htmlmetaparser/CI/main
[build-url]: https://github.com/blakeembrey/htmlmetaparser/actions/workflows/ci.yml?query=branch%3Amain
[coverage-image]: https://img.shields.io/codecov/c/gh/blakeembrey/htmlmetaparser
[coverage-url]: https://codecov.io/gh/blakeembrey/htmlmetaparser
