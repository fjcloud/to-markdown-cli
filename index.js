#!/usr/bin/env node

const writeOut = require('./lib/write-out.js');

/* eslint no-undefined: "off" */
// @ts-ignore
const fs = require('fs');
// @ts-ignore
const path = require('path');

const program = require('commander');

const TurndownService = require('turndown');
const turndownPluginGfm = require('turndown-plugin-gfm');
const clipboardy = require('clipboardy');

const turndownService = new TurndownService();
const gfm = turndownPluginGfm.gfm;

// @ts-ignore
const pkg = require('./package.json');

let inPath = null;
let outPath = null;
// let toStdout = true;
let data = '';

function parseInPath (val) {
  // @ts-ignore
  if (fs.existsSync(path.resolve(process.cwd(), val))) {
    inPath = val;
  } else {
    process.stderr.write('the specified file path for the input file does not exist\n');
    // process.exit(1);
  }
}

function parseOutPath (val) {
  outPath = val;
}

function output() {
  if (program.output !== undefined) {
    // @ts-ignore
    writeOut(outPath, turndownService.turndown(data));

  } else {
    // @ts-ignore
    process.stdout.write(`${turndownService.turndown(data)}\n`);
  }
}

program
  .version(pkg.version)
  .option('-i, --input <input>', 'path to the input file', parseInPath)
  .option('-o, --output <output>', 'path to the output file', parseOutPath)
  .option('-c, --clipboard', 'use only the clipboard for input and output')
  .option('-g, --gfm', 'use GitHub Flavored Markdown');

program.on('--help', () => {
  process.stdout.write('\n');
  process.stdout.write('    html2md turns html into markdown\n');
  process.stdout.write('    if no input file is given it ueses the clipboard content\n');
  process.stdout.write('    if no output file is given it logs the result to stdout\n');
  process.stdout.write('\n');
  process.stdout.write('    Optional Options:\n');
  process.stdout.write('        -i, --input <input> path to the input file\n');
  process.stdout.write('        -o, --output <output> path to the output file\n');
  process.stdout.write('        -c, --clipboard use the clipboard only. All other options will be dismissed\n');
  process.stdout.write('        -g, --gfm use GitHub Flavored Markdown\n');
  process.stdout.write('\n');
  process.stdout.write('    Examples:\n');
  process.stdout.write('        $ html2md -i ./foo.html # output to stdout\n');
  process.stdout.write('        $ html2md -i ./foo.html -o out.md # output to out.md\n');
  process.stdout.write('        $ html2md -o out.md # clipboard to out.md\n');
  process.stdout.write('        $ html2md -c # clipboard to clipboard\n');
  process.stdout.write('        $ html2md # clipboard to stdout\n');
  process.stdout.write('        $ html2md -g # clipboard to stdout using GitHub flavored markdown\n');

  process.stdout.write('\n');
  process.stdout.write('    Acknowledgments:\n');
  process.stdout.write('        Build on these great modules:\n');
  process.stdout.write('        - https://github.com/domchristie/turndown\n');
  process.stdout.write('        - https://github.com/sindresorhus/clipboardy\n');
  process.stdout.write('        - https://github.com/tj/commander.js\n');
  process.stdout.write('\n');
});
// @ts-ignore
if (process.stdin.isTTY) {
  program.parse(process.argv);

  if (program.gfm !== undefined) {
    turndownService.use(gfm);
  }
  if (program.clipboard !== undefined) {
    data = clipboardy.readSync();
    // @ts-ignore
    data = turndownService.turndown(data);
    clipboardy.writeSync(data);
    // @ts-ignore
    process.exit(0);
  }

  if (program.input !== undefined) {
    data = fs.readFileSync(inPath, 'utf8');
  } else {
    data = clipboardy.readSync();
  }
  output();
  // if (program.output !== undefined) {
  //   // @ts-ignore
  //   writeOut(outPath, turndownService.turndown(data));

  // } else {
  //   // @ts-ignore
  //   process.stdout.write(`${turndownService.turndown(data)}\n`);
  // }
} else {
  process.stdin.on('readable', function() {
    var chunk = this.read();
    if (chunk !== null) {
      data += chunk;
    }
  });
  process.stdin.on('end', function() {
    program.parse(process.argv);

    console.log(data);
  });
}
