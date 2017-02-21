import { set } from 'setvalue'
import { resolve as resolveUrl } from 'url'
import { OEmbedProviders } from './oembed'

const providers = new OEmbedProviders(require('../vendor/providers.json'))

const RDF_VALID_NAME_START_CHAR_RANGE = 'A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6' +
  '\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F' +
  '\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u10000-\uEFFFF'

const RDF_NAME_START_CHAR_REGEXP = new RegExp(`^[${RDF_VALID_NAME_START_CHAR_RANGE}]$`)

const RDF_NAME_CHAR_REGEXP = new RegExp(
  `^[${RDF_VALID_NAME_START_CHAR_RANGE}\\-\\.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$`
)

/**
 * Keep track of vocabulary prefixes.
 */
export const KNOWN_VOCABULARIES: { [prefix: string]: string } = {
  // https://www.w3.org/2011/rdfa-context/rdfa-1.1.html
  csvw: 'http://www.w3.org/ns/csvw#',
  dcat: 'http://www.w3.org/ns/dcat#',
  qb: 'http://purl.org/linked-data/cube#',
  grddl: 'http://www.w3.org/2003/g/data-view#',
  ma: 'http://www.w3.org/ns/ma-ont#',
  org: 'http://www.w3.org/ns/org#',
  owl: 'http://www.w3.org/2002/07/owl#',
  prov: 'http://www.w3.org/ns/prov#',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfa: 'http://www.w3.org/ns/rdfa#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  rif: 'http://www.w3.org/2007/rif#',
  rr: 'http://www.w3.org/ns/r2rml#',
  sd: 'http://www.w3.org/ns/sparql-service-description#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  skosxl: 'http://www.w3.org/2008/05/skos-xl#',
  wdr: 'http://www.w3.org/2007/05/powder#',
  void: 'http://rdfs.org/ns/void#',
  wdrs: 'http://www.w3.org/2007/05/powder-s#',
  xhv: 'http://www.w3.org/1999/xhtml/vocab#',
  xml: 'http://www.w3.org/XML/1998/namespace',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  cc: 'https://creativecommons.org/ns#',
  ctag: 'http://commontag.org/ns#',
  dc: 'http://purl.org/dc/terms/',
  dcterms: 'http://purl.org/dc/terms/',
  dc11: 'http://purl.org/dc/elements/1.1/',
  foaf: 'http://xmlns.com/foaf/0.1/',
  gr: 'http://purl.org/goodrelations/v1#',
  ical: 'http://www.w3.org/2002/12/cal/icaltzd#',
  og: 'http://ogp.me/ns#',
  rev: 'http://purl.org/stuff/rev#',
  sioc: 'http://rdfs.org/sioc/ns#',
  v: 'http://rdf.data-vocabulary.org/#',
  vcard: 'http://www.w3.org/2006/vcard/ns#',
  schema: 'http://schema.org/',
  // http://ogp.me/
  music: 'http://ogp.me/ns/music#',
  video: 'http://ogp.me/ns/video#',
  article: 'http://ogp.me/ns/article#',
  book: 'http://ogp.me/ns/book#',
  profile: 'http://ogp.me/ns/profile#',
  website: 'http://ogp.me/ns/website#',
  fb: 'http://ogp.me/ns/fb#'
}

interface JsonLdValue {
  '@value': string
  '@type'?: string
  '@language'?: string
}

export interface HtmlValueMap {
  [tagName: string]: (attrs: any, baseUrl: string) => string | undefined
}

/**
 * Grab the correct attribute for RDFa support.
 */
export const HTML_VALUE_MAP: HtmlValueMap = {
  meta (attrs) {
    return attrs.content
  },
  audio (attrs, baseUrl) {
    return attrs.src ? resolveUrl(baseUrl, attrs.src) : undefined
  },
  a (attrs, baseUrl) {
    return attrs.href ? resolveUrl(baseUrl, attrs.href) : undefined
  },
  object (attrs, baseUrl) {
    return attrs.data ? resolveUrl(baseUrl, attrs.data) : undefined
  },
  time (attrs) {
    return attrs.datetime
  },
  data (attrs) {
    return attrs.value
  }
}

HTML_VALUE_MAP['embed'] = HTML_VALUE_MAP['audio']
HTML_VALUE_MAP['iframe'] = HTML_VALUE_MAP['audio']
HTML_VALUE_MAP['img'] = HTML_VALUE_MAP['audio']
HTML_VALUE_MAP['source'] = HTML_VALUE_MAP['audio']
HTML_VALUE_MAP['track'] = HTML_VALUE_MAP['audio']
HTML_VALUE_MAP['video'] = HTML_VALUE_MAP['audio']
HTML_VALUE_MAP['area'] = HTML_VALUE_MAP['a']
HTML_VALUE_MAP['link'] = HTML_VALUE_MAP['a']
HTML_VALUE_MAP['meter'] = HTML_VALUE_MAP['data']

export interface HandlerContext {
  tagName: string
  text: string
  flags: number
  attributes: { [key: string]: string }
  rdfaTextProperty?: string[]
  microdataTextProperty?: string[]
}

export const HandlerFlags = {
  hasLang: (1 << 0),
  rdfaLink: (1 << 1),
  rdfaNode: (1 << 2),
  rdfaVocab: (1 << 3),
  microdataNode: (1 << 4),
  microdataVocab: (1 << 5),
  microdataScope: (1 << 6)
}

export interface ResultTwitter {
  card?: string
  site?: string
  'site:id'?: string
  creator?: string
  'creator:id'?: string
  description?: string
  title?: string
  image?: string
  'image:alt'?: string
  player?: string
  'player:width'?: string
  'player:height'?: string
  'player:stream'?: string
  'app:name:iphone'?: string
  'app:id:iphone'?: string
  'app:url:iphone'?: string
  'app:name:ipad'?: string
  'app:id:ipad'?: string
  'app:url:ipad'?: string
  'app:name:googleplay'?: string
  'app:id:googleplay'?: string
  'app:url:googleplay'?: string
  [key: string]: string | undefined
}

export interface ResultDublinCore {
  title?: string
  date?: string // Date
  'date.issued'?: string // Date
  'date.modified'?: string // Date
  [key: string]: string | undefined
}

export interface ResultSailthru {
  title?: string
  description?: string
  author?: string
  tags?: string // "*,*,..."
  date?: string // Date
  expire_date?: string
  'image.full'?: string
  'image.thumb'?: string
  location?: string // "lat,long"
  price?: string // number
  [key: string]: string | undefined
}

export interface ResultJsonLd {
  [key: string]: any
}

export interface ResultApplinks {
  'ios:url'?: string
  'ios:app_store_id'?: string
  'ios:app_name'?: string
  'iphone:url'?: string
  'iphone:app_store_id'?: string
  'iphone:app_name'?: string
  'ipad:url'?: string
  'ipad:app_store_id'?: string
  'ipad:app_name'?: string
  'android:url'?: string
  'android:package'?: string
  'android:class'?: string
  'android:app_name'?: string
  'windows_phone:url'?: string
  'windows_phone:app_id'?: string
  'windows_phone:app_name'?: string
  'windows:url'?: string
  'windows:app_id'?: string
  'windows:app_name'?: string
  'windows_universal:url'?: string
  'windows_universal:app_id'?: string
  'windows_universal:app_name'?: string
  'web:url'?: string
  'web:should_fallback'?: string
  [key: string]: string | undefined
}

export interface ResultHtml {
  date?: string // Date
  keywords?: string // "*,*,..."
  author?: string
  description?: string
  language?: string
  generator?: string
  creator?: string
  publisher?: string
  robots?: string
  viewport?: string
  'application-name'?: string
  'apple-mobile-web-app-title'?: string
  title?: string
  canonical?: string
  amphtml?: string
  pingback?: string
  [key: string]: string | undefined
}

export interface Alternative {
  type: string
  href: string
  title?: string
  media?: string
  hreflang?: string
}

export interface Icon {
  type?: string
  sizes?: string
  href: string
}

export interface Link {
  href: string
  text: string
  download: boolean
  hreflang?: string
  rel?: string
  type?: string
  target?: string
}

export interface Image {
  src: string
  alt?: string
  longdesc?: string
  sizes?: string[]
  srcset?: string[]
}

export interface Result {
  alternate: Array<Alternative>
  icons: Array<Icon>
  links: Array<Link>
  images: Array<Image>
  jsonld?: ResultJsonLd | ResultJsonLd[]
  rdfa?: ResultJsonLd
  microdata?: ResultJsonLd
  applinks?: ResultApplinks
  twitter?: ResultTwitter
  dublincore?: ResultDublinCore
  sailthru?: ResultSailthru
  html?: ResultHtml
}

export interface Options {
  url: string
}

export class Handler {

  protected result: Result = { alternate: [], icons: [], links: [], images: [] }
  protected contexts: HandlerContext[] = [{ tagName: '', text: '', flags: 0, attributes: {} }]
  protected langs: string[] = []

  private _rdfa: any = {}
  private _rdfaNodes: any[] = [{}]
  private _rdfaVocabs: string[] = []
  private _rdfaRels: Array<{ links: string[], used: boolean }> = []

  private _microdata: any = {}
  private _microdataRefs: any = {}
  private _microdataScopes: string[][] = [[]]
  private _microdataNodes: any[] = [{}]

  constructor (
    protected callback: (err: Error | null, result: Result) => void,
    protected options: Options
  ) {}

  onend () {
    const oembedProvider = providers.match(this.options.url)

    // Add the known OEmbed provider when discovered externally.
    if (oembedProvider && !this.result.alternate.some(x => x.type === oembedProvider.type)) {
      this.result.alternate.push(oembedProvider)
    }

    this.callback(null, this.result)
  }

  onerror (error: Error) {
    this.callback(error, this.result)
  }

  onopentag (tagName: string, attributes: { [attribute: string]: string }) {
    const context: HandlerContext = { tagName, text: '', flags: 0, attributes }

    this.contexts.push(context)

    // HTML attributes.
    const relAttr = normalize(attributes['rel'])
    const srcAttr = normalize(attributes['src'])
    const hrefAttr = normalize(attributes['href'])
    const langAttr = normalize(attributes['lang'])

    // RDFa attributes.
    const propertyAttr = normalize(attributes['property'])
    const vocabAttr = normalize(attributes['vocab'])
    const prefixAttr = normalize(attributes['prefix'])
    const resourceAttr = normalize(attributes['resource'])
    const typeOfAttr = normalize(attributes['typeof'])
    const aboutAttr = normalize(attributes['about'])

    // Microdata attributes.
    const idAttr = normalize(attributes['id'])
    const itempropAttr = normalize(attributes['itemprop'])
    const itemidAttr = normalize(attributes['itemid'])
    const itemtypeAttr = normalize(attributes['itemtype'])
    const itemrefAttr = normalize(attributes['itemref'])

    // Push the language onto the stack.
    if (langAttr) {
      this.langs.push(langAttr)
      context.flags = context.flags | HandlerFlags.hasLang
    }

    // Store `id` references for later (microdata itemrefs).
    if (idAttr && !this._microdataRefs.hasOwnProperty(idAttr)) {
      this._microdataRefs[idAttr] = {}
    }

    // Microdata item.
    if (attributes.hasOwnProperty('itemscope')) {
      const newNode: any = {}

      // Copy item reference data.
      if (itemrefAttr) {
        const refs = split(itemrefAttr)

        for (const ref of refs) {
          // Set microdata id reference when it doesn't already exist.
          if (this._microdataRefs[ref] != null) {
            assignJsonldProperties(newNode, this._microdataRefs[ref])
          }

          this._microdataRefs[ref] = newNode
        }
      }

      // Set child scopes on the root scope.
      if (itempropAttr) {
        const id = normalize(context.attributes['id'])
        this._addMicrodataProperty(last(this._microdataNodes), id, split(itempropAttr), newNode)
      } else {
        this.result.microdata = this._microdata
        pushToGraph(this._microdata, newNode)
        this._microdataScopes.push([])
        context.flags = context.flags | HandlerFlags.microdataScope
      }

      // Push the new node as the current scope.
      this._microdataNodes.push(newNode)
      context.flags = context.flags | HandlerFlags.microdataNode
    }

    // Microdata `itemprop=""`.
    if (itempropAttr && !(context.flags & HandlerFlags.microdataNode)) {
      const value = getValueMap(this.options.url, tagName, attributes)
      const props = split(itempropAttr)

      if (value != null) {
        this._addMicrodataProperty(
          last(this._microdataNodes),
          normalize(context.attributes['id']),
          props,
          normalizeJsonLdValue({
            '@value': value,
            '@language': last(this.langs)
          })
        )
      } else {
        context.microdataTextProperty = props
      }
    }

    // Microdata `itemid=""`.
    if (itemidAttr) {
      const id = normalize(context.attributes['id'])

      this._setMicrodataProperty(last(this._microdataNodes), id, '@id', itemidAttr)
    }

    // Microdata `itemtype=""`.
    if (itemtypeAttr) {
      const [vocab, type] = splitItemtype(itemtypeAttr)
      const vocabs = last(this._microdataScopes)
      const id = normalize(context.attributes['id'])

      if (type && vocab !== last(vocabs)) {
        setContext(last(this._microdataNodes), '@vocab', vocab)

        vocabs.push(vocab)
        context.flags = context.flags | HandlerFlags.microdataVocab
      }

      this._addMicrodataProperty(last(this._microdataNodes), id, '@type', type || itemtypeAttr)
    }

    // RDFa `vocab=""`.
    if (vocabAttr) {
      setContext(last(this._rdfaNodes), '@vocab', vocabAttr)
      this._rdfaVocabs.push(vocabAttr)
      context.flags = context.flags | HandlerFlags.rdfaVocab
    }

    // RDFa `prefix=""`.
    if (prefixAttr) {
      const parts = split(prefixAttr)

      for (let i = 0; i < parts.length; i += 2) {
        const name = parts[i]
        const value = parts[i + 1]
        const prefix = name.slice(0, -1)

        // Detect a valid prefix.
        if (name.charAt(name.length - 1) !== ':' || !isValidName(prefix)) {
          continue
        }

        setContext(this._rdfa, prefix, value)
      }
    }

    // RDFa `rel=""`. Additional care is taken to avoid extranuous output with HTML `rel` attributes.
    if (relAttr) {
      const links = this._normalizeRdfaProperty(relAttr)

      if (links.length) {
        this._rdfaRels.push({ links, used: false })
        context.flags = context.flags | HandlerFlags.rdfaLink
      }
    }

    // Handle RDFa rel chaining.
    if (this._rdfaRels.length) {
      const rel = last(this._rdfaRels)

      if (!rel.used) {
        const validRelId = resourceAttr || hrefAttr || srcAttr

        if (validRelId) {
          const newNode: any = { '@id': validRelId }

          rel.used = true
          this._addRdfaProperty(last(this._rdfaNodes), rel.links, newNode)

          if (resourceAttr && !(context.flags & HandlerFlags.rdfaNode)) {
            this._rdfaNodes.push(newNode)
            context.flags = context.flags | HandlerFlags.rdfaNode
          }
        }

        // Support property chaining with `rel`.
        if (!(context.flags & HandlerFlags.rdfaLink) && (propertyAttr || typeOfAttr)) {
          rel.used = true

          if (!(context.flags & HandlerFlags.rdfaNode)) {
            const newNode: any = {}
            this._rdfaNodes.push(newNode)
            this._addRdfaProperty(last(this._rdfaNodes), rel.links, newNode)
            context.flags = context.flags | HandlerFlags.rdfaNode
          }
        }
      }
    }

    // RDFa `about=""`.
    if (aboutAttr) {
      this._rdfaNodes.push(this._createRdfaResource(aboutAttr))
      context.flags = context.flags | HandlerFlags.rdfaNode
    }

    // RDFa `property=""`.
    if (propertyAttr) {
      const value = getValueMap(this.options.url, tagName, attributes)
      const properties = this._normalizeRdfaProperty(propertyAttr)

      if (value != null) {
        this._addRdfaProperty(
          last(this._rdfaNodes),
          properties,
          normalizeJsonLdValue({
            '@value': value,
            '@language': last(this.langs),
            '@type': normalize(attributes['datatype'])
          })
        )
      } else {
        if ((typeOfAttr || resourceAttr) && !(context.flags & HandlerFlags.rdfaLink)) {
          const newNode: any = {}

          if (resourceAttr) {
            newNode['@id'] = resourceAttr
          }

          this._addRdfaProperty(last(this._rdfaNodes), properties, newNode)

          if (typeOfAttr && !(context.flags & HandlerFlags.rdfaNode)) {
            this._rdfaNodes.push(newNode)
            context.flags = context.flags | HandlerFlags.rdfaNode
          }
        } else {
          context.rdfaTextProperty = properties
        }
      }
    }

    // RDFa `resource=""`.
    if (resourceAttr && !propertyAttr && !relAttr && !aboutAttr) {
      this._rdfaNodes.push(this._createRdfaResource(resourceAttr))
      context.flags = context.flags | HandlerFlags.rdfaNode
    }

    // RDFa `typeof=""`.
    if (typeOfAttr) {
      // Standalone `typeof` attribute should be treated as a blank resource.
      if (!this._rdfaRels.length && !propertyAttr && !relAttr && !resourceAttr && !aboutAttr) {
        this._rdfaNodes.push(this._createRdfaResource())
        context.flags = context.flags | HandlerFlags.rdfaNode
      }

      this._addRdfaProperty(last(this._rdfaNodes), '@type', split(typeOfAttr))
    }

    // Handle meta properties (E.g. HTML, Twitter cards, etc).
    if (tagName === 'meta') {
      const nameAttr = normalize(attributes['name'])
      const contentAttr = normalize(attributes['content'])

      // Catch some bad implementations of Twitter metadata.
      if (propertyAttr && contentAttr) {
        if (/^twitter:/.test(propertyAttr)) {
          set(this.result, ['twitter', propertyAttr.substr(8)], contentAttr)
        } else if (/^al:/.test(propertyAttr)) {
          set(this.result, ['applinks', propertyAttr.substr(3)], contentAttr)
        }
      }

      // It's possible someone will do `<meta name="" property="" content="" />`.
      if (nameAttr && contentAttr) {
        const name = nameAttr.toLowerCase()

        /**
         * - Twitter
         * - Dublin Core
         * - Sailthru
         * - HTML
         */
        if (/^twitter:/.test(name)) {
          set(this.result, ['twitter', name.substr(8)], contentAttr)
        } else if (/^dc\./.test(name)) {
          set(this.result, ['dublincore', name.substr(3)], contentAttr)
        } else if (/^dcterms\./.test(name)) {
          set(this.result, ['dublincore', name.substr(8)], contentAttr)
        } else if (/^sailthru\./.test(name)) {
          set(this.result, ['sailthru', name.substr(9)], contentAttr)
        } else if (
          name === 'date' ||
          name === 'keywords' ||
          name === 'author' ||
          name === 'description' ||
          name === 'language' ||
          name === 'generator' ||
          name === 'creator' ||
          name === 'publisher' ||
          name === 'robots' ||
          name === 'viewport' ||
          name === 'application-name' ||
          name === 'apple-mobile-web-app-title'
        ) {
          set(this.result, ['html', name], contentAttr)
        }
      }
    }

    // Detect external metadata opporunities (E.g. OEmbed).
    if (tagName === 'link') {
      if (relAttr && hrefAttr) {
        const rels = split(relAttr)

        for (const rel of rels) {
          const typeAttr = normalize(attributes['type'])

          if (rel === 'canonical' || rel === 'amphtml' || rel === 'pingback') {
            set(this.result, ['html', rel], resolveUrl(this.options.url, hrefAttr))
          } else if (rel === 'alternate') {
            const mediaAttr = normalize(attributes['media'])
            const hreflangAttr = normalize(attributes['hreflang'])

            if (typeAttr || mediaAttr || hreflangAttr) {
              appendAndDedupe(this.result.alternate, ['type', 'hreflang', 'media', 'href'], {
                type: typeAttr || 'text/html',
                media: mediaAttr,
                hreflang: hreflangAttr,
                title: normalize(attributes['title']),
                href: resolveUrl(this.options.url, hrefAttr)
              })
            }
          } else if (rel === 'meta') {
            appendAndDedupe(this.result.alternate, ['type'], {
              type: typeAttr || 'application/rdf+xml',
              href: resolveUrl(this.options.url, hrefAttr)
            })
          } else if (rel === 'icon') {
            appendAndDedupe(this.result.icons, ['href'], {
              type: typeAttr,
              sizes: normalize(attributes['sizes']),
              href: resolveUrl(this.options.url, hrefAttr)
            })
          }
        }
      }
    }
  }

  ontext (value: string) {
    last(this.contexts).text += value
  }

  onclosetag () {
    const prevContext = this.contexts.pop() as HandlerContext
    const currentContext = last(this.contexts)
    const text = normalize(prevContext.text)

    if (prevContext.flags) {
      // This context created a new node.
      if (prevContext.flags & HandlerFlags.microdataNode) {
        this._microdataNodes.pop()
      }

      // This context used a new vocabulary.
      if (prevContext.flags & HandlerFlags.microdataVocab) {
        last(this._microdataScopes).pop()
      }

      // This context created a new scope altogether.
      if (prevContext.flags & HandlerFlags.microdataScope) {
        this._microdataScopes.pop()
      }

      // This context created a new node.
      if (prevContext.flags & HandlerFlags.rdfaNode) {
        this._rdfaNodes.pop()
      }

      // This context used a vocabulary.
      if (prevContext.flags & HandlerFlags.rdfaVocab) {
        this._rdfaVocabs.pop()
      }

      // This context used an RDFa link (E.g. `rel=""`).
      if (prevContext.flags & HandlerFlags.rdfaLink) {
        this._rdfaRels.pop()
      }

      // This context used language property (E.g. `lang=""`).
      if (prevContext.flags & HandlerFlags.hasLang) {
        this.langs.pop()
      }
    }

    // Handle parsing significant script elements.
    if (prevContext.tagName === 'script') {
      const type = normalize(prevContext.attributes['type'])

      if (type === 'application/ld+json') {
        try {
          const jsonld = JSON.parse(prevContext.text)

          this.result.jsonld = jsonld
        } catch (e) { /* Ignore. */ }
      }

      return
    }

    if (prevContext.tagName === 'a') {
      const text = normalize(prevContext.text)
      const href = normalize(prevContext.attributes['href'])

      if (text && href) {
        const download = prevContext.attributes.hasOwnProperty('download')
        const target = normalize(prevContext.attributes['target'])
        const hreflang = normalize(prevContext.attributes['hreflang'])
        const type = normalize(prevContext.attributes['type'])
        const rel = normalize(prevContext.attributes['rel'])

        this.result.links.push({
          href: resolveUrl(this.options.url, href),
          text,
          download,
          target,
          hreflang,
          type,
          rel
        })
      }
    }

    if (prevContext.tagName === 'img') {
      const src = normalize(prevContext.attributes['src'])

      if (src) {
        const alt = normalize(prevContext.attributes['alt'])
        const longdesc = normalize(prevContext.attributes['longdesc'])
        const sizes = normalize(prevContext.attributes['sizes'])
        const srcset = normalize(prevContext.attributes['srcset'])

        this.result.images.push({
          src,
          alt,
          longdesc,
          sizes: typeof sizes === 'string' ? sizes.split(/\s*,\s*/) : undefined,
          srcset: typeof srcset === 'string' ? srcset.split(/\s*,\s*/) : undefined
        })
      }
    }

    // Push the previous context text onto the current context.
    currentContext.text += prevContext.text

    if (text) {
      const schemaValue = normalizeJsonLdValue({
        '@value': text,
        '@language': last(this.langs)
      })

      // Set RDFa to text value.
      if (prevContext.rdfaTextProperty) {
        this._addRdfaProperty(last(this._rdfaNodes), prevContext.rdfaTextProperty, schemaValue)
      }

      // Set microdata to text value.
      if (prevContext.microdataTextProperty) {
        this._addMicrodataProperty(
          last(this._microdataNodes),
          normalize(prevContext.attributes['id']),
          prevContext.microdataTextProperty,
          schemaValue
        )
      }

      if (prevContext.tagName === 'title') {
        set(this.result, ['html', 'title'], text)
      }
    }
  }

  /**
   * Add a microdata property, with support for `id` references (used via `itemref`).
   */
  private _addMicrodataProperty (node: any, id: string | undefined, itemprop: string | string[], value: any) {
    addJsonldProperty(node, itemprop, value)

    if (id && this._microdataRefs.hasOwnProperty(id)) {
      addJsonldProperty(this._microdataRefs[id], itemprop, value)
    }

    if (!this._microdata.hasOwnProperty('@graph')) {
      this.result.microdata = this._microdata
      pushToGraph(this._microdata, node)
    }
  }

  /**
   * Set a microdata property.
   */
  private _setMicrodataProperty (node: any, id: string | undefined, key: string, value: any) {
    node[key] = value

    if (id && this._microdataRefs.hasOwnProperty(id)) {
      this._microdataRefs[id][key] = value
    }
  }

  /**
   * Add an RDFa property to the node.
   */
  private _addRdfaProperty (node: any, property: string | string[], value: any) {
    addJsonldProperty(node, property, value)

    if (!this._rdfa.hasOwnProperty('@graph')) {
      this.result.rdfa = this._rdfa
      pushToGraph(this._rdfa, node)
    }
  }

  /**
   * Correct known prefixes in the context.
   */
  private _normalizeRdfaProperty (propertyList: string) {
    const properties: string[] = []

    for (const property of split(propertyList)) {
      const prefix = getPrefix(property)

      if (prefix) {
        if (!this._rdfa.hasOwnProperty('@context') || !this._rdfa['@context'].hasOwnProperty(prefix)) {
          if (KNOWN_VOCABULARIES.hasOwnProperty(prefix)) {
            setContext(this._rdfa, prefix, KNOWN_VOCABULARIES[prefix])
          }
        }
      } else {
        if (this._rdfaVocabs.length === 0) {
          continue // Omit relative properties when no vocabulary is used.
        }
      }

      properties.push(property)
    }

    return properties
  }

  /**
   * Create an RDFa resource.
   */
  private _createRdfaResource (id?: string) {
    if (id && this._rdfa.hasOwnProperty('@graph')) {
      for (const item of this._rdfa['@graph']) {
        if (item['@id'] === id) {
          return item
        }
      }
    }

    const node: any = {}
    if (id) { node['@id'] = id }
    this.result.rdfa = this._rdfa
    pushToGraph(this._rdfa, node)
    return node
  }

}

/**
 * Push a value into a JSON-LD graph.
 */
function pushToGraph (node: any, value: any) {
  node['@graph'] = node['@graph'] || []
  node['@graph'].push(value)
}

/**
 * Set a value to the node context.
 */
function setContext (node: any, key: string, value: string) {
  node['@context'] = node['@context'] || {}
  node['@context'][key] = value
}

/**
 * Normalize a HTML value, trimming and removing whitespace.
 */
function normalize (value?: string): string | undefined {
  return value == null ? undefined : value.trim().replace(/\s+/g, ' ')
}

/**
 * Set an object property.
 */
function addJsonldProperty (obj: any, key: string | string[], value: any) {
  // Skip empty keys.
  if (!key) {
    return
  }

  if (Array.isArray(key)) {
    for (const k of key) {
      addJsonldProperty(obj, k, value)
    }
  } else {
    obj[key] = merge(obj[key], value)
  }
}

/**
 * Merge properties together using regular "set" algorithm.
 */
function assignJsonldProperties (obj: any, values: any) {
  for (const key of Object.keys(values)) {
    addJsonldProperty(obj, key, values[key])
  }
}

/**
 * Get the last element in a stack.
 */
function last <T> (arr: T[]): T {
  return arr[arr.length - 1]
}

/**
 * Grab the semantic value from HTML.
 */
function getValueMap (url: string, tagName: string, attributes: any) {
  const value = normalize(attributes.content)

  if (!value && HTML_VALUE_MAP.hasOwnProperty(tagName)) {
    return normalize(HTML_VALUE_MAP[tagName](attributes, url))
  }

  return value
}

/**
 * Merge values together.
 */
function merge <T> (left: undefined | T | T[], right: T | T[]): T | T[] {
  const result = (Array.isArray(left) ? left : (left == null ? [] : [left])).concat(right)

  return result.length > 1 ? result : result[0]
}

/**
 * Check if a prefix is valid.
 */
function isValidName (value: string) {
  return value.length > 1 &&
    RDF_NAME_START_CHAR_REGEXP.test(value.charAt(0)) &&
    RDF_NAME_CHAR_REGEXP.test(value.substr(1))
}

/**
 * Extract the prefix from compact IRIs.
 */
function getPrefix (value: string) {
  const indexOf = value.indexOf(':')

  if (indexOf === -1) {
    return
  }

  if (value.charAt(indexOf + 1) === '/' && value.charAt(indexOf + 2) === '/') {
    return
  }

  return value.substr(0, indexOf)
}

/**
 * Split a space-separated string.
 */
function split (value: string) {
  return value.split(/\s+/g)
}

/**
 * Split an `itemtype` microdata property for `@vocab`.
 */
function splitItemtype (value: string) {
  const hashIndexOf = value.lastIndexOf('#')
  const slashIndexOf = value.lastIndexOf('/')

  if (hashIndexOf > -1) {
    return [value.substr(0, hashIndexOf + 1), value.substr(hashIndexOf + 1)]
  }

  if (slashIndexOf > -1) {
    return [value.substr(0, slashIndexOf + 1), value.substr(slashIndexOf + 1)]
  }

  return [value, '']
}

/**
 * Simplify a JSON-LD value for putting into the graph.
 */
function normalizeJsonLdValue (value: JsonLdValue): string | JsonLdValue {
  if (value['@type'] || value['@language']) {
    const result: JsonLdValue = {
      '@value': value['@value']
    }

    if (value['@type']) {
      result['@type'] = value['@type']
    } else if (value['@language']) {
      result['@language'] = value['@language']
    }

    return result
  }

  return value['@value']
}

/**
 * Copy properties from `a` to `b`, when "defined".
 */
export function copy <T extends { [key: string]: any }> (a: T, b: T) {
  for (const prop of Object.keys(b)) {
    if (b[prop] != null) {
      a[prop] = b[prop]
    }
  }
}

/**
 * Append/merge a href entry to a list.
 */
function appendAndDedupe <T extends { href: string }> (list: T[], props: Array<keyof T>, value: T): void {
  for (const entry of list) {
    const matches = props.every(x => entry[x] === value[x])

    if (matches) {
      copy(entry, value)
      return
    }
  }

  list.push(value)
}
