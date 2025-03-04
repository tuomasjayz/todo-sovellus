# Todo-sovellus

Moderni tehtävienhallintasovellus, joka auttaa sinua pysymään organisoituna ja tehokkaana.

## Ominaisuudet

- **Tehtävien hallinta**: Lisää, muokkaa, poista ja merkitse tehtäviä valmiiksi
- **Priorisointi**: Aseta tehtäville prioriteetti (matala, normaali, korkea)
- **Kategoriat**: Järjestä tehtävät kategorioihin (työ, henkilökohtainen, opiskelu, harrastukset)
- **Määräajat**: Aseta tehtäville määräpäivät ja näe myöhässä olevat tehtävät
- **Tärkeät tehtävät**: Merkitse tehtäviä tähdellä tärkeiksi
- **Suodatus**: Suodata tehtäviä kategorian, prioriteetin ja tilan mukaan
- **Haku**: Etsi tehtäviä tekstihaulla
- **Järjestäminen**: Järjestä tehtävät luontipäivän, määräpäivän, prioriteetin tai kategorian mukaan
- **Tilastot**: Näe yhteenveto tehtävistäsi ja edistymisestäsi

## Teknologiat

- **Frontend**: Next.js 15, React 19, TypeScript
- **Tyylit**: Tailwind CSS
- **Tietokanta**: Supabase (PostgreSQL)
- **Autentikaatio**: Supabase Auth
- **Ilmoitukset**: React Hot Toast
- **Hosting**: Netlify, sovelllukseen pääsee osoitteessa: todosovellus.netlify.app

## Käyttöönotto

1. Kloonaa repositorio
2. Asenna riippuvuudet: `npm install`
3. Kopioi `.env.example` tiedosto nimellä `.env` ja täytä Supabase-tunnukset
4. Käynnistä kehityspalvelin: `npm run dev`
5. Avaa [http://localhost:3000] tai todosovellus.netlify.app (hosting-versio) selaimessasi

## Kirjautuminen

Sovellus käyttää Supabase-autentikaatiota. Voit kirjautua sisään:

1. Rekisteröitymällä sähköpostiosoitteella ja salasanalla
2. Käyttämällä Magic Link -kirjautumista (sähköpostilinkki)

Ensimmäisellä käyttökerralla sinun tulee rekisteröityä luomalla tili.

## Tietokannan asetukset

Sovellus vaatii Supabase-projektin, jossa on `todos`-taulu seuraavilla kentillä:

```sql
CREATE TABLE todos (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT NOT NULL,
  category TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  important BOOLEAN DEFAULT FALSE
);

-- Indeksit suorituskyvyn parantamiseksi
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_todos_important ON todos(important);
```

## Kehitys

- Käynnistä kehityspalvelin: `npm run dev`
- Rakenna tuotantoversio: `npm run build`
- Käynnistä tuotantoversio: `npm run start`
- Tarkista koodin laatu: `npm run lint`
