#!/usr/bin/env bash
set -euo pipefail
# Break caught: the portal serves a different cli-state-handler docs version than the one CI fetched.
repo_root=$(cd "$(dirname "$0")/.." && pwd)
fx=$(mktemp -d); trap 'rm -rf "$fx"' EXIT
mkdir -p "$fx/bin"
cat > "$fx/bin/curl" <<'STUB'
#!/usr/bin/env bash
case " $* " in *" -I "*) echo "HTTP/2 200"; exit 0 ;; esac
for last; do :; done
case "$last" in */cli-state-handler/version.json) printf '%s\n' "$FAKE_VERSION_BODY" ;; */server-decorator/version.json) printf '%s\n' "$FAKE_DECORATOR_BODY" ;; *) echo "<html>joymify</html>" ;; esac
STUB
chmod +x "$fx/bin/curl"
run() { # run <host> [VAR=value...] -> sets $code, $out
  local host="$1"; shift
  set +e
  out=$(env PATH="$fx/bin:$PATH" "$@" bash "$repo_root/scripts/smoke-prod.sh" "$host" 2>&1)
  code=$?; set -e
}
ok() { echo "ok - $1"; }; die() { echo "not ok - $1"; echo "$out"; exit 1; }

run dev.joymify.com EXPECTED_CLI_DOCS_VERSION=0.2.0 'FAKE_VERSION_BODY={"version":"0.2.0"}'
[ "$code" = 0 ] && echo "$out" | grep -q 'cli-state-handler docs version 0.2.0' || die matching_version_passes
ok matching_version_passes

run dev.joymify.com EXPECTED_CLI_DOCS_VERSION=0.3.0 'FAKE_VERSION_BODY={"version":"0.2.0"}'
[ "$code" != 0 ] && echo "$out" | grep -q '::error::' && echo "$out" | grep -q '0.2.0' && echo "$out" | grep -q '0.3.0' || die wrong_version_fails
ok wrong_version_fails

run dev.joymify.com EXPECTED_CLI_DOCS_VERSION=0.2.0 'FAKE_VERSION_BODY=<html>joymify</html>'
[ "$code" != 0 ] || die index_html_instead_of_json_fails
ok index_html_instead_of_json_fails

run dev.joymify.com 'FAKE_VERSION_BODY=<html>'
[ "$code" = 0 ] && ! echo "$out" | grep -q 'docs version' || die unset_expected_version_skips
ok unset_expected_version_skips

run design.joymify.com EXPECTED_CLI_DOCS_VERSION=0.3.0 'FAKE_VERSION_BODY={"version":"0.2.0"}'
[ "$code" = 0 ] || die legacy_host_never_checks
ok legacy_host_never_checks

run dev.joymify.com EXPECTED_DECORATOR_DOCS_VERSION=2.0.26 'FAKE_DECORATOR_BODY={"version":"2.0.26"}'
[ "$code" = 0 ] && echo "$out" | grep -q 'server-decorator docs version 2.0.26' || die matching_decorator_version_passes
ok matching_decorator_version_passes

run dev.joymify.com EXPECTED_DECORATOR_DOCS_VERSION=2.0.27 'FAKE_DECORATOR_BODY={"version":"2.0.26"}'
[ "$code" != 0 ] && echo "$out" | grep -q '::error::' && echo "$out" | grep -q '2.0.26' && echo "$out" | grep -q '2.0.27' || die wrong_decorator_version_fails
ok wrong_decorator_version_fails

run dev.joymify.com EXPECTED_DECORATOR_DOCS_VERSION=2.0.26 'FAKE_DECORATOR_BODY=<html>joymify</html>'
[ "$code" != 0 ] || die decorator_index_html_instead_of_json_fails
ok decorator_index_html_instead_of_json_fails

run dev.joymify.com EXPECTED_CLI_DOCS_VERSION=0.2.0 EXPECTED_DECORATOR_DOCS_VERSION=2.0.26 'FAKE_VERSION_BODY={"version":"0.2.0"}' 'FAKE_DECORATOR_BODY={"version":"2.0.99"}'
[ "$code" != 0 ] && echo "$out" | grep -q 'server-decorator docs version is' || die cli_ok_but_decorator_wrong_still_fails
ok cli_ok_but_decorator_wrong_still_fails

run design.joymify.com EXPECTED_DECORATOR_DOCS_VERSION=2.0.27 'FAKE_DECORATOR_BODY={"version":"2.0.26"}'
[ "$code" = 0 ] || die legacy_host_never_checks_decorator
ok legacy_host_never_checks_decorator
