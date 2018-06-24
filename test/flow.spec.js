const htmlparser = require('htmlparser2')
const thenify = require('thenify')
const readFile = thenify(require('fs').readFile)
const readdirSync = require('fs').readdirSync
const join = require('path').join

const metaparser = require('../')
const FIXTURE_DIR = join(__dirname, '../test/fixtures')
const fixtures = readdirSync(FIXTURE_DIR)

describe('htmlmetaparser', function () {
  fixtures.forEach(function (name) {
    it(name, function () {
      return Promise.all([
        readFile(join(FIXTURE_DIR, name, 'body.html'), 'utf8'),
        readFile(join(FIXTURE_DIR, name, 'meta.json'), 'utf8').then(JSON.parse)
      ])
        .then(function (inputs) {
          const handler = new metaparser.Handler(
            function (err, result) {
              expect(err).toBeNull()
              expect(result).toMatchSnapshot()
            },
            {
              url: inputs[1].url
            }
          )

          const parser = new htmlparser.Parser(handler, { decodeEntities: true })
          parser.write(inputs[0])
          parser.done()
        })
    })
  })
})
