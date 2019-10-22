/// <reference types="Cypress" />

describe('Testing the /samples endpoint', function () {

    const baseUrl = '/v2/samples';

    before(() => {
        cy.fixture('samples.json').as('samples');
    });

    describe('PUT', function () {
        const method = 'PUT';
        const url = baseUrl;
        it('should respond with error if incorrect payload', function () {
            cy.request({
                method: method,
                log: true,
                url: url,

                headers: {
                    'accept': 'application/json'
                },
                body: {
                    username: 'new'
                },
                failOnStatusCode: false
            }).then(response => {
                expect(response.status).to.equal(400);
                expect(response.body.message).to.equal('Malformed request');
                expect(response.body.code).to.equal(4);
            });
        });

        it('should respond with sample as JSON', function () {
            cy.request({
                method: method,
                log: true,
                url: url,

                headers: {
                    'accept': 'application/json'
                },
                body: this.samples[0],
                failOnStatusCode: true
            }).then(response => {
                expect(response.status).to.equal(200);
                expect(response.body.order).to.be.a('object');
                expect(response.body.order.sampleSet).to.be.a('object');
                expect(response.body.order.sampleSet.meta).to.be.a('object');
                expect(response.body.order.sampleSet.samples).to.be.a('array');
            });
        });

    });
    describe('Testing the /samples/submitted endpoint', function () {
        const url = baseUrl + '/submitted';
        describe('POST', function () {
            const method = 'POST';
            it('should respond with error if no token supplied', function () {
                cy.request({
                    method: method,
                    log: true,
                    url: url,

                    headers: {
                        'accept': 'application/json'
                    },
                    body: this.samples[0],
                    failOnStatusCode: false
                }).then(response => {
                    expect(response.status).to.equal(401);
                    expect(response.body.message).to.be.a('string');
                    expect(response.body.code).to.equal(2);
                });
            });

        });
    });

    describe('Testing the /samples/validated  endpoint', function () {
        const url = baseUrl + '/validated';

        describe('PUT', function () {
            const method = 'PUT';

            it('should respond with error if incorrect payload', function () {
                cy.request({
                    method: method,
                    log: true,
                    url: url,

                    headers: {
                        'accept': 'application/json'
                    },
                    body: {
                        email: 'new',
                        password: 'new'
                    },
                    failOnStatusCode: false
                }).then(response => {
                    expect(response.status).to.equal(400);
                    expect(response.body.message).to.equal('Malformed request');
                    expect(response.body.code).to.equal(4);
                });
            });

            it('should respond with validated sample', function () {
                cy.request({
                    method: method,
                    log: true,
                    url: url,
                    body: this.samples[0]
                }).then(response => {
                    const order = response.body.order;
                    expect(response.status).to.equal(200);
                    expect(order).to.be.a('object');
                    expect(order.sampleSet.meta).to.be.a('object');
                    expect(order.sampleSet.samples).to.be.a('array');
                    expect(order.sampleSet.samples[0].sampleData.sample_id_avv.errors[0].code).to.equal(72);
                });
            });

        });
    });
});
