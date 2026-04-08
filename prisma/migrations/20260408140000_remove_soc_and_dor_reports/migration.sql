-- Remove retired report types: SOC (9), DOR (10)
DELETE FROM "report_submissions" WHERE "reportId" IN ('9', '10');
DELETE FROM "report_emails" WHERE "reportId" IN ('9', '10');
