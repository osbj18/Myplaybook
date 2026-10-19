import { useLocalSearchParams } from 'expo-router';

import { ProfileView } from '../../components/Profile';

export default function UserProfile() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  return <ProfileView handle={handle} showBack />;
}
