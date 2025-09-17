import { Selector } from 'testcafe';

fixture('Add Page')
    .page('http://localhost:3000/auth/signin');

const testEmail = 'admin@foo.com';
const testPassword = 'changeme';

test('Add page loads', async t => {
    // Sign in
    await t
        .typeText('input[name="email"]', testEmail, { replace: true })
        .typeText('input[name="password"]', testPassword, { replace: true })
        .click('button[type="submit"]');

    // Wait for redirect to /list (or home after signin)
    await t.expect(t.eval(() => window.location.pathname)).notEql('/auth/signin', { timeout: 10000 });

    // Go to /add page
    await t.navigateTo('http://localhost:3000/add');

    // Check that the AddStuffForm rendered
    const addForm = Selector('form'); // assuming AddStuffForm renders a <form>
    await t.expect(addForm.exists).ok('Expected AddStuffForm to be present');

    // Optional: check a field in the form if you want
    const nameInput = Selector('input[name="name"]'); // replace with actual input name
    await t.expect(nameInput.exists).ok('Expected "name" input to exist');
});
