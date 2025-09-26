import { time } from 'console';
import SignInPage from './pages/SignInPage';
import { t } from 'testcafe';

fixture('SignIn Page')
  .page('https://pantry-pal-gamma.vercel.app/auth/signin');

test('SignUp page loads', async t => {
  await SignInPage.isDisplayed();
});

test('Can sign in as admin', async t => {
  const email = 'admin@foo.com';
  const password = 'changeme';

  await SignInPage.signIn(email, password, timeout(10000));

  // Wait for redirect to /list (up to 10s)
  await t.expect(t.eval(() => window.location.pathname))
         .eql('/view-pantry', { timeout: 10000 }, 'Expected redirect to /view-pantry after sign in');
});
