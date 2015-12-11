/* eslint-env node, es6 */
/* eslint semi: [2, "never"] */

"use strict"

const fs = require("fs")
const path = require("path")
const utils = require("./utils")

const indexFilePath = path.join(__dirname, "README.md")

const renderIndex = postList => `
# Hugo Wood's personal blog

## Posts

${postList}

## License

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">
  <img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" />
</a>
<br />
This work is licensed under a
<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">
  Creative Commons Attribution-ShareAlike 4.0 International License
</a>.
`

fs.writeFileSync(indexFilePath, renderIndex(
  utils.posts()
    .map(post => `- ${post.yfm.date}: [${post.yfm.title}](${post.basename}/${post.basename}.md)`)
    .join("\n")))
