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

    addRulesInner(rules) {
        rules.forEach(rule => {
            this.code += rule;
        });
    }

    addRules() {
        for (var key in this.rules) {
            var rules = this.rules[key];
            switch (key) {
                case 'beforeAll':
                    this.code += `beforeAll(async () => {`;
                    this.addRulesInner(rules);
                    this.code += `});`;
                    break;
                case 'afterAll':
                    this.code += `afterAll(async () => {`;
                    this.addRulesInner(rules);
                    this.code += `});`;
                    break;
                case 'beforeEach':
                    this.code += `beforeEach(async () => {`;
                    this.addRulesInner(rules);
                    this.code += `};`;
                    break;
            }
        }
    }

    addCommand(command) {
        if (command && command.type) {
            switch (command.type) {
                case 'click':
                    this.code += `await page.click('${command.selector}');`;
                    break;
                case 'keydown':
                    if (keyCommands.includes(command.data.key)) {
                        this.code += `await page.keyboard.press('${command.data.key}');`;
                    } else {
                        this.code += `await page.type('${command.selector}', '${command.data.key}');`
                    }
                    break;
                case 'verify-text':
                    this.code += `var textContent = await page.$$eval('${command.selector}', el => el[0].textContent);`;
                    this.code += `var finalTextContent = textContent.trim();`;
                    this.code += `expect(finalTextContent).toBe('${command.data.key}');`;
                    break;
                case 'verify-dom':
                    this.code += `var elCount = await page.$$eval('${command.selector}', el => el.length);`;
                    this.code += `expect(elCount).toBeGreaterThan(0);`;
                    break;
                case 'verify-link':
                    this.code += `var nodeLink = await page.$$eval('${command.selector}', el => el[0].href);`;
                    this.code += `expect(nodeLink).toBe('${command.data.key}');`;
                    break;
                case 'page-change':
                    this.code += `await page.waitForNavigation({ waitUntil: 'load' });`
                    break;
                case 'click-page-change':
                    this.code += `await Promise.all([`;
                    this.code += `page.click('${command.selector}'),`;
                    this.code += `page.waitForNavigation()]);`;
                    break;
                case 'combined-keydown':
                    command.data.commands.forEach(com => {
                        this.code += `await page.keyboard.down('${com}');`
                    });
                    this.code += `await page.keyboard.press('${command.data.key.slice(-1)}');`;
                    command.data.commands.forEach(com => {
                        this.code += `await page.keyboard.up('${com}');`
                    });
                    break;
                case 'drag-and-drop':
                    this.code += `await page.mouse.move(${command.data.mousePos.x},${command.data.mousePos.y});`;
                    this.code += `await page.mouse.down();`;
                    this.code += `await page.mouse.move(${command.data.mouseTarget.x},${command.data.mouseTarget.y});`;
                    this.code += `await page.mouse.up();`;
                    break;
            }
        }
    }

    addIt(description, commands) {
        this.code += `it('${description}', async () => {`;
        commands.forEach(command => {
            this.addCommand(command);
        });
        this.code += `}, 60000);`;
    }

    addDescription(description, commands) {
        this.code += `describe('${description}', () => {`;
        this.addRules();
        this.addIt('Test 1 - 1', commands);
        this.code += `});`;
    }


    generatePuppeteerCode(commands, initURL) {
        this.initURL = initURL;
        this.addDescription("Test 1", commands);
        return this.code;
    }
}

export default Generator;