# Auth — Authentication & Session Management

ระบบ authentication ของ Jknowledge ใช้ **Clerk** เป็น provider หลัก, ทำ session ผ่าน HTTP-only cookie, mirror user records ลง PostgreSQL เพื่อให้ใช้เป็น foreign key ใน DB ของเราเอง

---

## Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Auth provider | Clerk | OAuth + email/password + session + MFA |
| SDK | `@clerk/nextjs` | React hooks + components + middleware |
| Middleware | `clerkMiddleware` (Edge runtime) | Route protection + session decode |
| Frontend proxy | `/__clerk/*` | First-party cookie domain (anti 3rd-party block) |
| Webhook | `/api/webhooks/clerk` | Sync user lifecycle → PostgreSQL |
| Mirror DB | Prisma `User` table | FK reference สำหรับ PredictionHistory, MBTIResult |

---

## Sign-in / Sign-up methods

### OAuth (recommended)

ใช้ Clerk Future API `signIn.sso()` / `signUp.sso()`:

```ts
await signIn.sso({
  strategy: "oauth_google",
  redirectUrl: "/",                          // final destination after auth
  redirectCallbackUrl: "/sign-in/sso-callback",  // intermediate OAuth callback
})
```

**Providers ที่เปิดอยู่ใน Clerk Dashboard:**

| Order | Provider | Strategy key | Visual treatment |
|-------|----------|--------------|------------------|
| 1 | Google | `oauth_google` | Full-width white button + multi-color G |
| 2 | LINE | `oauth_line` | Full-width green (#06C755) + white logo |
| 3 | Apple | `oauth_apple` | Icon-only black button |
| 3 | Facebook | `oauth_facebook` | Icon-only blue (#1877F2) button |
| 3 | X / Twitter | `oauth_x` | Icon-only black button |

**Ordering rationale:** Google ก่อน (universal recognition) + LINE (Thai-context primary) Apple/Facebook/X เป็น tertiary icon-only ลด visual noise

### Email + password

Fallback option ที่อยู่ใต้ OAuth + `── หรือใช้อีเมล ──` divider

```ts
// Sign-up
await signUp.password({ emailAddress, password, firstName, lastName })

// Sign-in
await signIn.password({ identifier: email, password })
```

### Email verification

- **Sign-up verification: ปิดอยู่** ใน Clerk Dashboard (เพื่อลด friction) → ถ้า `signUp.status === "complete"` หลัง password → finalize ทันที
- **Sign-in OTP (MFA): เปิดอยู่** สำหรับ sign-in step 2

---

## Routes structure

| Route | Type | Protected | Notes |
|-------|------|-----------|-------|
| `/` `/analyze` `/scores` `/mbti` | Public | ❌ | ใช้ได้โดยไม่ต้อง login |
| `/dashboard` `/profile/*` | Protected | ✅ | redirect ไป `/sign-in` ถ้าไม่ login |
| `/sign-in` | Custom UI | — | Multi-step: `credentials` → `mfa` |
| `/sign-up` | Custom UI | — | Multi-step: `details` → `verify` |
| `/sign-in/sso-callback` | OAuth return | — | Handled by Clerk SDK |
| `/sign-up/sso-callback` | OAuth return | — | Handled by Clerk SDK |
| `/sign-in/forgot-password` | Custom UI | — | 3-step: email → code → new password |
| `/sign-in/sso-callback` | OAuth return | — | finalize() → redirect "/" |
| `/sign-up/sso-callback` | OAuth return | — | migrate pending + finalize() → redirect "/" |
| `/__clerk/*` | Frontend API proxy | — | Passthrough ไป clerk.com |
| `/api/webhooks/clerk` | Webhook | Svix only | User lifecycle sync |

---

## File structure

```
src/
├── proxy.ts                              # clerkMiddleware + protected route matcher
│
├── app/
│   ├── __clerk/[...path]/route.ts        # Frontend API proxy (first-party cookies)
│   ├── api/webhooks/clerk/route.ts       # Webhook handler (Svix verified)
│   ├── sign-in/
│   │   ├── [[...sign-in]]/page.tsx       # Custom sign-in UI (credentials → MFA)
│   │   ├── sso-callback/page.tsx         # OAuth return → finalize session
│   │   └── forgot-password/page.tsx      # 3-step password reset
│   ├── sign-up/
│   │   ├── [[...sign-up]]/page.tsx       # Custom sign-up UI (details → verify)
│   │   └── sso-callback/page.tsx         # OAuth return → migrate pending + finalize
│   └── profile/
│       ├── page.tsx                      # Custom profile page (stats + avatar + name)
│       └── _components/
│           ├── avatar-upload.tsx         # user.setProfileImage()
│           ├── edit-name-form.tsx        # user.update({ firstName, lastName })
│           └── sign-out-button.tsx       # useClerk().signOut()
│
├── components/layout/
│   └── profile-avatar-link.tsx          # Avatar in header → /profile (replaces UserButton)
│
├── features/analyze/components/
│   └── analyze-form.tsx                 # writePendingHistory() after each analysis
│
└── server/
    └── actions.ts                        # analyzeAction + savePendingHistoryAction
```

---

## State machines

### Sign-in flow

```
[credentials step]
   │
   ├─ user click OAuth provider → signIn.sso({strategy}) → redirect to provider
   │                                                       ↓
   │                            [external OAuth consent screen]
   │                                                       ↓
   │                            redirect back → /sign-in/sso-callback
   │                                                       ↓
   │                            Clerk finalize → session created → redirect to "/"
   │
   └─ user submit email + password → signIn.password({...})
                                            │
                                            ├─ status === "complete" → finalize() → "/"
                                            │
                                            └─ status === "needs_second_factor"
                                               or "needs_client_trust"
                                                  ↓
                                            [mfa step]
                                                  ↓
                                            signIn.mfa.verifyEmailCode({code})
                                                  ↓
                                            finalize() → "/"
```

### Sign-up flow

```
[details step]
   │
   ├─ user click OAuth provider → signUp.sso({strategy}) → redirect to provider
   │                                                       ↓
   │                            [external OAuth consent screen]
   │                                                       ↓
   │                            redirect back → /sign-up/sso-callback
   │                                                       ↓
   │                            Clerk finalize → "user.created" webhook fires
   │                                          → DB sync (see Webhook section)
   │
   └─ user submit firstName + lastName + email + password → signUp.password({...})
                                            │
                                            ├─ status === "complete" (verification ปิดใน dashboard)
                                            │      → finalize() → "/"
                                            │
                                            └─ status !== "complete"
                                                  ↓
                                            signUp.verifications.sendEmailCode()
                                                  ↓
                                            [verify step]
                                                  ↓
                                            signUp.verifications.verifyEmailCode({code})
                                                  ↓
                                            finalize() → "/"
```

---

## Webhook — User lifecycle sync

**Endpoint:** `POST /api/webhooks/clerk`
**Verification:** Svix signature ทุก request ใช้ `CLERK_WEBHOOK_SECRET` env

### Events handled

| Event | Action |
|-------|--------|
| `user.created` | `prisma.user.upsert({ clerkId, email, name })` |
| `user.updated` | `prisma.user.upsert({ clerkId, email, name })` |
| `user.deleted` | `prisma.user.deleteMany({ clerkId })` → cascade PredictionHistory |

### Defensive upsert ใน Server Actions

`analyzeAction` ทำ `prisma.user.upsert({ clerkId })` ก่อนสร้าง `PredictionHistory` ป้องกัน race condition ระหว่าง user สมัครเสร็จ + webhook ยังไม่ fire

```ts
// src/server/actions.ts
const { userId: clerkId } = await auth()
if (clerkId) {
  const user = await prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId },
  })
  await prisma.predictionHistory.create({ data: { userId: user.id, ... } })
}
```

---

## Protected route middleware

```ts
// src/proxy.ts
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/profile(.*)",
])

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect()   // redirect to /sign-in if no session
  }
})
```

เพิ่ม protected route ได้ที่ `createRouteMatcher` array

---

## Database integration

### User table (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String?  @unique   // mirror จาก Clerk
  email     String?  @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  predictions PredictionHistory[]
}
```

**ทำไมต้อง mirror?**
- Foreign key ต้องชี้ table ของเราเอง (referential integrity)
- `ON DELETE CASCADE` บน PredictionHistory.userId
- Query history ผ่าน Prisma ได้โดยตรง ไม่ต้องเรียก Clerk API ทุกครั้ง

### Related tables ที่ใช้ User FK

- `PredictionHistory.userId` → `CASCADE` (ลบ user → ลบ history)
- `MBTIResult.userId` → `nullable` (anonymous results เก็บไว้ได้)

---

## Environment variables

```bash
# Public (client + server)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Server only
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...      # จาก Clerk dashboard → Webhooks
```

---

## UI components

### Detect signed-in state

```tsx
// Clerk SDK declarative pattern
<Show when="signed-in">
  <UserButton />
</Show>
<Show when="signed-out">
  <Link href="/sign-in">เข้าสู่ระบบ</Link>
</Show>

// Hook pattern
const { isSignedIn } = useAuth()
```

### Server-side check (Server Component / Server Action)

```ts
import { auth, currentUser } from "@clerk/nextjs/server"

const { userId: clerkId } = await auth()
const user = await currentUser()
```

### Avatar link (แทน UserButton)

ใช้ `<ProfileAvatarLink>` ใน header + mobile-menu แทน Clerk's `<UserButton>`
- แสดงรูป user จาก `useUser().user.imageUrl` หรือ initials ถ้าไม่มีรูป
- กดแล้วไปหน้า `/profile` แทนการเปิด popup
- ดู `src/components/layout/profile-avatar-link.tsx`

---

## Edge cases & known issues

### 1. Anonymous → authed migration ✅
หลัง analyze, result บันทึกลง `sessionStorage.jknowledge:pending-save:v1` — sign-up `finalize()` อ่านและเรียก `savePendingHistoryAction` ก่อน redirect

### 2. `/sign-in/forgot-password` ✅
3-step flow: email → OTP code → new password (`resetPasswordEmailCode.*`)

### 3. Email update webhook (TODO)
Webhook handle `user.created` `user.updated` `user.deleted` — แต่ไม่ handle `email.created` `email.updated` Edge case ถ้า user เปลี่ยน primary email ใน Clerk dashboard → DB stale

### 4. MFA recovery ✅
MFA step มี toggle "ไม่มีรหัส OTP? ใช้ backup code" — ใช้ `signIn.mfa.verifyBackupCode({ code })`

### 5. Sign-up validation feedback ✅
Password strength bar แสดง client-side ทันทีขณะพิมพ์ (4 ระดับ: short / weak / fair / strong)

---

## Testing checklist

- [ ] Sign-up ด้วย email + password → user record ใน DB
- [ ] Sign-up ด้วย Google → user record ใน DB
- [ ] Sign-up ด้วย LINE → user record ใน DB
- [ ] Sign-in ด้วย email + password → session cookie set
- [ ] Sign-in ด้วย OAuth → redirect callback → final destination
- [ ] MFA OTP flow (ถ้า enabled)
- [ ] Sign-out → cookie cleared
- [ ] Access `/dashboard` without login → redirect `/sign-in`
- [ ] Access `/dashboard` with login → render
- [ ] User lifecycle webhook → DB sync ภายใน <2s
- [ ] User.deleted → cascade ลบ PredictionHistory

---

## ที่ควรปรับปรุง (priority order)

1. ~~**Anonymous data migration**~~ ✅ — sign-up AND sign-in finalize + OAuth sso-callback
2. ~~**Forgot password page**~~ ✅ — `/sign-in/forgot-password` (3-step)
3. ~~**SSO callback pages missing**~~ ✅ — `/sign-in/sso-callback` + `/sign-up/sso-callback`
4. ~~**Password validation client-side**~~ ✅ — strength bar ใน sign-up
5. **Email update webhook** — `user.updated` ครอบ primary email change แล้ว แต่ยังไม่ handle non-primary email events
6. **Account deletion flow** — ยังไม่มี UI สำหรับลบบัญชี

---

## References

- [Clerk Future API docs](https://clerk.com/docs/references/javascript/sign-in/sign-in)
- [Clerk Webhooks docs](https://clerk.com/docs/integrations/webhooks/overview)
- `src/proxy.ts` — middleware config
- `src/app/api/webhooks/clerk/route.ts` — webhook handler
- `src/features/auth/` — auth UI components
- `prisma/schema.prisma` — User table schema
