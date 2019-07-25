class Generator {

    constructor() {
        this.code = "";
        this.rules = {
            beforeAll: [
                `await functions.befAll(done, globals, 90722068237962);\n`,
                `await globals.page.setViewport({ width: 1600, height: 900 });\n`
            ],
            afterAll: [
                `await globals.browser.close();\n`
            ],
            beforeEach: [
                `await globals.page.click(constants.selectors.submissionTab);\n`
            ],
            timeout: 2500
        }
    }

    get imports() {
        // return [
        //     `/* eslint-disable no-console */\n`,
        //     `import faker from 'faker';\n`,
        //     `import * as functions from '../../../__tests_helpers__/functions';\n`,
        //     `import * as constants from '../../../__tests_helpers__/constants';\n`
        // ];
        return [
            '/* eslint-disable no-console */',
            'import faker from \'faker\';',
            'import * as functions from \'../../../__tests_helpers__/functions\';',
            'import * as constants from \'../../../__tests_helpers__/constants\';'
        ];
    }

    addImports() {
        this.code = this.imports.reduce((acc, curr) => `${acc}\n${curr}\n`, this.code);
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
                    this.code += `beforeAll(async (done) => {\n`;
                    this.addRulesInner(rules);
                    this.code += `}, ${this.rules.timeout});\n`;
                    break;
                case 'afterAll':
                    this.code += `afterAll(async () => {\n`;
                    this.addRulesInner(rules);
                    this.code += `});\n`;
                    break;
                case 'beforeEach':
                    this.code += `beforeEach(async () => {\n`;
                    this.addRulesInner(rules);
                    this.code += `  }, ${this.rules.timeout} * 2);\n`;
                    break;
            }
        }
    }

    addCommand(command) {
        if (command && command.type) {
            switch (command.type) {
                case 'click':
                    this.code += `await globals.page.click('${command.selector}');\n`;
                    break;
                case 'keydown':
                    this.code += `await globals.page.type('${command.selector}', '${command.data}');\n`;
                    break;
                case 'verify-text':
                    this.code += `const editedCellContent = await globals.page.$$eval('${command.selector}', el => el[0].textContent)\n`;
                    this.code += `const finalTextContent = editedCellContent.replace(/\s+/g, ' ').trim();\n`;
                    this.code += `expect(finalTextContent).toBe('${command.data}');\n`;
            }
        }
    }

    addIt(description, commands) {
        this.code += `it('${description}', async () => {\n`;
        commands.forEach(command => {
            this.addCommand(command);
        });
        this.code += `}, ${this.rules.timeout} * 2);\n`;
    }

    addDescription(description, commands) {
        this.code += `describe('${description}', () => {\n`;
        this.addRules();
        this.addIt('It Should Edit Plain Text Area Field Using TextArea Editor', commands);
        this.code += `});\n`;
    }

    generatePuppeteerCode(commands) {
        this.addImports();
        this.addDescription('End-to-end test for textAreaEdit', commands);
        return this.code;
    }
}

export default Generator;