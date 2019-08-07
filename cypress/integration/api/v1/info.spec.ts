/// <reference types="Cypress" />

describe('Testing the /info endpoint', function () {
    const baseUrl = '/v1/info';
    describe('GET', function () {
        const method = 'GET';
        it('should respond with 200', function () {
            cy.request({
                method: method,
                log: true,
                url: baseUrl,
                headers: {
                    'accept': 'application/json'
                }
            }).then(response => {
                expect(response.status).to.equal(200);
                expect(response.body.version).to.be.a('string');
                expect(response.body.supportContact).to.be.a('string');
                expect(response.body.lastChange).to.be.a('string');
            });
        });
    });
});
