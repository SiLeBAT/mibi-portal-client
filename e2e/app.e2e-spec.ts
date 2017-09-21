import { EpiLabPage } from './app.po';

describe('epi-lab App', () => {
  let page: EpiLabPage;

  beforeEach(() => {
    page = new EpiLabPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
