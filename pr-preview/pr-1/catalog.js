/*
 * The list of every tool in this repo. The home page (index.html) reads it.
 * To add a tool, add one entry to `catalog` (see docs/adding-a-tool.md).
 *
 * Entry fields:
 *   id           folder name of the tool (kebab-case, unique)
 *   title        name shown on the home page
 *   description  one or two sentences, written for a parent
 *   path         link to the tool's index.html, relative to this file
 *   subject      one of the subject ids below
 *   topic        topic folder name (kebab-case)
 *   ages         [youngest, oldest] in years
 *   skills       short phrases for what it practices
 *   added        date added, YYYY-MM-DD
 */
window.EduTools = window.EduTools || {};

window.EduTools.subjects = [
  { id: 'math',           title: 'Math',           color: '#3e63dd' },
  { id: 'reading',        title: 'Reading',        color: '#e5484d' },
  { id: 'writing',        title: 'Writing',        color: '#8e4ec6' },
  { id: 'science',        title: 'Science',        color: '#30a46c' },
  { id: 'social-studies', title: 'Social Studies', color: '#f76b15' },
  { id: 'languages',      title: 'Languages',      color: '#12a594' },
  { id: 'arts',           title: 'Arts',           color: '#d6409f' },
  { id: 'music',          title: 'Music',          color: '#0d74ce' },
  { id: 'life-skills',    title: 'Life Skills',    color: '#ad7f58' },
  { id: 'technology',     title: 'Technology',     color: '#5b5bd6' }
];

window.EduTools.catalog = [
  {
    id: 'number-pattern-lights',
    title: 'Number Pattern Lights',
    description: 'Tap 1 to 10 and every number that ends the same way lights up, all the way to 110. Helps with counting to 20 and the teen numbers.',
    path: 'tools/math/counting/number-pattern-lights/index.html',
    subject: 'math',
    topic: 'counting',
    ages: [3, 6],
    skills: ['Counting to 20', 'Teen numbers', 'Number patterns'],
    added: '2026-09-24'
  }
];
