CREATE TABLE "profile_widgets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "widget_type" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "configuration" TEXT NOT NULL DEFAULT '{}',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "profile_widgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "profile_widgets_user_id_widget_type_key" ON "profile_widgets"("user_id", "widget_type");
CREATE INDEX "profile_widgets_user_id_position_idx" ON "profile_widgets"("user_id", "position");
