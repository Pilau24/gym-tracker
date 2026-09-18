PRAGMA foreign_keys=OFF;

ALTER TABLE "users" ADD COLUMN "email" TEXT;

UPDATE "users"
SET "email" = "username"
WHERE instr("username", '@') > 1;

-- Normalize existing usernames by removing the email domain and every remaining
-- non-ASCII-alphanumeric character.
WITH RECURSIVE normalized(id, username, position, normalized_username) AS (
    SELECT
        "id",
        CASE
            WHEN instr("username", '@') > 1
                THEN substr("username", 1, instr("username", '@') - 1)
            ELSE "username"
        END,
        1,
        ''
    FROM "users"
    UNION ALL
    SELECT
        "id",
        "username",
        "position" + 1,
        "normalized_username" ||
        CASE
            WHEN substr("username", "position", 1) GLOB '[A-Za-z0-9]'
                THEN substr("username", "position", 1)
            ELSE ''
        END
    FROM normalized
    WHERE "position" <= length("username")
),
cleaned(id, username) AS (
    SELECT "id", "normalized_username"
    FROM normalized
    WHERE "position" = length("username") + 1
)
UPDATE "users"
SET "username" = (
    SELECT "username"
    FROM cleaned
    WHERE cleaned."id" = users."id"
);

CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "profile_image_filename" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_username_format"
      CHECK (
        length("username") BETWEEN 1 AND 80
        AND "username" NOT GLOB '*[^A-Za-z0-9]*'
      )
);

INSERT INTO "new_users" (
    "id",
    "username",
    "email",
    "profile_image_filename",
    "created_at"
)
SELECT
    "id",
    "username",
    "email",
    "profile_image_filename",
    "created_at"
FROM "users";

DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

PRAGMA foreign_keys=ON;
