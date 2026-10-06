/// <reference types="cypress" />
/// <reference path="../../../support/index.d.ts" />

describe('Testing the Sample Action Bar', function () {
    describe('Testing an anonymous user', function () {
        describe('Testing without Sample loaded', function () {

            beforeEach(() => {
                cy.fixture('ui-routes.json').as('paths').then(
                    (paths: Record<string, string>) => {
                        cy.visit(paths.samples);
                    }
                );
            });
            describe('Testing the Sample Action Bar Standard content', standardContent);

        });
        // FIXME: Upload is not working yet
        xdescribe('Testing with Sample loaded', function () {

            beforeEach(() => {
                cy.fixture('ui-routes.json').as('paths')
                    .then(
                        () => {
                            const fileName = 'einsendebogen.xlsx';
                            cy.loadSamplesFile(fileName);
                        }
                    );
            });

            describe('Testing the Sample Action Bar Standard content', standardContent);

            describe('Testing the Sample Action Bar Sample loaded content', sampleLoadedContent);

        });
    });

    describe('Testing an authenticated user', function () {
        beforeEach(() => {
            cy.fixture('users.json')
                .then(
                    (users) => {
                        cy.login(users[0]);
                    }
                );

            cy.fixture('ui-routes.json')
                .then(
                    (paths: Record<string, string>) => {
                        cy.visit(paths.samples);
                    }
                );
        });
        describe('Testing without Sample loaded', function () {

            describe('Testing the Sample Action Bar Standard content', standardContent);

        });

        xdescribe('Testing with Sample loaded', function () {

            beforeEach(() => {
                cy.fixture('ui-routes.json').as('paths')
                    .then(
                        () => {
                            const fileName = 'einsendebogen.xlsx';
                            cy.loadSamplesFile(fileName);
                        }
                    );
            });
            describe('Testing the Sample Action Bar Standard content', standardContent);

            describe('Testing the Sample Action Bar Sample loaded content', sampleLoadedContent);

            describe('Testing the Sample Action Bar Sample loaded content with authenticated user', function () {
                it('should contain the sample send action ', function () {
                    cy.get('.mibi-action-link').within(() => {
                        cy.contains('Senden');
                    });
                });
            });

        });
    });
});

// Helper Functions

function standardContent() {
    it('should contain the Upload action', function () {
        cy.get('.mibi-action-list').within(() => {
            cy.contains('Hochladen');
        });
    });

    it('should contain the Template Download action ', function () {
        cy.get('.mibi-action-list').within(() => {
            cy.contains('Excel-Vorlage');
        });
    });
}

function sampleLoadedContent() {
    it('should contain the sample validate action', function () {
        cy.get('.mibi-action-list').within(() => {
            cy.contains('Validieren');
        });
    });

    it('should contain the sample export action ', function () {
        cy.get('.mibi-action-list').within(() => {
            cy.contains('Exportieren');
        });
    });

    it('should contain the sample close action ', function () {
        cy.get('.mibi-action-link').within(() => {
            cy.contains('Schließen');
        });
    });
}
