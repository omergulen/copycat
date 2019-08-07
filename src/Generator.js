import { keyCommands } from './Constants';

class Generator {

    constructor() {
        this.code = "";
    }

    get rules() {
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
            this.code += '\t\t' + rule + '\n';
        });
    }

    addRules() {
        for (var key in this.rules) {
            var rules = this.rules[key];
            switch (key) {
                case 'beforeAll':
                    this.code += `\tbeforeAll(async () => {\n`;
                    this.addRulesInner(rules);
                    this.code += `\t});\n\n`;
                    break;
                case 'afterAll':
                    this.code += `\tafterAll(async () => {\n`;
                    this.addRulesInner(rules);
                    this.code += `\t});\n\n`;
                    break;
                case 'beforeEach':
                    this.code += `\tbeforeEach(async () => {\n`;
                    this.addRulesInner(rules);
                    this.code += `\t};\n\n`;
                    break;
            }
        }
    }

    addCommand(command) {
        if (command && command.type) {
            switch (command.type) {
                case 'click':
                    this.code += `\t\tawait page.click('${command.selector}');\n`;
                    break;
                case 'keydown':
                    if (keyCommands.includes(command.data.key)) {
                        this.code += `\t\tawait page.keyboard.press('${command.data.key}');\n`;
                    } else {
                        this.code += `\t\tawait page.type('${command.selector}', '${command.data.key}');\n`
                    }
                    break;
                case 'verify-text':
                    this.code += `\t\tvar textContent = await page.$$eval('${command.selector}', el => el[0].textContent)\n`;
                    this.code += `\t\tvar finalTextContent = textContent.trim();\n`;
                    this.code += `\t\texpect(finalTextContent).toBe('${command.data.key}');\n`;
                    break;
                case 'verify-dom':
                    this.code += `\t\tvar elCount = await page.$$eval('${command.selector}', el => el.length);\n`
                    this.code += `\t\texpect(elCount).toBeGreaterThan(0);\n`;
                    break;
                case 'verify-link':
                    this.code += `\t\tvar nodeLink = await page.$$eval('${command.selector}', el => el[0].href)\n`;
                    this.code += `\t\texpect(nodeLink).toBe('${command.data.key}');\n`;
                    break;
                case 'page-change':
                    this.code += `\t\tawait page.waitForNavigation({ waitUntil: 'load' });\n`
                    break;
                case 'click-page-change':
                    this.code += `\t\tawait Promise.all([\n`;
                    this.code += `\t\t\tpage.click('${command.selector}'),\n`;
                    this.code += `\t\t\tpage.waitForNavigation()\n\t\t]);\n`;
                    break;
                case 'combined-keydown':
                    command.data.commands.forEach(com => {
                        this.code += `\t\tawait page.keyboard.down('${com}');\n`
                    });
                    this.code += `\t\tawait page.keyboard.press('${command.data.key.slice(-1)}');\n`;
                    command.data.commands.forEach(com => {
                        this.code += `\t\tawait page.keyboard.up('${com}');\n`
                    });
                    break;
                case 'drag-and-drop':
                    this.code += `\t\tawait page.mouse.move(${command.data.mousePos.x},${command.data.mousePos.y})\n`;
                    this.code += `\t\tawait page.mouse.down()\n`;
                    this.code += `\t\tawait page.mouse.move(${command.data.mouseTarget.x},${command.data.mouseTarget.y})\n`;
                    this.code += `\t\tawait page.mouse.up()\n`
                    break;
            }
        }
    }

    addIt(description, commands) {
        this.code += `\tit('${description}', async () => {\n`;
        commands.forEach(command => {
            this.addCommand(command);
        });
        this.code += `\t}, 60000);\n`;
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