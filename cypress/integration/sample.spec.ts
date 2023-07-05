describe('Testing the hero list page', function () {

    it('should contain the word MiBi-Portal', function () {
        cy.visit('http://localhost:4200');
        cy.contains('MiBi-Portal');
    });

});
