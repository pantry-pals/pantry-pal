import { Selector, t } from 'testcafe';

const adminEmail = 'admin@foo.com';
const oldPassword = 'changeme';
const newPassword = 'NewPassword123!';

const signIn = async (email, password) => {
    await t.navigateTo('https://pantry-pal-gamma.vercel.app/auth/signin');
    await t
        .typeText('input[name="email"]', email, { replace: true })
        .typeText('input[name="password"]', password, { replace: true })
        .click('button[type="submit"]');
};

const signOut = async () => {
    await t.navigateTo('https://pantry-pal-gamma.vercel.app/auth/signout');
    await t.expect(t.eval(() => window.location.pathname)).eql('/auth/signin');
};

fixture('Change Password Tests')
    .page('https://pantry-pal-gamma.vercel.app');

// 1️⃣ Check Change Password page loads
test('Change password page loads', async t => {
    await signIn(adminEmail, oldPassword);
    await t.navigateTo('https://pantry-pal-gamma.vercel.app/auth/change-password');

    const title = Selector('h1').withText('Change Password');
    await t.expect(title.exists).ok();

    await signOut();
});
