import { DisappearingElementsPage } from '../../pages';

describe('Disappearing elements', { tags: '@ui' }, () => {
  const page = new DisappearingElementsPage();

  beforeEach(() => {
    page.visit();
  });

  it('always renders the core menu items', () => {
    ['Home', 'About', 'Contact Us', 'Portfolio'].forEach((item) => {
      page.menuItems().should('contain.text', item);
    });
  });

  // QUARANTINED: the site renders "Gallery" at random, so this fails ~50% of the time.
  // `@quarantine` keeps it out of the blocking pipeline; CI runs it in a non-blocking job
  // so the team keeps seeing its signal until the test (or the app) is fixed.
  it('renders the Gallery menu item', { tags: '@quarantine' }, () => {
    page.menuItems().should('contain.text', 'Gallery');
  });
});
