/* eslint-env node, es6 */
/* eslint semi: [2, "never"] */

"use strict"

const fs = require("fs")
const path = require("path")
const utils = require("./utils")

const indexFilePath = path.join(__dirname, "README.md")

fs.writeFileSync(indexFilePath,
  utils.posts()
    .map(post => `- ${post.yfm.date}: [${post.yfm.title}](${post.basename}/${post.basename}.md)`)
    .join("\n"))
