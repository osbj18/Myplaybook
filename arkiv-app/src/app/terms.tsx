import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackBtn, TopBar } from '../components/ui';
import { C, T } from '../theme';

const SECTIONS: [string, string][] = [
  ['Om ARKIV', 'ARKIV är en mötesplats där du delar outfits och säljer plagg ur din egen garderob. Köp och försäljning sker direkt mellan användare. ARKIV är inte part i affärerna och hanterar inga betalningar.'],
  ['Ditt konto', 'Du måste vara minst 16 år. Du ansvarar för det som publiceras från ditt konto. Du kan radera ditt konto och allt innehåll när som helst under Inställningar.'],
  ['Innehåll', 'Du får bara lägga upp bilder och videor som du själv har rätt till. Det är förbjudet att publicera stötande, sexuellt, våldsamt, hatiskt eller olagligt innehåll, samt förfalskningar, stöldgods och vilseledande annonser. Vi har nolltolerans mot sådant innehåll och mot användare som trakasserar andra.'],
  ['Rapportera och blockera', 'Du kan rapportera inlägg, kommentarer och profiler och blockera andra användare. Anmälningar granskas inom 24 timmar. Innehåll som bryter mot villkoren tas bort och användaren som publicerat det kan stängas av.'],
  ['Köp och sälj', 'Bud som accepteras är en överenskommelse mellan köpare och säljare. Betala bara när du känner dig trygg, gärna vid upphämtning eller med spårbar frakt. Säljaren ansvarar för att beskrivningen stämmer.'],
  ['Personuppgifter', 'Vi sparar din e-postadress, din profil och det du publicerar för att tjänsten ska fungera. Meddelanden syns bara för dig och den du skriver med. Vi säljer inte dina uppgifter.'],
];

export default function Terms() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 30 }}>
      <TopBar left={<BackBtn />} center={<Text style={T.title}>Användarvillkor</Text>} />
      {SECTIONS.map(([h, p]) => (
        <View key={h} style={{ paddingHorizontal: 20, marginBottom: 18 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: C.ink, marginBottom: 6 }}>{h}</Text>
          <Text style={{ fontSize: 15, lineHeight: 22, color: C.soft }}>{p}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
