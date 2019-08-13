/// <reference types="Cypress" />

describe('Testing the /institutes endpoint', function () {
    const baseUrl = '/v1/institutes';
    describe('GET', function () {
        const method = 'GET';
        it('should respond with error if invalid token', function () {
            cy.request({
                method: method,
                log: true,
                url: baseUrl,
                headers: {
                    'accept': 'application/json'
                }
            }).then(response => {
                expect(response.status).to.equal(200);
                expect(response.body.institutes).to.be.a('array');
            });
        });
    });
});
