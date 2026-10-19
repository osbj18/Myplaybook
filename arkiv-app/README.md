# ARKIV – iPhone-app

Det sociala flödet för mode – där varje look går att köpa. Byggd med Expo (React Native) och Supabase.

Allt i appen är på riktigt: konton, profiler, inlägg, bilder, videor, kommentarer, följare, chatt, bud och omdömen sparas i din Supabase-databas och delas mellan alla användare. Appen innehåller ingen exempeldata – den är tom tills folk börjar lägga upp saker.

## Funktioner

- **Inloggning** med engångskod via e-post (inget lösenord), och lösenord för testkonton
- **Profil** med användarnamn, bild, stad och bio, följare, omdömen och radering av konto
- **Hem** med favoriter (de du följer) och flödet. **Videor spelas automatiskt, ljudlöst och i loop** när de syns på skärmen, så man direkt ser att det är en video.
- **Inlägg** med flera bilder/videor, gilla, spara, kommentarer och ljud på/av för video
- **Säljes** med titel, märke, pris, storlek, skick och leverans, samt **Lägg bud**
- **Meddelanden** i realtid med bud, motbud och accepterad affär. Plagget markeras som sålt automatiskt.
- **Omdömen** som köparen lämnar efter en avslutad affär
- **Kamera** för foto och video (max 30 sek), eller flera bilder/videor från biblioteket
- **Utforska** med sökning på plagg, märken och medlemmar, plus filter
- **Rapportera, blockera och användarvillkor**, som App Store kräver för appar med användarinnehåll

Säkerheten ligger i databasen (Row Level Security). Man kan bara ändra sitt eget innehåll, bara läsa sina egna konversationer, och bud kan bara accepteras av mottagaren.

---

## Steg 1 – Skapa databasen (Supabase, gratis)

1. Skapa ett konto på https://supabase.com och klicka **New project**. Välj region **Stockholm (eu-north-1)** om den finns, annars Frankfurt.
2. Gå till **SQL Editor → New query**. Klistra in hela innehållet i [`supabase/schema.sql`](supabase/schema.sql) och klicka **Run**.
3. Gå till **Authentication → Sign In / Providers → Email**. Se till att *Email* är på och att *Confirm email* är på.
4. Gå till **Authentication → Emails → Templates → Magic Link** och byt texten mot nedanstående, så att mejlet innehåller en kod:

   ```html
   <h2>Din kod till ARKIV</h2>
   <p>Ange den här koden i appen:</p>
   <p style="font-size:28px;letter-spacing:6px"><strong>{{ .Token }}</strong></p>
   ```

   Gör samma sak med mallen **Confirm signup**.
5. **Viktigt för riktiga testare:** Supabases inbyggda e-post skickar bara ett fåtal mejl per timme. Koppla en egen e-posttjänst under **Authentication → Emails → SMTP Settings**. [Resend](https://resend.com) är gratis upp till 3 000 mejl/månad.
6. Gå till **Project Settings → API** och kopiera **Project URL** och **anon public key**.

## Steg 2 – Koppla appen

Skapa filen `arkiv-app/.env`. Utgå från `.env.example`:

```
EXPO_PUBLIC_SUPABASE_URL=https://ditt-projekt.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=din-anon-public-nyckel
```

Anon-nyckeln är gjord för att ligga i appen. Säkerheten sköts av reglerna i databasen. Lägg **aldrig** in `service_role`-nyckeln här.

## Steg 3 – Testa på din iPhone

Appen använder kamera och video och behöver därför en egen testversion. Expo Go räcker inte.

```bash
npm install
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --latest
```

Efter någon timme finns appen i **TestFlight**. Där kan du bjuda in upp till 10 000 testare via e-post eller en publik länk. Det är det smidigaste sättet att låta riktiga användare testa innan lanseringen.

Du behöver ett **Apple Developer-konto** (99 USD/år) och ett gratis **Expo-konto**. Ingen Mac behövs.

> Byt först `bundleIdentifier` i `app.json` (`se.arkiv.app`) till ett unikt ID du äger, t.ex. `se.dittnamn.arkiv`. Det går inte att ändra efter första uppladdningen.

## Steg 4 – Skicka in till App Store

I App Store Connect behöver du:

- **Skärmdumpar** för 6,9" iPhone (1320 × 2868), minst 3 st
- **Beskrivning**, nyckelord och kategori (*Livsstil* eller *Shopping*)
- **Integritetspolicy** – en länk till en webbsida (kan vara en enkel sida, t.ex. på Notion)
- **App Privacy**: appen samlar in *E-postadress*, *Namn*, *Foton/videor* och *Annat användarinnehåll*, kopplat till användaren och inte för spårning
- **Åldersgräns**: svara ja på *User Generated Content*
- **Inloggning för granskaren**: skapa en användare i Supabase (**Authentication → Users → Add user**) med e-post och lösenord. Skriv in uppgifterna under *App Review Information*. Granskaren loggar in via "Logga in med lösenord".
- Lägg gärna upp några egna inlägg först, så att granskaren ser en levande app.

## Moderering

Anmälningar hamnar i tabellen `reports` i Supabase (**Table Editor → reports**). Apple kräver att de hanteras inom 24 timmar. Ta bort innehåll som bryter mot reglerna i `items` eller `comments`, och vid behov användaren under **Authentication → Users**.

---

## Kodstruktur

```
supabase/schema.sql   tabeller, säkerhetsregler, bud-logik, lagring
src/app/              skärmar (Expo Router)
  login, onboarding   inloggning och skapa profil
  (tabs)/             Hem, Utforska, Skapa, Meddelanden, Profil
  item/[id]           inlägg eller plagg till salu
  chat/[id]           konversation med bud
  user/[id]           annan användares profil
  camera, compose     fota/filma och publicera
  settings, terms     inställningar och användarvillkor
src/components/       återanvändbara delar (MediaView spelar video)
src/lib/              Supabase-klient, inloggning, API, uppladdning
```

## Kontroller

```bash
npm run typecheck
npx expo export --platform web
```
