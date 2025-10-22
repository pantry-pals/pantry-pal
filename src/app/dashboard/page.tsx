import { getServerSession } from 'next-auth';
import { loggedInProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';
import DashboardMenu from '../../components/dashboard/DashboardMenu';

type SessionUser = { id: string; email: string; randomKey: string };

const DashboardPage = async () => {
  const session = (await getServerSession(authOptions)) as { user: SessionUser } | null;
  loggedInProtectedPage(session);

  return (
    <main>
      <DashboardMenu />
    </main>
  );
};

export default DashboardPage;
