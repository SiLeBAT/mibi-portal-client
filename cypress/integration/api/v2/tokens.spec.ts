/// <reference types="Cypress" />

describe('Testing the /tokens endpoint', function () {
    const baseUrl = '/v2/tokens';
    describe('POST', function () {
        const method = 'POST';
        it('should respond with error if invalid token', function () {
            cy.request({
                method: method,
                log: true,
                url: baseUrl,

                headers: {
                    'accept': 'application/json'
                },
                failOnStatusCode: false
            }).then(response => {
                expect(response.status).to.equal(401);
                expect(response.body.message).to.equal('No authorization token was found');
                expect(response.body.code).to.equal(2);
            });
        });
    });
});
