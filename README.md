# Vaultcore

A backend banking ledger system designed to simulate reliable account-to-account financial transactions with **double-entry bookkeeping, MongoDB ACID transactions, idempotent processing, and secure authentication**.

Vaultcore focuses on the core backend problems involved in financial systems: maintaining transaction integrity, preventing duplicate transactions, ensuring atomic updates, and keeping an immutable record of account activity.

---

## 🚀 Features

* **Double-Entry Ledger System**

  * Every transfer generates corresponding `DEBIT` and `CREDIT` ledger entries.
  * Ledger entries are immutable to preserve transaction history.

* **Atomic Transactions**

  * MongoDB ACID transactions ensure that account operations and ledger entries either complete together or are completely rolled back.

* **Idempotent Transactions**

  * Supports idempotency keys to prevent duplicate processing when the same request is retried.

* **Transaction State Management**

  * Transactions move through explicit states:

    * `PENDING`
    * `COMPLETED`
    * `FAILED`
    * `REVERSED`

* **JWT Authentication**

  * Secure authentication using JSON Web Tokens.

* **HTTP-Only Cookie Sessions**

  * Authentication tokens are stored in HTTP-only cookies to reduce exposure to client-side scripts.

* **Token Blacklisting**

  * Logged-out tokens can be blacklisted to prevent further use.

* **Account Validation**

  * Validates account ownership, account status, and transaction parameters before processing transfers.

* **Ledger-Based Balance Calculation**

  * Account balances are calculated from ledger entries using MongoDB aggregation rather than storing a mutable balance field.

* **Transaction Notifications**

  * Transaction confirmation emails are triggered after successful transaction commits.

---

## 🏗️ Architecture

```text
                    ┌──────────────────┐
                    │      Client      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Express Server  │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐   ┌───────────┐   ┌──────────┐
        │   Auth   │   │ Accounts  │   │Transfers │
        │  Routes  │   │   Routes  │   │  Routes  │
        └──────────┘   └───────────┘   └────┬─────┘
                                            │
                                            ▼
                                   ┌─────────────────┐
                                   │ MongoDB Session │
                                   │   Transaction   │
                                   └────────┬────────┘
                                            │
                         ┌──────────────────┼──────────────────┐
                         ▼                  ▼                  ▼
                  ┌────────────┐     ┌────────────┐    ┌────────────┐
                  │ Transaction│     │   Ledger   │    │  Accounts  │
                  │   Record   │     │   Entries  │    │            │
                  └────────────┘     └────────────┘    └────────────┘
```

---

## 💳 Double-Entry Ledger

Vaultcore follows the double-entry accounting principle.

For a transfer:

```text
Sender Account                    Receiver Account
      │                                  │
      │ DEBIT                            │ CREDIT
      ▼                                  ▼
┌─────────────┐                    ┌─────────────┐
│ Ledger Entry│                    │ Ledger Entry│
│   - Amount  │                    │   + Amount  │
└─────────────┘                    └─────────────┘
```

Example:

```text
Transfer: ₹500

Sender:
    DEBIT  ₹500

Receiver:
    CREDIT ₹500
```

The account balance is derived as:

```text
Balance = Total Credits - Total Debits
```

This avoids relying on a mutable balance value as the source of truth.

---

## 🔄 Transaction Lifecycle

Each transaction maintains an explicit state.

```text
                 ┌─────────┐
                 │ PENDING │
                 └────┬────┘
                      │
             ┌────────┴────────┐
             ▼                 ▼
       ┌───────────┐      ┌────────┐
       │ COMPLETED │      │ FAILED │
       └───────────┘      └────────┘
             │
             ▼
       ┌──────────┐
       │ REVERSED │
       └──────────┘
```

### States

| State       | Description                                           |
| ----------- | ----------------------------------------------------- |
| `PENDING`   | Transaction has started but has not completed         |
| `COMPLETED` | Transfer and ledger operations completed successfully |
| `FAILED`    | Transaction could not be completed                    |
| `REVERSED`  | A previously completed transaction has been reversed  |

---

## 🔐 Idempotency

Financial APIs must handle retries safely.

For example, a client may send the same request twice because of a network timeout:

```http
POST /api/transactions
Idempotency-Key: tx_12345
```

Instead of creating two transfers, Vaultcore uses the idempotency key to identify the original transaction.

A unique database index is used to enforce uniqueness at the database level:

```js
transactionSchema.index(
    { idempotencyKey: 1 },
    { unique: true }
);
```

This provides protection against concurrent duplicate requests.

---

## 🧾 Database Transactions

Transfers are executed using MongoDB sessions and ACID transactions.

Conceptually:

```text
START TRANSACTION

    Create transaction record
            ↓
    Create DEBIT ledger entry
            ↓
    Create CREDIT ledger entry
            ↓
    Mark transaction COMPLETED

COMMIT
```

If any operation fails:

```text
START TRANSACTION

    Create transaction
            ↓
    Create DEBIT
            ↓
    ❌ CREDIT fails

ROLLBACK
```

This prevents partially completed transfers.

---

## 🔑 Authentication

Vaultcore uses JWT-based authentication.

```text
Login
  │
  ▼
Generate JWT
  │
  ▼
HTTP-Only Cookie
  │
  ▼
Authenticated Requests
```

Authentication includes:

* JWT authentication
* HTTP-only cookies
* Token expiration
* Token blacklisting on logout
* Protected API routes

---

## 🗄️ Data Model

### User

```text
User
 ├── name
 ├── email
 ├── password
 └── authentication data
```

### Account

```text
Account
 ├── user
 ├── status
 └── account metadata
```

### Transaction

```text
Transaction
 ├── fromAccount
 ├── toAccount
 ├── amount
 ├── idempotencyKey
 └── status
```

### Ledger

```text
Ledger
 ├── account
 ├── transaction
 ├── amount
 └── type
       ├── CREDIT
       └── DEBIT
```

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Cookie-based authentication

### Development Tools

* Git
* GitHub
* Postman
* VS Code

---

## 📁 Project Structure

```text
Vaultcore/
│
├── controllers/
│   ├── auth.controller.js
│   ├── account.controller.js
│   └── transaction.controller.js
│
├── models/
│   ├── user.model.js
│   ├── account.model.js
│   ├── transaction.model.js
│   ├── ledger.model.js
│   └── blacklist.model.js
│
├── routes/
│   ├── auth.routes.js
│   ├── account.routes.js
│   └── transaction.routes.js
│
├── middleware/
│   └── auth.middleware.js
│
├── services/
│   └── email.service.js
│
├── app.js
├── server.js
├── package.json
└── .env
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd Vaultcore
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Add any additional email-service credentials required by your configuration.

### 4. Start the development server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:5000
```

---

## 🧪 Testing

API endpoints can be tested using **Postman**.

Important scenarios to test:

* User registration
* User login/logout
* Account creation
* Account validation
* Successful transfers
* Insufficient balance
* Invalid accounts
* Duplicate idempotency keys
* Concurrent duplicate requests
* Transaction rollback
* Failed transactions
* Ledger balance calculation

---

## 🔒 Design Principles

Vaultcore is built around several principles important for financial backend systems:

### 1. Ledger as the Source of Truth

Balances are derived from immutable ledger entries rather than relying on a mutable balance field.

### 2. Atomicity

A transfer should never leave the system in a partially updated state.

### 3. Idempotency

Retrying the same transaction should not create duplicate financial operations.

### 4. Immutability

Ledger records represent historical financial events and should not be modified after creation.

### 5. Explicit State

Transactions have clearly defined lifecycle states instead of relying on implicit success/failure behavior.

### 6. Security

Authentication, authorization, account ownership validation, token expiration, and token blacklisting are used to protect financial operations.

---

## 👨‍💻 Author

**Anand Verma**

B.Tech — Robotics & Automation
National Institute of Technology, Kurukshetra

---

## 📄 License

This project is intended for educational and portfolio purposes.
