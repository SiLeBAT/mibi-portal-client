/// <reference types="Cypress" />

describe('Testing the /users endpoint', function () {

    const baseUrl = '/v1/users';
    const genericErrorMessage = 'An unknown error occured';
    const genericErrorCode = 1;
    before(() => {
        cy.fixture('users.json').as('users');
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
                    expect(response.status).to.equal(401);
                    expect(response.body.message).to.equal('Authentication failure');
                    expect(response.body.code).to.equal(3);
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
                    expect(response.status).to.equal(500);
                    expect(response.body.message).to.equal(genericErrorMessage);
                    expect(response.body.code).to.equal(genericErrorCode);
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
                    expect(response.status).to.equal(401);
                    expect(response.body.message).to.be.a('string');
                    expect(response.body.code).to.equal(3);
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
                    expect(response.status).to.equal(500);
                    expect(response.body.message).to.equal(genericErrorMessage);
                    expect(response.body.code).to.equal(genericErrorCode);
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
                    expect(response.status).to.equal(500);
                    expect(response.body.message).to.equal(genericErrorMessage);
                    expect(response.body.code).to.equal(genericErrorCode);
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
                    expect(response.status).to.equal(500);
                    expect(response.body.message).to.equal(genericErrorMessage);
                    expect(response.body.code).to.equal(genericErrorCode);
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
                    expect(response.status).to.equal(500);
                    expect(response.body.message).to.equal(genericErrorMessage);
                    expect(response.body.code).to.equal(genericErrorCode);
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
                    expect(response.status).to.equal(400);
                    expect(response.body.message).to.equal('Malformed request');
                    expect(response.body.code).to.equal(4);
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
                    expect(response.status).to.equal(200);
                    expect(response.body.email).to.equal(this.users[0].email);
                    expect(response.body.passwordResetRequest).to.equal(true);
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
                    expect(response.status).to.equal(400);
                    expect(response.body.message).to.equal('Malformed request');
                    expect(response.body.code).to.equal(4);
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
                    expect(response.status).to.equal(401);
                    expect(response.body.message).to.equal('Unauthorized request');
                    expect(response.body.code).to.equal(2);
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
                    expect(response.status).to.equal(400);
                    expect(response.body.message).to.equal('Malformed request');
                    expect(response.body.code).to.equal(4);
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
                    expect(response.status).to.equal(401);
                    expect(response.body.message).to.equal('Unauthorized request');
                    expect(response.body.code).to.equal(2);
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
                    expect(response.status).to.equal(401);
                    expect(response.body.message).to.equal('Unauthorized request');
                    expect(response.body.code).to.equal(2);
                });
            });

        });
    });
});
