#!/usr/bin/env bash
# يطبّق الترحيلات على قاعدة Postgres مؤقتة ويشغّل اختبارات RLS.
# الاستخدام: PGUSER=postgres ./run.sh
set -euo pipefail
cd "$(dirname "$0")"
DB=fasih_test
dropdb --if-exists "$DB" >/dev/null
createdb "$DB"
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f auth_stub.sql
for f in ../migrations/*.sql; do
  psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$f"
done
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f rls_test.sql >/dev/null
echo "RLS tests passed"
