-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vital" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "deviceId" TEXT,
    "glucose" REAL,
    "heartRate" REAL,
    "temperature" REAL,
    "oxygen" REAL,
    "systolic" INTEGER,
    "diastolic" INTEGER,
    "fallDetected" BOOLEAN NOT NULL DEFAULT false,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vital_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vital_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Vital" ("deviceId", "diastolic", "glucose", "heartRate", "id", "oxygen", "patientId", "recordedAt", "systolic", "temperature") SELECT "deviceId", "diastolic", "glucose", "heartRate", "id", "oxygen", "patientId", "recordedAt", "systolic", "temperature" FROM "Vital";
DROP TABLE "Vital";
ALTER TABLE "new_Vital" RENAME TO "Vital";
CREATE INDEX "Vital_patientId_recordedAt_idx" ON "Vital"("patientId", "recordedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
