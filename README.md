# ServiceVPN DEMO

⚠️ Note: This is a demonstrational project. Some files and security-sensitive logic are intentionally excluded from the repository. Its purpose is to showcase my backend development skills, project structure approach, and real-world experience with VPN services.

ServiceVPN is a commercial VPN management system built with [NestJS](https://nestjs.com), raw SQL via [pg](https://node-postgres.com/) and [PostgreSQL](https://www.postgresql.org). It exposes a Telegram bot for user interaction and integrates with [Xray](https://github.com/XTLS/Xray-core) (VLESS + Reality) to provide secure VPN connections.

---

## Key Features

- **Secure VPN** – hides traffic and bypasses censorship using Xray with VLESS + Reality.
- **Telegram Bot Control** – purchase, renewal and subscription status are handled via Telegram.
- **Data Storage** – PostgreSQL stores users, subscriptions, payments and VPN profiles.
- **Minimal Stack** – no ORM is used; all queries go through DAO classes for full control.

---

## Technology Stack

- **NestJS** – backend framework for Node.js
- **PostgreSQL** – reliable relational database
- **pg** – Node.js PostgreSQL client
- **Xray** – modern proxy/VPN software
- **Telegram Bot API** – user management
- **dotenv** – loads environment variables

---

## Project Structure

```plaintext
├── code/
│   ├── app/                 # Root application module
│   ├── common/              # Utilities, constants and types
│   ├── config/              # Environment configuration providers
│   ├── database/            # Database module and DAO layer
│   ├── payments/            # Payment handling
│   ├── subscription/        # Subscription logic
│   ├── telegram/            # Telegram bot controllers and services
│   ├── xray/                # Xray client helpers and monitoring
│   └── ...
├── settings/                # Xray config and environment files
├── Dockerfile               # Production container
├── docker-compose.yml       # Local development setup
└── package.json
```

---

## Environment Configuration

Create an `.env` file based on the template below and place it under `settings/envs/` (git ignored):

```ini
# Telegram
TELEGRAM_TOKEN=

# Application
PORT=3000
LOG_LEVEL_KEY=info
DEVICES_LIMIT=1
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=vpn_admin
DB_PASSWORD=your_password
DB_NAME=vpn_service_dev

# VPS for development
VPS_DEV_HOST=127.0.0.1
VPS_DEV_USERNAME=root
VPS_DEV_PRIVATE_KEY_PATH=~/.ssh/id_rsa

# Xray
XRAY_CONFIG_PATH=/usr/local/etc/xray/config.json
XRAY_LOGS_PATH=/usr/local/etc/xray/logs
XRAY_FLOW=xtls-rprx-vision
XRAY_PUBLIC_KEY=
XRAY_SNI=
XRAY_LISTEN_ADDRESS=vpn.example.com
XRAY_LINK_TAG=

# Robokassa (payment system)
ROBO_PAYMENT_URL=https://auth.robokassa.ru/Merchant/Index.aspx
ROBO_MERCHANT_LOGIN=
ROBO_CULTURE=ru
ROBO_PASSWORD_CHECK=
ROBO_PASSWORD_PAY=
```

> **Note:** real environment values must never be committed to the repository.

---

## Database Access

The DAO layer uses `pg.Pool` with plain SQL queries:

```ts
await this.db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

Advantages:

- Transparent SQL – no hidden logic from an ORM
- Full control over performance and indexes

---

## Migrations

Database migrations can be handled manually or via [node-pg-migrate](https://github.com/salsita/node-pg-migrate).
Example command:

```bash
npx node-pg-migrate up
```

Configuration can be provided either in `migration.config.js` or in `package.json`.

---

## Simplified SQL Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan VARCHAR(50),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE telegram_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  telegram_id BIGINT UNIQUE NOT NULL,
  is_bot BOOLEAN,
  language_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Running the Project

- **Development**
  ```bash
  yarn start:dev
  ```
- **Production build**
  ```bash
  yarn start:prod
  ```

Alternatively, you can use `docker-compose up` to run the application alongside Xray in containers.

---

## Conclusion

ServiceVPN aims for simplicity and performance while remaining easy to support. Direct SQL via DAO gives developers complete control and visibility over database queries.

⚠️ Note: This is a demonstrational project. Some files and security-sensitive logic are intentionally excluded from the repository. Its purpose is to showcase my backend development skills, project structure approach, and real-world experience with VPN services.