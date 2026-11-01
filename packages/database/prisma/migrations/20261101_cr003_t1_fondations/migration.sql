-- Script SQL d'initialisation des contraintes souveraines D-11 / D-12 et triggers T1

-- 1. Création des rôles PostgreSQL pleingaz_migrate et pleingaz_app
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'pleingaz_migrate') THEN
    CREATE ROLE pleingaz_migrate WITH LOGIN PASSWORD 'pleingaz_migrate' SUPERUSER;
  END IF;

  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'pleingaz_app') THEN
    CREATE ROLE pleingaz_app WITH LOGIN PASSWORD 'pleingaz_app';
  END IF;
END
$$;

-- 2. Privilèges de connexion et d'usage pour pleingaz_app
GRANT CONNECT ON DATABASE pleingaz_db TO pleingaz_app;
GRANT USAGE ON SCHEMA public TO pleingaz_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO pleingaz_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO pleingaz_app;

-- 3. Immutabilité absolue de la table "AuditLog" (Append-Only)
-- Révocation des droits destructifs pour l'utilisateur applicatif
REVOKE UPDATE, DELETE, TRUNCATE ON TABLE "AuditLog" FROM pleingaz_app;

-- Fonction de déclencheur de rejet inconditionnel UPDATE / DELETE
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'AuditLog est strictement en ajout seul (Append-Only) : UPDATE et DELETE interdits.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_modification ON "AuditLog";
CREATE TRIGGER trg_prevent_audit_log_modification
BEFORE UPDATE OR DELETE ON "AuditLog"
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_modification();

-- 4. Contraintes CHECK sur "User" (E.164 et disjonction numéro principal / secondaire)
-- Format E.164 (+237...) ou international valide
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS chk_user_whatsapp_e164_format;
ALTER TABLE "User" ADD CONSTRAINT chk_user_whatsapp_e164_format
CHECK (whatsapp_e164 IS NULL OR whatsapp_e164 ~ '^\+[1-9][0-9]{7,14}$');

ALTER TABLE "User" DROP CONSTRAINT IF EXISTS chk_user_secondary_e164_format;
ALTER TABLE "User" ADD CONSTRAINT chk_user_secondary_e164_format
CHECK (secondary_e164 IS NULL OR secondary_e164 ~ '^\+[1-9][0-9]{7,14}$');

-- Le numéro secondaire doit être DISTINCT du numéro principal WhatsApp
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS chk_user_secondary_different_from_principal;
ALTER TABLE "User" ADD CONSTRAINT chk_user_secondary_different_from_principal
CHECK (secondary_e164 IS NULL OR whatsapp_e164 IS NULL OR secondary_e164 != whatsapp_e164);

-- 5. Rendre la table audit_logs miroir si besoin
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
    DROP TRIGGER IF EXISTS trg_prevent_audit_logs_modification ON audit_logs;
    CREATE TRIGGER trg_prevent_audit_logs_modification
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_modification();
    REVOKE UPDATE, DELETE, TRUNCATE ON TABLE audit_logs FROM pleingaz_app;
  END IF;
END
$$;
