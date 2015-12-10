/* eslint-env node, es6 */
/* eslint semi: [2, "never"] */

"use strict"

const fs = require("fs")
const path = require("path")

module.exports = {posts}

function posts() {
  return fs.readdirSync(__dirname)
    .filter(filename => filename.match(/^[a-z\-]+$/))
    .map(postBasename => ({
      basename: postBasename,
      path: path.join(__dirname, postBasename, `${postBasename}.md`)
    }))
    .map(post => Object.assign({}, post, {
      content: fs.readFileSync(post.path, "utf8")
    }))
    .map(post => Object.assign({}, post, {
      yfm: yfm(post.content)
    }))
}

function yfm(content) {
  const matcher = content.match(/^---\s+title: (.*)\s+date: ([\d\-]+)T.+\s+.*\s+---\s+/)
  return {title: matcher[1], date: matcher[2]}
}
