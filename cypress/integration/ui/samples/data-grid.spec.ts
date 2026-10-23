/// <reference types="cypress" />

import { samplesEditorDataHeaders } from '../../../../src/app/samples/samples-editor/constants/column-headers.constants';

// The grid's column titles, taken from the app rather than copied: the previous hardcoded
// list had drifted to the ADV catalogue names the portal no longer uses.
const colTitles = Object.values(samplesEditorDataHeaders);
describe('Testing the Sample data grid', function () {
    beforeEach(() => {
        cy.fixture('ui-routes.json').as('paths').then(
            (paths: Record<string, string>) => {
                cy.visit(paths.samples);
            }
        );
    });

    describe('Testing without uploaded data', function () {
        it('should redirect to upload page', function () {
            cy.url().should('equal', Cypress.config().baseUrl + this.paths.upload);
        });
    });
    describe('Testing with uploaded data', function () {
        beforeEach(() => {
            cy.fixture('ui-routes.json').as('paths')
                .then(
                    () => {
                        const fileName = 'einsendebogen-v18.xlsx';
                        cy.loadSamplesFile(fileName);
                    }
                );
        });
        it('should display every sample data column', function () {
            // Every cell is rendered (the grid does not virtualise), so an off-screen
            // column is still in the DOM — hence no visibility assertion here.
            colTitles.forEach(title => cy.contains(title));
        });
    });
});
