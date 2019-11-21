import { User } from './../../../support/test.model';
/// <reference types="Cypress" />

describe('Use-cases Login Page', function () {

    beforeEach(() => {
        cy.fixture('ui-routes.json').as('paths').then(
            (paths) => {
                cy.visit(paths.login);
            }
        );
    });

    describe('User1 login', function () {
        before(() => {
            cy.fixture('users.json').as('users');
        });

        it('should allow User1 to log in and out again, clearing local storage', function () {
            cy.get('[name="email"]').type(this.users[0].email);
            cy.get('[name="password"]').type(this.users[0].password);
            cy.get('[type="submit"]').click();
            cy.url().should('include', this.paths.profile).then(
                () => {
                    const userJSON: string | null = window.localStorage.getItem(
                        'currentUser'
                    );
                    expect(userJSON).to.not.equal(null);
                    // tslint:disable-next-line: no-non-null-assertion
                    const user: User = JSON.parse(userJSON!);
                    expect(user.firstName).to.equal('User1');
                }
            );
            cy.contains('Abmelden').click();
            cy.url().should('include', this.paths.login).then(
                () => expect(window.localStorage.getItem(
                    'currentUser'
                )).to.equal(null)
            );
        });
    });
});
