import { Selector } from 'testcafe';

fixture('Recipes Page')
    .page('http://localhost:3000/auth/signin');

const testEmail = 'admin@foo.com';
const testPassword = 'changeme';

test('Recipes page loads and buttons work', async t => {
    // Sign in
    await t
        .typeText('input[name="email"]', testEmail, { replace: true })
        .typeText('input[name="password"]', testPassword, { replace: true })
        .click('button[type="submit"]');

    // Wait for redirect after signin
    await t.expect(t.eval(() => window.location.pathname)).notEql('/auth/signin', { timeout: 10000 });

    // Navigate to recipes page
    await t.navigateTo('http://localhost:3000/recipes');

    // Check that the page heading exists
    const heading = Selector('h2').withText('Recipes');
    await t.expect(heading.exists).ok('Expected Recipes page heading to exist');

    // Check "Show Recipes I Can Make" button
    const showCanMakeButton = Selector('button').withText(/Show Recipes I Can Make|Show All Recipes/);
    await t.expect(showCanMakeButton.exists).ok('Expected "Show Recipes I Can Make" button to exist');

    // Click the toggle button
    await t.click(showCanMakeButton);
    await t.expect(showCanMakeButton.textContent).contains('Show All Recipes', 'Button text should toggle');
});
