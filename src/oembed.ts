export interface MatchResult {
  type: string
  href: string
}

/**
 * Create a matcher for a provider.
 */
export class OEmbedMatch {

  routes: Array<{ matches: RegExp[], url: string, formats?: string[] }> = []

  constructor (provider: Provider) {
    for (const endpoint of provider.endpoints) {
      if (typeof endpoint.url === 'string') {
        this.routes.push({
          matches: Array.isArray(endpoint.schemes) ?
            endpoint.schemes.map(x => this.schemeToRegExp(x)) :
            [this.urlToRegExp(provider.provider_url)],
          url: endpoint.url.replace(/\?.*$/, ''),
          formats: endpoint.formats
        })
      }
    }
  }

  schemeToRegExp (scheme: string) {
    return new RegExp(`^${this.escapeRegExp(scheme)}$`)
  }

  urlToRegExp (url: string) {
    return new RegExp(`^${this.escapeRegExp(url)}`)
  }

  escapeRegExp (str: string) {
    return str
      .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
      .replace(/^http:/, 'https?:')
      .replace(/\\\*/, '.+')
  }

  match (url: string): MatchResult | undefined {
    for (const route of this.routes) {
      for (const match of route.matches) {
        if (match.test(url)) {
          return this.formatResult(route.url, url, route.formats)
        }
      }
    }

    return
  }

  formatResult (oembedUrl: string, url: string, formats?: string[]): MatchResult {
    const type = formats === undefined ? 'json' : (formats.indexOf('json') > -1 ? 'json' : formats[0])

    return {
      href: `${oembedUrl}?type=${encodeURIComponent(type)}&url=${encodeURIComponent(url)}`,
      type: `application/${type}+oembed`
    }
  }

}

export interface Provider {
  provider_name: string
  provider_url: string
  endpoints: Array<{
    url?: string
    schemes?: string[]
    discovery?: boolean
    formats?: string[]
  }>
}

/**
 * Find a matching provider.
 */
export class OEmbedProviders {

  matchers: OEmbedMatch[] = []

  constructor (providers: Provider[]) {
    for (const provider of providers) {
      this.add(provider)
    }
  }

  add (provider: Provider) {
    this.matchers.push(new OEmbedMatch(provider))
  }

  match (url: string) {
    for (const matcher of this.matchers) {
      const res = matcher.match(url)

      if (res) {
        return res
      }
    }

    return
  }

}
