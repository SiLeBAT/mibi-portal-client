/// <reference types="Cypress" />

describe('Testing the signing into the MiBi-Portal', function () {
    before(() => {
        cy.fixture('users.json').as('users');
    });

    it('should allow User1 to log in', function () {
        cy.visit('/');
        cy.contains('Anmelden').click();
        cy.get('[name="email"]').type(this.users[0].email);
        cy.get('[name="password"]').type(this.users[0].password);
        cy.get('[type="submit"]').click();
        cy.url().should('include', '/users/profile');
    });

});
