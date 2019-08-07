/// <reference types="Cypress" />

describe('Testing the /users endpoint', function () {

    const baseUrl = '/v1/users';

    before(() => {
        cy.fixture('users.json').as('users');
        cy.fixture('error-responses.json').as('errors');
        cy.fixture('success-responses.json').as('success');
    });

    describe('Testing the /users/login endpoint', function () {
        describe('POST', function () {
            const method = 'POST';
            const url = baseUrl + '/login';
            it('should respond to valid user', function () {
                cy.request({
                    method: method,
                    log: true,
                    url: url,

                    headers: {
                        'accept': 'application/json'
                    },
                    body: {
                        email: this.users[0].email,
                        password: this.users[0].password
                    }
                }).then(response => {
                    expect(response.status).to.equal(200);
                    expect(response.body.firstName).to.be.a('string');
                    expect(response.body.lastName).to.be.a('string');
                    expect(response.body.email).to.be.a('string');
                    expect(response.body.token).to.be.a('string');
                    expect(response.body.instituteId).to.be.a('string');
                });
            });

            it('should respond with error if incorrect password', function () {
                cy.request({
                    method: method,
                    log: true,
                    url: url,

                    headers: {
                        'accept': 'application/json'
                    },
                    body: {
                        email: this.users[0].email,
                        password: 'wrongPassword'
                    },
                    failOnStatusCode: false
                }).then(response => {
                    expect(response.status).to.equal(this.errors[1].status);
                    expect(response.body).to.deep.equal(this.errors[1].body);
                });
            });

            it('should respond with error if incorrect email', function () {
                cy.request({
                    method: method,
                    log: true,
                    url: url,

                    headers: {
                        'accept': 'application/json'
                    },
                    body: {
                        email: 'wrong@wrong.com',
                        password: this.users[0].password
                    },
                    failOnStatusCode: false
                }).then(response => {
                    expect(response.status).to.equal(this.errors[0].status);
                    expect(response.body).to.deep.equal(this.errors[0].body);
                });
            });

            it('should respond with error if incorrect payload', function () {
                cy.request({
                    method: method,
                    log: true,
                    url: url,

                    headers: {
                        'accept': 'application/json'
                    },
                    body: {
                        username: this.users[0].email,
                        password: this.users[0].password
                    },
                    failOnStatusCode: false
                }).then(response => {
                    expect(response.status).to.equal(this.errors[0].status);
                    expect(response.body).to.deep.equal(this.errors[0].body);
                });
            });

            it('should respond with error if not adminEnabled', function () {
                cy.request({
                    method: method,
                    log: true,
                    url: url,

                    headers: {
                        'accept': 'application/json'
                    },
                    body: {
                        email: this.users[1].email,
                        password: this.users[1].password
                    },
                    failOnStatusCode: false
                }).then(response => {
                    expect(response.status).to.equal(this.errors[0].status);
                    expect(response.body).to.deep.equal(this.errors[0].body);
                });
            });

            it('should respond with error if not enabled', function () {
                cy.request({
                    method: method,
                    log: true,
                    url: url,

                    headers: {
                        'accept': 'application/json'
                    },
                    body: {
                        email: this.users[2].email,
                        password: this.users[2].password
                    },
                    failOnStatusCode: false
                }).then(response => {
                    expect(response.status).to.equal(this.errors[0].status);
                    expect(response.body).to.deep.equal(this.errors[0].body);
                });
            });

            it('should respond with error if neither enabled nor adminEnabled', function () {
                cy.request({
                    method: method,
                    log: true,
                    url: url,

                    headers: {
                        'accept': 'application/json'
                    },
                    body: {
                        email: this.users[3].email,
                        password: this.users[3].password
                    },
                    failOnStatusCode: false
                }).then(response => {
                    expect(response.status).to.equal(this.errors[0].status);
                    expect(response.body).to.deep.equal(this.errors[0].body);
                });
            });

        });
    });

    describe('Testing the /users/registration endpoint', function () {
        const url = baseUrl + '/registration';

        describe('POST', function () {
            const method = 'POST';
            it('should respond with error if user already known email', function () {
                cy.request({
                    method: method,
                    log: true,
                    url: url,

                    headers: {
                        'accept': 'application/json'
                    },
                    body: {
                        email: this.users[0].email,
                        password: this.users[0].password,
                        firstName: 'new',
                        lastName: 'new',
                        instituteId: '123456'
                    },
                    failOnStatusCode: false
                }).then(response => {
                    expect(response.status).to.equal(this.errors[0].status);
                    expect(response.body).to.deep.equal(this.errors[0].body);
                });
            });

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
                    expect(response.status).to.equal(this.errors[3].status);
                    expect(response.body).to.deep.equal(this.errors[3].body);
                });
            });

        });
    });

    describe('Testing the /users/reset-password-request endpoint', function () {
        const url = baseUrl + '/reset-password-request';
        describe('PUT', function () {
            const method = 'PUT';
            it('should respond of valid user', function () {
                cy.request({
                    method: method,
                    log: true,
                    url: url,

                    headers: {
                        'accept': 'application/json'
                    },
                    body: {
                        email: this.users[0].email
                    }
                }).then(response => {
                    expect(response.status).to.equal(this.success[0].status);
                    expect(response.body).to.deep.equal(this.success[0].body);
                });
            });

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
                    expect(response.status).to.equal(this.errors[3].status);
                    expect(response.body).to.deep.equal(this.errors[3].body);
                });
            });

        });
    });

    describe('Testing the /users/reset-password endpoint', function () {
        const url = baseUrl + '/reset-password';

        describe('PATCH', function () {
            const method = 'PATCH';
            it('should respond with error if unknown token', function () {
                cy.request({
                    method: method,
                    log: true,
                    url: url + '/invalidToken',

                    headers: {
                        'accept': 'application/json'
                    },
                    body: {
                        password: 'newPassword'
                    },
                    failOnStatusCode: false
                }).then(response => {
                    expect(response.status).to.equal(this.errors[4].status);
                    expect(response.body).to.deep.equal(this.errors[4].body);
                });
            });

            it('should respond with error if incorrect payload', function () {
                cy.request({
                    method: method,
                    log: true,
                    url: url + '/invalidToken',

                    headers: {
                        'accept': 'application/json'
                    },
                    body: {
                        username: 'newPassword'
                    },
                    failOnStatusCode: false
                }).then(response => {
                    expect(response.status).to.equal(this.errors[3].status);
                    expect(response.body).to.deep.equal(this.errors[3].body);
                });
            });

        });
    });

    describe('Testing the /users/verification endpoint', function () {
        const url = baseUrl + '/verification';

        describe('PATCH', function () {
            const method = 'PATCH';
            it('should respond with error if unknown token', function () {
                cy.request({
                    method: method,
                    log: true,
                    url: url + '/invalidToken',

                    headers: {
                        'accept': 'application/json'
                    },
                    failOnStatusCode: false
                }).then(response => {
                    expect(response.status).to.equal(this.errors[4].status);
                    expect(response.body).to.deep.equal(this.errors[4].body);
                });
            });

        });
    });

    describe('Testing the /users/activation endpoint', function () {
        const url = baseUrl + '/activation';

        describe('PATCH', function () {
            const method = 'PATCH';
            it('should respond with error if unknown token', function () {
                cy.request({
                    method: method,
                    log: true,
                    url: url + '/invalidToken',

                    headers: {
                        'accept': 'application/json'
                    },
                    failOnStatusCode: false
                }).then(response => {
                    expect(response.status).to.equal(this.errors[4].status);
                    expect(response.body).to.deep.equal(this.errors[4].body);
                });
            });

        });
    });
});
