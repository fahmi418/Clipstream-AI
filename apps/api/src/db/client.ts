import type { IDatabaseRepository } from './repository.js';
import { InMemoryDatabaseRepository } from './in-memory.js';
import { DrizzleDatabaseRepository } from './drizzle.js';

let activeRepository: IDatabaseRepository | null = null;

export function getDatabaseRepository(): IDatabaseRepository {
  if (!activeRepository) {
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl && process.env.NODE_ENV !== 'test') {
      try {
        activeRepository = new DrizzleDatabaseRepository(databaseUrl);
      } catch {
        // Fallback to in-memory if DB connection failed
        activeRepository = new InMemoryDatabaseRepository();
      }
    } else {
      activeRepository = new InMemoryDatabaseRepository();
    }
  }
  return activeRepository;
}

export function setDatabaseRepository(repo: IDatabaseRepository): void {
  activeRepository = repo;
}
