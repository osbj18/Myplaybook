import { useLocalSearchParams } from 'expo-router';

import { ProfileView } from '../../components/Profile';

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProfileView id={id} showBack />;
}
