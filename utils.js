/* eslint-env node, es6 */
/* eslint semi: [2, "never"] */

"use strict"

const fs = require("fs")
const path = require("path")

module.exports = {posts}

function posts() {
  return fs.readdirSync(__dirname)
    .filter(filename => filename.match(/^[a-z0-9\-]+$/))
    .map(postBasename => ({
      basename: postBasename,
      path: path.join(__dirname, postBasename, `${postBasename}.md`)
    }))
    .map(post => Object.assign({}, post, {
      content: fs.readFileSync(post.path, "utf8")
    }))
    .map(post => Object.assign({}, post, {
      yfm: yfm(post)
    }))
}

function yfm(post) {
  const matcher = post.content.match(/^---\s+title: (.*)\s+date: ([\d\-]+)(T\d\d:\d\d)?\s+---/)
  if (!matcher) throw new Error(`incorrect yfm in ${post.path}`)
  return {title: matcher[1], date: matcher[2]}
}
