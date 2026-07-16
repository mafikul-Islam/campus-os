import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserProfile } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Standard Firestore error handler required for real-time and secure tracking
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Defensive sanitizer to prevent payload size/type violations before writing to Firestore
 */
export function sanitizeUserProfile(profile: UserProfile): UserProfile {
  const sanitized: UserProfile = {
    ...profile,
    name: (profile.name || '').substring(0, 128),
    university: (profile.university || '').substring(0, 128),
    major: (profile.major || '').substring(0, 128),
  };
  
  if (profile.studentId) sanitized.studentId = profile.studentId.substring(0, 64);
  if (profile.batch) sanitized.batch = profile.batch.substring(0, 64);
  if (profile.section) sanitized.section = profile.section.substring(0, 64);
  if (profile.semester) sanitized.semester = profile.semester.substring(0, 64);
  if (profile.avatarUrl) sanitized.avatarUrl = profile.avatarUrl.substring(0, 2048);
  if (profile.universityLogoUrl) sanitized.universityLogoUrl = profile.universityLogoUrl.substring(0, 2048);
  if (profile.departmentLogoUrl) sanitized.departmentLogoUrl = profile.departmentLogoUrl.substring(0, 2048);
  
  return sanitized;
}

/**
 * Sets up a real-time subscription listener to a student profile document in Firestore
 */
export function subscribeUserProfile(
  userId: string,
  onUpdate: (profile: UserProfile | null) => void,
  onError?: (error: any) => void
) {
  const path = `users/${userId}`;
  return onSnapshot(
    doc(db, 'users', userId),
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as UserProfile);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      if (onError) {
        onError(error);
      }
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Updates the user's profile with full defensive sanitization
 */
export async function updateUserProfile(userId: string, profile: UserProfile): Promise<void> {
  const path = `users/${userId}`;
  const sanitized = sanitizeUserProfile(profile);
  try {
    await setDoc(doc(db, 'users', userId), sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
