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
            // LoginContainerComponent sends a freshly logged-in user to the upload page
            // (to the editor instead when the account already has sample entries — the
            // E2E seed ships no orders, so upload is the case here).
            cy.url().should('equal', Cypress.config().baseUrl + this.paths.upload).then(
                () => {
                    const userJSON: string | null = window.localStorage.getItem(
                        'currentUser'
                    );
                    expect(userJSON).to.not.equal(null);
                    const user: User = JSON.parse(userJSON!);
                    expect(user.firstName).to.equal('User1');
                }
            );
            // Logout sits in the avatar's mat-menu (avatar-view.component.html), which is
            // only rendered once the menu is opened — hence the click on the avatar first.
            cy.get('.mibi-avatar-button').click();
            cy.contains('Abmelden').click();
            cy.url().should('equal', Cypress.config().baseUrl + this.paths.login).then(
                () => expect(window.localStorage.getItem(
                    'currentUser'
                )).to.equal(null)
            );
        });
    });
});
