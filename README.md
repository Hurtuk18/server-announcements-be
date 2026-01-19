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

* `GET /announcements` – fetchovanie zoznamu oznámení (search, categories, sorting)
* `GET /announcements/:id` – fetch jedného oznámenia podľa ID
* `POST /announcements` – vytvorenie nového oznámenia
* `PUT /announcements/:id` – update oznámenia
* `DELETE /announcements/:id` – vymazanie oznámenia
* `GET /announcements/definitions` – metadata pre FE (fields, enums, defaults)

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

---
