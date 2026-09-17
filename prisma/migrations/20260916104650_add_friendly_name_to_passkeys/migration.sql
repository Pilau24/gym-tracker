-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_passkeys" (
    "cred_id" TEXT NOT NULL PRIMARY KEY,
    "friendly_name" TEXT NOT NULL DEFAULT 'Passkey',
    "cred_public_key" BLOB NOT NULL,
    "internal_user_id" INTEGER NOT NULL,
    "webauthn_user_id" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "backup_eligible" BOOLEAN NOT NULL DEFAULT false,
    "backup_status" BOOLEAN NOT NULL DEFAULT false,
    "transports" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used" DATETIME,
    CONSTRAINT "passkeys_internal_user_id_fkey" FOREIGN KEY ("internal_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_passkeys" ("backup_eligible", "backup_status", "counter", "created_at", "cred_id", "cred_public_key", "internal_user_id", "last_used", "transports", "webauthn_user_id") SELECT "backup_eligible", "backup_status", "counter", "created_at", "cred_id", "cred_public_key", "internal_user_id", "last_used", "transports", "webauthn_user_id" FROM "passkeys";
DROP TABLE "passkeys";
ALTER TABLE "new_passkeys" RENAME TO "passkeys";
CREATE INDEX "passkeys_internal_user_id_cred_id_idx" ON "passkeys"("internal_user_id", "cred_id");
CREATE INDEX "passkeys_webauthn_user_id_cred_id_idx" ON "passkeys"("webauthn_user_id", "cred_id");
CREATE UNIQUE INDEX "passkeys_internal_user_id_webauthn_user_id_key" ON "passkeys"("internal_user_id", "webauthn_user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
