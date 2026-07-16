# Security Specification for CampusOS Student Profile

This security specification outlines the access control constraints and data validation rules for the user profiles in Cloud Firestore.

## 1. Data Invariants
- **Identity Invariant**: A user profile document located at `/users/{userId}` can only be read, created, or updated if the authenticated user's UID matches the `{userId}` path parameter.
- **Type Safety**: Field values must strictly match their expected primitive types (e.g., `name` must be string, `cgpa` must be a number, `darkMode` must be boolean).
- **Temporal Invariant**: The `updatedAt` field must align with `request.time` when updated (if present).
- **Immutability**: Once registered, critical identity links cannot be modified by other users.

## 2. The "Dirty Dozen" Malicious Payloads
Here are 12 specific payloads designed to breach Identity, Integrity, and State boundaries, all of which must return `PERMISSION_DENIED`.

1. **Self-Access Bypass**: User A (`user-123`) attempts to read User B's profile (`/users/user-456`).
2. **Profile Spoofing**: User A (`user-123`) attempts to write to `/users/user-456` with their own information.
3. **No Auth Creation**: An unauthenticated request attempts to create a document under `/users/test-user`.
4. **Incorrect Data Type (CGPA as String)**: User A attempts to write a CGPA as a string `"3.65"` instead of number `3.65`.
5. **Incorrect Data Type (DarkMode as String)**: User A attempts to write `darkMode` as `"true"` instead of a boolean `true`.
6. **Volumetric Overflow (Massive Name)**: User A attempts to write a display name that is longer than 256 characters.
7. **Volumetric Overflow (Massive University)**: User A attempts to write a university name longer than 256 characters.
8. **Negative CGPA**: User A attempts to set `cgpa` to a negative value or a value greater than 4.0.
9. **Missing Required Fields**: User A attempts to create a profile without the required `major` field.
10. **Shadow Field Injection**: User A attempts to save unexpected system fields like `isCloudAdmin: true` or `verifiedStatus: "bypass"`.
11. **Malformed Document ID**: User A attempts to create a profile with a malformed ID such as `/users/user_abc%20123$`.
12. **Null/Undefined Email Override**: User A attempts to override their own auth state or profile with completely blank entries.

## 3. Verified Security Outcomes
The rules defined in `firestore.rules` must reject all of these payloads automatically.
