# Security Specification - Janani

## Data Invariants
1. Users can only read and write their own profile and subcollections.
2. Emergency alerts created by a user are permanently linked to that user.
3. Journal entries must have a userId matching the authenticated user.
4. Medical reports must have a userId matching the authenticated user.
5. All IDs must match standard alphanumeric patterns.

## The Dirty Dozen Payloads (Rejection Targets)
1. Write to another user's profile.
2. Inject a 2MB string into a journal entry.
3. Create a journal entry without a valid userId.
4. Modify `userId` field on update of a report.
5. Set `isLaborWatchEnabled` to true on another user's document.
6. Access `/users/{otherUserId}/alerts` without being that user.
7. Inject special characters in document IDs.
8. Update a finished emergency alert status if not authorized.
9. Create a user document with a fake `uid`.
10. Blanket read all user journals.
11. Inject an array of 10,000 tags into a journal entry.
12. Modify `createdAt` after document creation.
