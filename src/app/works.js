/* eslint-disable no-console */
import * as functions from '../../../__tests_helpers__/functions';

describe('End-to-end test for textAreaEdit', async () => {
    const globals = {};
    beforeAll(async () => {
        await functions.befAll(globals);
    }, 10000);
    afterAll(async () => {
        await globals.browser.close();
    });

    it('It Should Edit Plain Text Area Field Using TextArea Editor', async () => {
        await globals.page.click('#searchTerm');
        await globals.page.type('#searchTerm', 'picon');
        const editedCellContent = await globals.page.$$eval('#formList > [id="91983255815972"] > .title-container > .form-title', el => el[0].textContent);
        const finalTextContent = editedCellContent.replace(/s+/g, ' ').trim();
        expect(finalTextContent).toBe('PICONbello');
    }, 10000);
});