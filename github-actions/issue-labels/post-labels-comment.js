// Importing modules
var fs = require("fs")

// Global variables
var github
var context

/**
 * Formats the commandline instructions into a template, then posts it to the pull request.
 * @param {Object} g - github object  
 * @param {Object} c - context object 
 * @param {Boolean} actionResult - 
 * @param {Array} addedLabels -
 */

function main({ g, c }, { actionResult, addedLabels }) {
  github = g
  context = c
  console.log('result: ', actionResult)
  console.log('added labels: ', addedLabels)
}

module.exports = main