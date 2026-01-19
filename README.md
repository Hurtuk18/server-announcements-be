# 📢 Server Announcements – Backend

BE service pre oznámenia - announcements.

Service poskytuje REST API pre vytváranie, aktualizáciu a výpis oznámení. Tiež poskytuje **definitions endpoint**, ktorý je využívaný FE pre jednoduchšie prepojenie BE a FE.

---

## 🧰 Tech stack

* **Node.js + TypeScript**
* **Express**
* **PostgreSQL**
* **Prisma ORM**
* **Swagger / OpenAPI (YAML)**
* **Docker (PostgreSQL only)**

---

## 📦 API Endpointy

### GET /announcements
Získa zoznam oznámení.

Podporované query parametre:
- `search` – textové vyhľadávanie v title a content
- `categories` – zoznam kategórií (vráti záznamy, ktoré obsahujú aspoň jednu z nich)
- `sort` – stĺpec na triedenie (`title`, `publicationDate`, `lastUpdate`)
- `order` – poradie triedenia (`asc`, `desc`)

---

### GET /announcements/:id
Získa detail jedného oznámenia podľa ID.

Používa sa na:
- predvyplnenie dát pri editácii oznámenia

---

### POST /announcements
Vytvorí nové oznámenie.

Body requestu obsahuje:
- `title`
- `content`
- `publicationDate`
- `categories` (pole kódov kategórií)

ID nového záznamu je vrátené v response a taktiež daný záznam.

---

### PUT /announcements/:id
Upraví existujúce oznámenie podľa ID.

Umožňuje aktualizovať:
- title
- content
- publicationDate
- categories

Vráti daný updatnutý záznam.

---

### DELETE /announcements/:id
Vymaže oznámenie podľa ID.

---

### GET /announcements/definitions
Vráti konfiguračné a meta informácie pre frontend.

Obsahuje:
- definície polí (typ, label, required, sortable, default)
- enum hodnoty pre kategórie
- defaultné triedenie zoznamu
- povolené hodnoty pre sort a order

Endpoint je určený na zostavovanie filtrov a formulárov na FE.

---

## ⚙️ Konfigurácia

Servica používa dvojicu konfiguračných súborov vo formáte YAML:

```
/src/config/config_announcements.yaml
/src/config-basic/config-basic_announcements.yaml
```

Prvý konfiguračný súbor používa taktiež custom **ConfigValidator** (io-ts based) na validáciu pri spustení service
Všetky parametre sú brané ako mandatory a musia byť správne nastavené (viď /src/config/config_announcements.yaml).

Druhý konfiguračný súbor je využívaný pre **definitions endpoint** a obsahuje základné nastavenia (field names, enums, defaults). Je ľahko rozšíriteľný v prípade potreby ďalších polí.

Taktiež potrebujeme .env pre prisma:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/announcements_db?schema=public"
```

---

## 🗄 Databáza

Zvolil som si PostgreSQL nakoľko mám s touto DB skúsenosti a je dobre podporovaná v rámci Prisma ORM.
PostgreSQL beží pomocou Docker Compose.

### Spustenie db

```bash
npm run db:up
```

### Zastavenie db

```bash
npm run db:down
```

### Spustenie migrácií a seed dát

```bash
npx prisma migrate dev
npx prisma db seed
```

---

## 🚀 Spustenie server-announcements-be lokálne

### Install dependencies

```bash
npm install
```

### Spustenie development server

```bash
npm run dev
```

Service používa port **3001** ako default (viď /src/config/config_announcements.yaml)

Swagger UI je k dispozícií na adrese:

```
http://localhost:3001/docs/server-announcements-be
```

---

## 🧪 Ďalšie info:

* Service som nedockerizoval nakoľko ide o lokálnu service, nakoľko som sa to snažil udržať jednoduché a sústredil som sa na požiadavky zadania.
* Iba PostgreSQL mám v Dockeri.
* Swagger API je definovaný pomocou yaml súboru v /api/announcements-openapi.yaml
* Taktiež som BE service robil ako celkok v rámci jedného dňa a teda som to priebežne necommitoval (nakoľko som to v zadaní prehliadol - moja chyba). S GIT-om ale skúsenosti mám, využívam ho priamo v práci.
* Záznamy sa namockujú pomocou seed skriptu

---

## 🚧 Možné vylepšenia / budúci vývoj

* Pridať autentifikáciu a autorizáciu (napr. JWT)
* Vytvorenie Unit a Integration testov (napr. Jest + Supertest)

---

## 🧪 Testovanie REST API (Postman)

REST API backendu je možné jednoducho otestovať pomocou nástroja **Postman** (alebo podobného HTTP klienta).

---

### Predpoklady
- Backend service je spustený pomocou:
  ```bash
  npm run dev
  ```
- Server beží na adrese:
  ```
  http://localhost:3001
  ```
- Databáza je spustená a naplnená dátami (migrácie + seed).

---

### GET /announcements/definitions
Získa konfiguračné a meta informácie pre frontend (definície polí, enum hodnoty, defaultné triedenie).

```
GET http://localhost:3001/announcements/definitions
```

---

### GET /announcements
Získa zoznam oznámení.

```
GET http://localhost:3001/announcements
```

Voliteľné query parametre:
- `search` – textové vyhľadávanie v title a content
- `categories` – zoznam kategórií (OR logika)
- `sort` – pole na triedenie (`title`, `publicationDate`, `lastUpdate`)
- `order` – poradie triedenia (`asc`, `desc`)

Príklad:
```
GET http://localhost:3001/announcements?search=city&categories=CITY&sort=lastUpdate&order=desc
```

---

### POST /announcements
Vytvorí nové oznámenie.

```
POST http://localhost:3001/announcements
```

Headers:
```
Content-Type: application/json
```

Body:
```json
{
  "title": "Test announcement",
  "content": "This is a test announcement created via Postman.",
  "publicationDate": "01/20/2026 10:00",
  "categories": ["CITY", "HEALTH"]
}
```

---

### GET /announcements/:id
Získa detail oznámenia podľa ID (môžeme získať z POST resonse alebo z GET http://localhost:3001/announcements).

```
GET http://localhost:3001/announcements/{id}
```

---

### PUT /announcements/:id
Upraví existujúce oznámenie (ID môžeme získať z POST resonse alebo z GET http://localhost:3001/announcements).

```
PUT http://localhost:3001/announcements/{id}
```

Body:
```json
{
  "title": "Updated title",
  "content": "Updated content",
  "publicationDate": "01/21/2026 11:30",
  "categories": ["COMMUNITY_EVENTS"]
}
```

---

### DELETE /announcements/:id
Vymaže oznámenie podľa ID (môžeme získať z POST resonse alebo z GET http://localhost:3001/announcements)..

```
DELETE http://localhost:3001/announcements/{id}
```

---

### Swagger UI
Kompletná dokumentácia REST API je dostupná na:

```
http://localhost:3001/docs/server-announcements-be
```

