/**
 * Backward-compatible shim.
 *
 * The authoritative implementation now lives in:
 *   src/features/auth/store/authStore.ts
 *
 * This file re-exports everything from there so that all existing imports of
 * '@/store/authStore' continue to work without any modification.
 */
export { useAuthStore } from '../features/auth/store/authStore';
