import { browser, by, element } from 'protractor';

export class EpiLabPage {
    navigateTo() {
        return browser.get('/');
    }

    getParagraphText() {
        return element(by.css('mibi-root h1')).getText();
    }
}
