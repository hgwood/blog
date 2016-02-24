/* eslint-env node, es6 */
/* eslint semi: [2, "never"] */

"use strict"

const fs = require("fs")
const path = require("path")
const minstache = require("minstache")
const utils = require("./utils")


const indexFilePath = path.join(__dirname, "README.md")

const renderIndex = postList => minstache(fs.readFileSync("README.mustache.md", "utf8"), {postList})

fs.writeFileSync(indexFilePath, renderIndex(
  utils.posts()
    .map(post => `- ${post.yfm.date}: [${post.yfm.title}](${post.basename}/${post.basename}.md)`)
    .sort()
    .reverse()
    .join("\n")))
