// src/utils/roleMapper.ts
import type { UserRole } from '../types';

export function mapRoleToUserRole(roleFromApi: string): UserRole {
  const normalized = roleFromApi.trim().toLowerCase();

  if (normalized === 'administrator' || normalized === 'admin') return 'Administrator';
  if (normalized === 'mechanic' || normalized === 'mecanico') return 'Mechanic';
  if (normalized === 'recepcionist' || normalized === 'recepcionista') return 'Recepcionist';

  throw new Error(`Unknown role from API: ${roleFromApi}`);
}
