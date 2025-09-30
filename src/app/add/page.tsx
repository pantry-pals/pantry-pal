import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import AddStuffForm from '@/components/AddStuffForm';

const AddStuff = async () => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );
  return (
    <main>
      <AddStuffForm
        name=""
        id={0}
        type=""
        location=""
        quantity={0}
        unit="kg"
        expiration={null}
        owner={session?.user?.email || ''}
        image={null}
      />
    </main>
  );
};

export default AddStuff;
