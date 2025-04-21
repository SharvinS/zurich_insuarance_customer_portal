import { SetMetadata } from '@nestjs/common';

// Define a constant key used to store and retrieve role metadata
export const ROLES_KEY = 'roles';

// Function named 'Roles', takes one or more role strings as arguments using SetMetadata to attach the provided roles array
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
