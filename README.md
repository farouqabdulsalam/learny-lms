# Learny

A MERN-style Learning Management System with student, instructor, and admin workspaces.

## Included
- Student / Instructor / Both registration
- Student and instructor mode switching
- Admin course approval/rejection workflow and notifications
- Instructor course editing, deletion, resubmission and lesson builder
- Student dashboard with progress, completion and certificates
- Premium course protection
- Ratings and reviews after course completion
- Course search, level filters and sorting
- Admin analytics counters
- Login rate limiting and server-side permission enforcement
- Udemy external course links
- Development instructor activation gate
- Optional Paystack instructor-plan checkout (requires `PAYSTACK_SECRET_KEY`)
- No Gmail verification or SMTP dependency

## Setup
1. Create `server/.env` from `.env.example`.
2. Start MongoDB locally.
3. Run `npm install --prefix server` and `npm install --prefix client`.
4. Run `npm run seed --prefix server`.
5. Run `npm run dev --prefix server`.
6. In another terminal run `npm run dev --prefix client`.

For real Paystack checkout, add a valid secret key to `server/.env`:
`PAYSTACK_SECRET_KEY=sk_test_...` or the production key when ready.

Without a Paystack key, the development test activation remains available.
