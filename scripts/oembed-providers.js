const thenify = require('thenify')
const popsicle = require('popsicle')
const writeFile = thenify(require('fs').writeFile)
const join = require('path').join

popsicle.request('http://oembed.com/providers.json')
  .then(res => {
    const data = JSON.stringify(JSON.parse(res.body), null, 2)

    return writeFile(join(__dirname, '../vendor/providers.json'), data)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
