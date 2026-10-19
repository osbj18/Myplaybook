import { ProfileView } from '../../components/Profile';
import { useMe } from '../../lib/auth';

export default function MyProfile() {
  const { uid } = useMe();
  return <ProfileView id={uid} />;
}
