import { Selector, t } from 'testcafe';

const adminEmail = 'admin@foo.com';
const oldPassword = 'changeme';
const newPassword = 'NewPassword123!';

// Helper to sign in
const signIn = async (email, password) => {
    await t.navigateTo('http://localhost:3000/auth/signin');
    await t
        .typeText('input[name="email"]', email, { replace: true })
        .typeText('input[name="password"]', password, { replace: true })
        .click('button[type="submit"]');
};

// Helper to sign out
const signOut = async () => {
    await t.navigateTo('http://localhost:3000/auth/signout');
    const signOutButton = Selector('[data-testid="signout-button"]');
    await t.click(signOutButton);
    await t.expect(t.eval(() => window.location.pathname)).eql('/auth/signin');
};

fixture('Change Password Tests')
    .page('http://localhost:3000');

// 1️⃣ Check that the Change Password page loads
test('Change password page loads', async t => {
    await signIn(adminEmail, oldPassword);
    await t.navigateTo('http://localhost:3000/auth/change-password');
    const title = Selector('h1').withText('Change Password');
    await t.expect(title.exists).ok();
    await signOut();
});

// 2️⃣ Fill out the Change Password form
test('Change password form', async t => {
    await signIn(adminEmail, oldPassword);
    await t.navigateTo('http://localhost:3000/auth/change-password');

    await t
        .typeText('input[placeholder="Enter old password"]', oldPassword, { replace: true })
        .typeText('input[placeholder="Enter new password"]', newPassword, { replace: true })
        .typeText('input[placeholder="Confirm new password"]', newPassword, { replace: true })
        .click('button[type="submit"]');

    const successAlert = Selector('.swal-text').withText('Your password has been changed');
    await t.expect(successAlert.exists).ok();
    await signOut();
});

// 3️⃣ Log in with the new password
test('Logging in with new password', async t => {
    await signIn(adminEmail, newPassword);
    await t.expect(Selector('main').exists).ok();

    // Reset password back to original
    await t.navigateTo('http://localhost:3000/auth/change-password');
    await t
        .typeText('input[placeholder="Enter old password"]', newPassword, { replace: true })
        .typeText('input[placeholder="Enter new password"]', oldPassword, { replace: true })
        .typeText('input[placeholder="Confirm new password"]', oldPassword, { replace: true })
        .click('button[type="submit"]');

    const resetAlert = Selector('.swal-text').withText('Your password has been changed');
    await t.expect(resetAlert.exists).ok();
    await signOut();
});
