#!/usr/bin/env bash
set -euo pipefail
# Break caught: a missing token, a bad archive or a failed download ships stale docs silently.
repo_root=$(cd "$(dirname "$0")/.." && pwd)
before=$(git -C "$repo_root" status --porcelain apps/)
fx=$(mktemp -d); trap 'rm -rf "$fx"' EXIT
mkdir -p "$fx/bin" "$fx/src/assets"
echo '<html>new</html>' > "$fx/src/index.html"; echo 'x' > "$fx/src/assets/a.js"
printf '{"version":"0.2.0"}\n' > "$fx/src/version.json"
tar -czf "$fx/good.tgz" -C "$fx/src" .
mk() { rm -rf "$fx/v" && cp -R "$fx/src" "$fx/v" && (cd "$fx/v" && eval "$2") && tar -czf "$fx/$1.tgz" -C "$fx/v" .; }
mk no-version 'rm version.json'; mk no-index 'rm index.html'; mk mismatch 'echo "{\"version\":\"0.1.0\"}" > version.json'
python3 -c "import tarfile,sys;t=tarfile.open(sys.argv[1],'w:gz');t.add(sys.argv[2],arcname='../evil.txt');t.close()" "$fx/traversal.tgz" "$fx/src/index.html"
mk plus-version 'echo "{\"version\":\"0.2.0+b1\"}" > version.json'
python3 -c "
import tarfile,sys
t=tarfile.open(sys.argv[1],'w:gz'); t.add(sys.argv[2],arcname='index.html')
l=tarfile.TarInfo('copy.html'); l.type=tarfile.LNKTYPE; l.linkname='index.html'; t.addfile(l)
v=tarfile.TarInfo('version.json'); d=b'{\"version\":\"0.2.0\"}'; v.size=len(d)
import io; t.addfile(v, io.BytesIO(d)); t.close()" "$fx/hardlink.tgz" "$fx/src/index.html"
head -c 60 "$fx/good.tgz" > "$fx/corrupt.tgz"
(cd "$fx/src" && ln -s /etc/hosts leak && tar -czf "$fx/symlink.tgz" . && rm leak)
cat > "$fx/bin/gh" <<'STUB'
#!/usr/bin/env bash
echo "$*" >> "$FAKE_GH_LOG"
case "${FAKE_GH_MODE:-ok}" in
  notfound) echo "release not found" >&2; exit 1 ;;
  forbidden) echo "HTTP 403: Resource not accessible" >&2; exit 1 ;;
  weird) echo "something nobody has seen before" >&2; exit 1 ;;
  flaky) n=$(cat "$FAKE_GH_COUNT" 2>/dev/null || echo 0); echo $((n + 1)) > "$FAKE_GH_COUNT"
         [ "$n" -ge "${FAKE_GH_FAILS:-2}" ] || { echo "connection reset by peer" >&2; exit 1; } ;;
esac
if [ "$2" = "view" ]; then echo "v0.2.0"; exit 0; fi
while [ $# -gt 0 ]; do [ "$1" = "-D" ] && dest="$2"; shift; done
mkdir -p "$dest"; cp "$FAKE_GH_ARCHIVE" "$dest/docs-site.tgz"
STUB
cat > "$fx/bin/cp" <<'STUB'
#!/usr/bin/env bash
# Fails the swap copy (dest ends in .new/) after creating a partial file; every other cp is the real one.
if [ -n "${FAKE_CP_FAIL:-}" ]; then
  for last; do :; done
  case "$last" in *.new/) mkdir -p "$last"; echo partial > "$last/partial"; echo "cp: no space left" >&2; exit 1 ;; esac
fi
exec /bin/cp "$@"
STUB
chmod +x "$fx/bin/gh" "$fx/bin/cp"
run() { # run <archive> <tag> [VAR=value...] -> sets $code, $out; bundle starts as an "old" snapshot
  local archive="$1" tag="$2"; shift 2
  rm -rf "$fx/bundle" "$fx/count" "$fx/log" "$fx/ghout"; mkdir -p "$fx/bundle"; echo old > "$fx/bundle/index.html"
  set +e
  out=$(env PATH="$fx/bin:$PATH" GH_TOKEN=fake FAKE_GH_ARCHIVE="$fx/$archive.tgz" FAKE_GH_LOG="$fx/log" FAKE_GH_COUNT="$fx/count" \
    CLI_DOCS_BUNDLE_DIR="$fx/bundle" CLI_DOCS_RETRY_DELAY=0 GITHUB_OUTPUT="$fx/ghout" "$@" bash "$repo_root/scripts/fetch-cli-docs.sh" $tag 2>&1)
  code=$?; set -e
}
ok() { echo "ok - $1"; }; die() { echo "not ok - $1"; echo "$out"; exit 1; }
untouched() { [ "$(cat "$fx/bundle/index.html")" = old ] && [ ! -e "$fx/bundle/version.json" ]; }
lines() { wc -l < "$fx/log" | tr -d ' '; }

run good v0.2.0
[ "$code" = 0 ] && echo "$out" | grep -qx 'cli-docs: fetched v0.2.0 (version.json 0.2.0)' && grep -qx 'cli_docs_version=0.2.0' "$fx/ghout" \
  && [ "$(cat "$fx/bundle/version.json")" = '{"version":"0.2.0"}' ] && grep -q new "$fx/bundle/index.html" || die fetches_named_tag_and_swaps_bundle
ok fetches_named_tag_and_swaps_bundle

run good ""
[ "$code" = 0 ] && echo "$out" | grep -q 'v0.2.0' && grep -q 'release view' "$fx/log" || die empty_tag_resolves_latest
ok empty_tag_resolves_latest

run good v0.2.0 GH_TOKEN=
[ "$code" != 0 ] && echo "$out" | grep -q '::error::' && echo "$out" | grep -q CLI_DOCS_READ_TOKEN && untouched && [ ! -e "$fx/log" ] || die empty_token_fails_naming_secret
ok empty_token_fails_naming_secret

run good v9.9.9 FAKE_GH_MODE=notfound
[ "$code" != 0 ] && untouched && [ "$(lines)" = 1 ] || die missing_release_fails_without_retry
ok missing_release_fails_without_retry

run good v0.2.0 FAKE_GH_MODE=flaky FAKE_GH_FAILS=2
[ "$code" = 0 ] && [ "$(lines)" = 3 ] || die transient_error_retried_then_succeeds
ok transient_error_retried_then_succeeds

run good v0.2.0 FAKE_GH_MODE=flaky FAKE_GH_FAILS=9
[ "$code" != 0 ] && [ "$(lines)" = 3 ] && untouched || die persistent_error_fails_after_three_attempts
ok persistent_error_fails_after_three_attempts

run no-version v0.2.0
[ "$code" != 0 ] && echo "$out" | grep -q '::error::' && untouched || die archive_without_version_json_fails
ok archive_without_version_json_fails

run no-index v0.2.0
[ "$code" != 0 ] && echo "$out" | grep -q '::error::' && untouched || die archive_without_index_fails
ok archive_without_index_fails

run mismatch v0.2.0
[ "$code" != 0 ] && echo "$out" | grep -q '0.1.0' && echo "$out" | grep -q 'v0.2.0' && untouched || die version_mismatch_fails
ok version_mismatch_fails

run traversal v0.2.0
[ "$code" != 0 ] && untouched && [ ! -e "$fx/evil.txt" ] || die path_traversal_rejected
ok path_traversal_rejected

run corrupt v0.2.0
[ "$code" != 0 ] && echo "$out" | grep -q '::error::' && echo "$out" | grep -q 'not a readable tar.gz' && untouched || die corrupt_archive_fails
ok corrupt_archive_fails

run symlink v0.2.0
[ "$code" != 0 ] && echo "$out" | grep -q '::error::' && echo "$out" | grep -q 'link or special file' && untouched || die link_entry_rejected
ok link_entry_rejected

run hardlink v0.2.0
[ "$code" != 0 ] && echo "$out" | grep -q 'link or special file' && untouched || die hardlink_entry_rejected
ok hardlink_entry_rejected

run good v0.2.0 FAKE_CP_FAIL=1
[ "$code" != 0 ] && untouched && [ ! -e "$fx/bundle.new" ] && [ ! -e "$fx/bundle/partial" ] || die failed_copy_keeps_old_snapshot_and_leaves_no_new_folder
ok failed_copy_keeps_old_snapshot_and_leaves_no_new_folder

run good "" FAKE_GH_MODE=notfound
[ "$code" != 0 ] && echo "$out" | grep -q '::error::' && untouched && [ ! -s "$fx/ghout" ] || die latest_lookup_failure_fails
ok latest_lookup_failure_fails

run good v0.2.0 FAKE_GH_MODE=forbidden
[ "$code" != 0 ] && [ "$(lines)" = 1 ] && untouched || die permanent_error_fails_on_first_attempt
ok permanent_error_fails_on_first_attempt

# An unrecognised error is retried (3 attempts in total) and then fails; it is never treated as a skip.
run good v0.2.0 FAKE_GH_MODE=weird
[ "$code" != 0 ] && echo "$out" | grep -q '::error::' && [ "$(lines)" = 3 ] && untouched && [ ! -s "$fx/ghout" ] || die unrecognised_error_fails_not_skips
ok unrecognised_error_fails_not_skips

run plus-version v0.2.0
[ "$code" != 0 ] && echo "$out" | grep -q 'usable in an image tag' && untouched || die plus_in_version_rejected
ok plus_in_version_rejected

run mismatch v0.2.0
[ "$code" != 0 ] && [ ! -s "$fx/ghout" ] || die github_output_unwritten_on_failure
ok github_output_unwritten_on_failure

run good "--skip-existing"
[ "$code" != 0 ] && echo "$out" | grep -q '::error::' && echo "$out" | grep -q 'not of the form' && untouched && [ ! -e "$fx/log" ] || die malformed_tag_rejected
ok malformed_tag_rejected

[ "$(git -C "$repo_root" status --porcelain apps/)" = "$before" ] || die no_work_files_left_in_repo
ok no_work_files_left_in_repo
