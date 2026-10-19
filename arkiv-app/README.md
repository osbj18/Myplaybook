# ARKIV – iPhone-app

Det sociala flödet för mode – där varje look går att köpa. Byggd med Expo (React Native) och Expo Router.

## Vad som finns i appen

- **Hem** – favoriter som stories och flödet från de du följer
- **Inlägg** – svepbara bilder, gilla, spara och kommentera
- **Säljes** – plaggsida med detaljer, "Mer från säljaren" och bud
- **Utforska** – sök och filtrera plagg, spara favoriter
- **Meddelanden** – chatt med bud, motbud och avslutad affär
- **Skapa** – riktig kamera och bildväljare (flera bilder), formulär för inlägg eller annons
- **Profil** – rutnät med filter, omdömen, redigera profil
- **Inställningar** – blockerade användare och "Radera all min data"
- **Rapportera/blockera** på inlägg, profiler och chattar (krävs av App Store för användarinnehåll)

All data sparas lokalt på telefonen (AsyncStorage). Tagna och valda bilder kopieras till appens dokumentmapp.

## Kör lokalt

```bash
npm install
npx expo start
```

Skanna QR-koden med kameran på din iPhone. Du behöver appen **Expo Go**, eller en development build eftersom appen använder kameran.

## Ladda upp till App Store

Du behöver:

1. Ett **Apple Developer-konto** (99 USD/år): https://developer.apple.com/programs/
2. Ett gratis **Expo-konto**: https://expo.dev/signup

Ingen Mac behövs, eftersom bygget sker i molnet med EAS.

### 1. Välj ditt bundle-ID

I `app.json` står `"bundleIdentifier": "se.arkiv.app"`. Byt till ett unikt ID som du äger, till exempel `se.dittnamn.arkiv`. ID:t går inte att ändra efter den första uppladdningen.

### 2. Bygg appen

```bash
npx eas-cli@latest login
npx eas-cli@latest init          # kopplar projektet till ditt Expo-konto
npm run build:ios                # bygger en .ipa i molnet
```

EAS frågar efter ditt Apple-konto och skapar certifikat och provisioning-profiler automatiskt.

### 3. Skicka till App Store Connect

```bash
npm run submit:ios
```

Bygget hamnar i **TestFlight** efter några minuter. Där kan du testa appen på din egen iPhone.

### 4. Fyll i App Store Connect

Gör det här på https://appstoreconnect.apple.com:

- **Skärmdumpar** för 6,9" iPhone (1320 × 2868), minst 3 st
- **Beskrivning**, nyckelord och kategori (t.ex. *Livsstil* eller *Shopping*)
- **Länk till integritetspolicy** (krävs)
- **App Privacy**: "Data Not Collected" stämmer för nuvarande version, eftersom inget lämnar telefonen
- **Åldersgräns**: svara ja på "User Generated Content"
- Klicka **Submit for Review**

## Viktigt inför granskningen

Den här versionen har exempelinnehåll och fungerar helt på telefonen. Den har inga konton, ingen server och inga riktiga betalningar. Apple brukar avvisa marknadsplats- och sociala appar där andra användare och köp bara är på låtsas (riktlinje 2.1 och 4.2).

Inför en riktig lansering behövs:

- Konton och inloggning, med "Logga in med Apple" och radering av konto i appen
- En backend för inlägg, bilder, chatt och bud (t.ex. Supabase eller Firebase)
- Betalning för fysiska varor via t.ex. Stripe eller Swish. Apples köp i appen ska *inte* användas för fysiska varor.
- Granskning av rapporterat innehåll inom 24 timmar

## Kodstruktur

```
src/app/            skärmar (Expo Router, filbaserad routing)
  (tabs)/           Hem, Utforska, Skapa, Meddelanden, Profil
  post/[id]         inlägg
  listing/[id]      plagg till salu
  chat/[id]         konversation med bud
  user/[handle]     annan användares profil
  camera, compose   skapa-flödet
  settings          inställningar
src/components/     återanvändbara komponenter (ark, ikoner, profil)
src/data/           exempeldata och bildregister
src/store.tsx       app-state, sparas i AsyncStorage
src/photos.ts       sparar bilder i appens dokumentmapp
```

## Kontroller

```bash
npm run typecheck
npx expo export --platform web   # snabb kontroll att allt bundlar
```
