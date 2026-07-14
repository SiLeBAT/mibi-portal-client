// First-instance E2E smoke test for the Dockerized GitHub Actions stack.
// Goal (per requirements): the stack boots and the public Welcome page renders.
// No login — auth is stubbed / not active. See e2e/README.md.

describe('Welcome page (smoke)', () => {
    it('loads the public Welcome page', () => {
        cy.visit('/');

        // App name comes from the environment (e.g. "MiBi-Portal-Dev").
        cy.contains(/MiBi-Portal/i).should('be.visible');

        // Static welcome content on the public home page (renders without logging in).
        cy.contains('Datenaustausch-Portal').should('be.visible');
        cy.contains('Ihr MiBi-Portal Team').should('be.visible');
    });
});
