/// <reference types="Cypress" />

const colTitles = [

    'Ihre Proben­ummer',
    'Probe­nummer nach AVVData',
    'Erreger (Text aus ADV-Kat-Nr.16)',
    'Erreger (Textfeld / Ergänzung)',
    'Datum der Probe­nahme',
    'Datum der Isolierung',
    'Ort der Probe­nahme (Code aus ADV-Kat-Nr.9)',
    'Ort der Probe­nahme (PLZ)',
    'Ort der Probe­nahme (Text)',
    'Oberbe­griff (Kodier­system) der Matrizes (Code aus ADV-Kat-Nr.2)',
    'Matrix Code (Code aus ADV­Kat­Nr.3)',
    'Matrix (Textfeld / Ergänzung)',
    'Ver­arbeitungs­zustand (Code aus ADV-Kat­Nr.12)',
    'Grund der Probe­nahme (Code aus ADV-Kat­Nr.4)',
    'Grund der Probe­nahme (Textfeld / Ergänzung)',
    'Betriebsart (Code aus ADV-Kat-Nr.8)',
    'Betriebsart (Textfeld / Ergänzung)',
    'VVVO-Nr / Herde',
    'Bemerkung (u.a. Untersuchungs­programm)'

];
describe('Testing the Sample data grid', function () {
    beforeEach(() => {
        cy.fixture('ui-routes.json').as('paths').then(
            (paths) => {
                cy.visit(paths.samples);
            }
        );
    });

    describe('Testing without uploaded data', function () {
        it('should redirect to upload page', function () {
            cy.url().should('include', this.paths.upload);
        });
    });
    // FIXME: Upload is not working yet
    xdescribe('Testing with uploaded data', function () {
        beforeEach(() => {
            cy.fixture('ui-routes.json').as('paths')
                .then(
                    (paths) => {
                        const fileName = 'einsendebogen.xlsx';
                        // @ts-ignore
                        cy.loadSamplesFile(fileName, paths.root);
                    }
                );
        });
        it('should redirect to upload page', function () {
            colTitles.map(
                e => cy.contains(e)
            );
        });
    });
});
