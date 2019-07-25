/* eslint-disable no-console */

import faker from 'faker';

import * as functions from '../../../__tests_helpers__/functions';

import * as constants from '../../../__tests_helpers__/constants';
describe('End-to-end test for textAreaEdit', () => {
    beforeAll(async (done) => {
        await functions.befAll(done, globals, 90722068237962);
        await globals.page.setViewport({ width: 1600, height: 900 });
    }, 2500);
    afterAll(async () => {
        await globals.browser.close();
    });
    beforeEach(async () => {
        await globals.page.click(constants.selectors.submissionTab);
    }, 2500 * 2);
    it('It Should Edit Plain Text Area Field Using TextArea Editor', async () => {
        await globals.page.click(`#root > [id="5ce80d2d2ae3ed1c6561f2f1"] > .root-folder`);
        await globals.page.click(`#searchTerm`);
        await globals.page.type(`#searchTerm`, `picon`);
        const editedCellContent = await globals.page.$$eval(`#formList > [id="91983255815972"] > .title-container > .form-title`, el => el[0].textContent)
        const finalTextContent = editedCellContent.replace(/s+/g, ' ').trim();
        expect(finalTextContent).toBe(`PICONbello`);
    }, 2500 * 2);
});