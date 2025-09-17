import { Selector, t } from 'testcafe';

fixture('Forgot Password Page')
    .page('http://localhost:3000/auth/forgot-password');

// ✅ Test that the Forgot Password page loads
test('Forgot Password page loads', async t => {
    const pageTitle = Selector('h1').withText('Forgot Password');
    await t.expect(pageTitle.exists).ok();
});

// ✅ Test that the form can be filled and submitted
test('Forgot Password form', async t => {
    const emailInput = Selector('input[type="email"]');
    const submitButton = Selector('button').withText(/Send Reset Link/i);

    // Fill out the email field
    await t
        .typeText(emailInput, 'admin@foo.com', { replace: true })
        .click(submitButton);

    // Wait for the message to appear
    const message = Selector('p').withText(/link has been sent/i);
    await t.expect(message.exists).ok();
});
