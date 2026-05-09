# EBook-Na Feature Implementation Checklist

Last updated: 2026-05-07

## Legend

- [x] Completed
- [~] Partially implemented / in progress
- [ ] Not started

---

## Completed in Current Session

- [x] RBAC route protection in `src/app/routes.tsx`
- [x] RoomSearch advanced filters in `src/app/pages/customer/RoomSearch.tsx`
  - [x] Room type filter
  - [x] Amenities filter
  - [x] Rating/filter UX improvements
- [x] Booking flow completion in `src/app/pages/customer/Booking.tsx`
  - [x] Booking success modal details
  - [x] Payment breakdown (tax, service fee, promo)
  - [x] Stronger field-level validation
  - [x] Booking summary/amenities UI improvements

---

## Critical - Remaining

### Customer

- [ ] Real-time notifications system in `src/app/pages/customer/Notifications.tsx`
- [ ] Notification type integration (booking, cancellation, reminders, in-app/email/realtime)

### Admin

- [ ] Room image upload/gallery/reorder in `src/app/pages/admin/RoomManagement.tsx`
- [ ] Approve/reject reservation workflow in `src/app/pages/admin/ReservationManagement.tsx`
- [ ] Refund management system
- [ ] Real-time dashboard sync in `src/app/pages/admin/AdminDashboard.tsx`
- [ ] Availability calendar view (new component/page)

### System / Infrastructure

- [ ] Email verification flow in `src/app/pages/auth/Register.tsx`
- [ ] Payment gateway integration in `src/app/services/paymentService.ts` (new)
- [ ] Payment status tracking + webhook handling
- [ ] Automatic room availability updates and anti-double-booking in `src/app/context/AppContext.tsx`
- [ ] Error boundary in `src/app/components/ErrorBoundary.tsx` (new)

---

## Important - Remaining

### Customer

- [ ] Logout confirmation modal
- [ ] Promotions/offers banner
- [ ] Popular room categories
- [ ] Booking history filters
- [ ] Receipt download/email
- [ ] Favorites/wishlist system
- [ ] Reviews and ratings

### Admin

- [ ] Bulk operations
- [ ] Customer activity tracking
- [ ] Account disable/delete
- [ ] Data export to CSV
- [~] Monthly statistics (basic charts exist; needs dynamic logic + export)

### System

- [ ] Smart hotel recommendations
- [ ] Reports PDF/Excel export
- [ ] Custom date range filtering
- [ ] Calendar picker component
- [ ] Notification card component

---

## Still Partially Implemented (Need Follow-up)

- [~] Forgot password flow in `src/app/pages/auth/ForgotPassword.tsx`
- [~] Form validation consistency across `src/app/pages/auth/*` and booking-related flows

---

## Suggested Next Batches

1. Notifications + reservation status events
2. Admin reservation approve/reject + availability updates
3. Email verification + forgot password completion
4. Payment service scaffold + status tracking

