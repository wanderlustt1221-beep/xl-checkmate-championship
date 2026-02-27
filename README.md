# XL Classes – Under 19 Chess Championship Registration

> **Learn Today · Lead Tomorrow**

A premium, production-ready registration page built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and MongoDB.

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env.local` in the project root:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/xl-chess?retryWrites=true&w=majority
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000/register](http://localhost:3000/register)

---

## 📁 File Structure

```
├── app/
│   ├── register/
│   │   └── page.tsx          # Premium registration UI
│   └── api/
│       └── register/
│           └── route.ts      # POST API with validation
├── models/
│   └── Player.ts             # Mongoose schema & model
├── lib/
│   └── mongodb.ts            # Singleton DB connection
├── components/
│   └── ui/
│       └── Input.tsx         # Reusable typed input/select
└── .env.local                # MONGODB_URI (create manually)
```

---

## 📋 Form Fields

| Field         | Type   | Validation                        |
| ------------- | ------ | --------------------------------- |
| Full Name     | Text   | Required                          |
| Age           | Number | Required, must be < 19            |
| Gender        | Select | Required (Male / Female / Other)  |
| Date of Birth | Date   | Required                          |
| Class         | Select | Required (Class 2–12, 12 Passout) |
| School Name   | Text   | Optional                          |
| Mobile        | Tel    | Required, unique, 10-digit Indian |

---

## 🗄 Database Model

```ts
{
  fullName:   String   // required
  age:        Number   // required, max 18
  gender:     String   // Male | Female | Other
  dob:        Date     // required
  class:      String   // Class 2 … 12 Passout
  schoolName: String   // optional
  mobile:     String   // unique, Indian format
  status:     String   // "registered" (default)
  createdAt:  Date     // auto via timestamps
}
```

---

## 🎨 Design Highlights

- **Dark luxury theme** — `#0a0a0a` with chessboard pattern background
- **Gold accents** — `#facc15` throughout (borders, CTAs, icons)
- **Glassmorphism card** — `backdrop-filter: blur` with subtle borders
- **Cinzel serif** font for headings — classic, championship feel
- **Staggered field animations** — each field fades in sequentially
- **Animated success card** — checkmark draw + orbiting chess piece
- **Toast notifications** — slide-in from right for success/error
- **Gold glow button** — shimmer effect on hover
- **Input focus glow** — yellow ring highlight on focus

---

## ⚙️ API Reference

### `POST /api/register`

**Request body:**

```json
{
  "fullName": "Arjun Sharma",
  "age": 15,
  "gender": "Male",
  "dob": "2009-04-12",
  "class": "Class 10",
  "schoolName": "Delhi Public School",
  "mobile": "9876543210"
}
```

**Success (201):**

```json
{ "success": true, "message": "Registration successful!", "playerId": "..." }
```

**Validation error (422):**

```json
{
  "success": false,
  "errors": { "age": "Age must be less than 19 to participate." }
}
```

**Duplicate mobile (409):**

```json
{
  "success": false,
  "errors": { "mobile": "This mobile number is already registered." }
}
```

---

## 📦 Key Dependencies

```json
{
  "next": "^14.0.0",
  "react": "^18",
  "typescript": "^5",
  "mongoose": "^8",
  "tailwindcss": "^3"
}
```
