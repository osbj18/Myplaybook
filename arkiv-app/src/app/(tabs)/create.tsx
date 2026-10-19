import { Redirect } from 'expo-router';

// Fliken "Skapa" öppnar kameran som modal (se tab-baren). Den här skärmen visas aldrig.
export default function Create() {
  return <Redirect href="/camera" />;
}
