import { keyCommands } from './Constants';

class Generator {

    constructor() {
        this.code = "";
    }

    get rules () {
        return {
            beforeAll: [
                `await page.goto('${this.initURL}');`
            ]
        }
    }

    get imports() {
        return [
            `const puppeteer = require('puppeteer');`,
            `const expect = require('expect.js');`
        ]
    }

    addImports() {
        this.code = this.imports.reduce((acc, curr) => `${acc}\n${curr}`, this.code);
    }

    addRulesInner(rules) {
        rules.forEach(rule => {
            this.code += rule + '\n';
        });
    }

    addRules() {
        for (var key in this.rules) {
            var rules = this.rules[key];
            switch (key) {
                case 'beforeAll':
                    this.code += `beforeAll(async () => {\n`;
                    this.addRulesInner(rules);
                    this.code += `});\n\n`;
                    break;
                case 'afterAll':
                    this.code += `afterAll(async () => {\n`;
                    this.addRulesInner(rules);
                    this.code += `});\n\n`;
                    break;
                case 'beforeEach':
                    this.code += `beforeEach(async () => {\n`;
                    this.addRulesInner(rules);
                    this.code += `};\n\n`;
                    break;
            }
        }
    }

    addCommand(command) {
        if (command && command.type) {
            switch (command.type) {
                case 'click':
                    this.code += `await page.click('${command.selector}');\n`;
                    break;
                case 'keydown':
                    if (keyCommands.includes(command.data)) {
                        this.code += `await page.keyboard.press('${command.data}');\n`;
                    } else {
                        this.code += `await page.type('${command.selector}', '${command.data}');\n`
                    }
                    break;
                case 'verify-text':
                    this.code += `var textContent = await page.$$eval('${command.selector}', el => el[0].textContent)\n`;
                    this.code += `var finalTextContent = textContent.trim();\n`;
                    this.code += `expect(finalTextContent).toBe('${command.data}');\n`;
                    break;
                case 'verify-dom':
                    this.code += `var elCount = await page.$$eval('${command.selector}', el => el.length);\n`
                    this.code += `expect(elCount).toBeGreaterThan(0);\n`;
                    break;
                case 'verify-link':
                    this.code += `var nodeLink = await page.$$eval('${command.selector}', el => el[0].href)\n`;
                    this.code += `expect(nodeLink).toBe('${command.data}');\n`;
                    break;
                case 'page-change':
                    this.code += `await page.waitForNavigation({ waitUntil: 'load' });\n`
                    break;
                case 'click-page-change':
                    this.code += `await Promise.all([\n`;
                    this.code += `page.click('${command.selector}'),\n`;
                    this.code += `page.waitForNavigation()\n]);\n`;
                    break;
            }
        }
    }

    addIt(description, commands) {
        this.code += `it('${description}', async () => {\n`;
        commands.forEach(command => {
            this.addCommand(command);
        });
        this.code += `});\n`;
    }

    addDescription(description, commands) {
        this.code += `describe('${description}', () => {\n`;
        this.addRules();
        this.addIt('Test 1 - 1', commands);
        this.code += `});\n`;
    }

    addEnvironment(commands, initURL) {
        this.code += `(async () => {\n`;
        this.code += `const browser = await puppeteer.launch({ headless: false });\n`;
        this.code += `const page = await browser.newPage();\n`;
        this.code += `await page.goto('${initURL}');`
        commands.forEach(command => {
            this.addCommand(command);
        });
        this.code += `})();\n`;
    }

    generatePuppeteerCode(commands, initURL) {
        this.initURL = initURL;
        this.addDescription("Test 1", commands);
        // this.addIt('DESCRIPTION', commands);
        return this.code;
    }
}

export default Generator;