import { ProfileView } from '../../components/Profile';
import { ME } from '../../data/seed';

export default function MyProfile() {
  return <ProfileView handle={ME} />;
}
