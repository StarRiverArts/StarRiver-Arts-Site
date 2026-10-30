"""Membership regressions for the public artifact audit, without a database."""
import unittest

from racing_data_audit import current_route_rows, event_projection_status_drifts, steward_report_from_audit


class MembershipTests(unittest.TestCase):
    def test_current_counts_do_not_reuse_all_time_rows_or_other_worlds(self):
        def route(*ids):
            return {"route_code": "DH", "route_rows": [{"record_id": r} for r in ids]}

        pairs = [("reset", route("old", "new", "unresolved", "future")),
                 ("empty", route("old-empty")), ("unscoped", route("legacy"))]
        payload = {"scopes": [
            {"track_world_code": "reset", "route_code": "DH", "current_period_id": "p2",
             "records": [{"record_id": "old", "period_id": "p1"},
                         {"record_id": "new", "period_id": "p2"},
                         {"record_id": "unresolved", "period_id": None}]},
            {"track_world_code": "empty", "route_code": "DH", "current_period_id": "p2-empty",
             "records": [{"record_id": "old-empty", "period_id": "p1-empty"}]}]}
        actual = current_route_rows(pairs, payload)
        self.assertEqual([[r["record_id"] for r in rows] for _, _, rows in actual],
                         [["new"], [], ["legacy"]])
        self.assertEqual(len(pairs[0][1]["route_rows"]), 4)

    def test_snapshot_without_period_configuration_keeps_legacy_rows(self):
        route = {"route_code": "DH", "route_rows": [{"record_id": "legacy"}]}
        self.assertEqual(current_route_rows([("world", route)], {}),
                         [("world", route, route["route_rows"])])



class EventProjectionDriftTests(unittest.TestCase):
    def test_detects_status_drift_without_rewriting_sources(self):
        editorial = [
            {"event_id": "ych", "status": "completed"},
            {"event_id": "other", "status": "upcoming"},
        ]
        vrc = [
            {"id": "ych", "status": "upcoming"},
            {"id": "other", "status": "upcoming"},
        ]
        self.assertEqual(event_projection_status_drifts(editorial, vrc), [
            {"event_id": "ych", "editorial_status": "completed", "vrc_status": "upcoming"}
        ])
        self.assertEqual(editorial[0]["status"], "completed")
        self.assertEqual(vrc[0]["status"], "upcoming")

    def test_missing_identity_is_not_an_invented_status_drift(self):
        self.assertEqual(event_projection_status_drifts(
            [{"event_id": "known", "status": "completed"}],
            [{"id": "different", "status": "upcoming"}],
        ), [])

    def test_matching_status_does_not_warn_due_to_elapsed_date(self):
        self.assertEqual(event_projection_status_drifts(
            [{"event_id": "past", "status": "upcoming", "starts_at": "2026-10-03"}],
            [{"id": "past", "status": "upcoming", "starts_at": "2026-10-03"}],
        ), [])



class StewardExportTests(unittest.TestCase):
    def test_status_drift_creates_stable_machine_readable_exception(self):
        report = {"checks": [{"code": "unique_event_ids", "pass": True}],
                  "warnings": [{"code": "editorial_vrc_event_status_drift", "cases": [{
                      "event_id": "vrrctw_ych_trackday_20261003",
                      "editorial_status": "completed", "vrc_status": "upcoming"
                  }]}]}
        a = steward_report_from_audit(report, generated_at="2026-10-30T07:00:00+00:00")
        b = steward_report_from_audit(report, generated_at="2026-10-30T07:05:00+00:00")
        self.assertEqual(a["schema"], "project-t-steward/1")
        self.assertEqual(a["overall_status"], "ACTION_REQUIRED")
        row = next(x for x in a["checks"] if x["rule_id"] == "event_status_consistency")
        self.assertEqual(row["subject_id"], "vrrctw_ych_trackday_20261003")
        self.assertEqual(row["status"], "ACTION_REQUIRED")
        self.assertEqual(row["observed"], {"editorial_status":"completed", "vrc_status":"upcoming"})
        self.assertEqual(row["issue_key"], next(x for x in b["checks"]
                         if x["rule_id"] == "event_status_consistency")["issue_key"])
        self.assertEqual(row["fingerprint"], next(x for x in b["checks"]
                         if x["rule_id"] == "event_status_consistency")["fingerprint"])
        self.assertNotEqual(a["generated_at"], b["generated_at"])

    def test_missing_input_yields_blocked_not_pass(self):
        report = steward_report_from_audit(
            {"error": "FileNotFoundError: missing", "checks": [], "warnings": []},
            generated_at="2026-10-30T07:00:00Z")
        self.assertEqual(report["overall_status"], "BLOCKED")
        self.assertEqual(report["summary"]["BLOCKED"], 1)
        self.assertFalse(any(r["status"] == "PASS" for r in report["checks"]))

    def test_elapsed_upcoming_produces_review_not_completed(self):
        report = steward_report_from_audit(
            {"checks": [], "warnings": [{"code": "editorial_past_upcoming_requires_review",
                  "cases": [{"event_id": "x", "starts_at": "2026-10-01"}]}]},
            generated_at="2026-10-30T07:00:00Z")
        row = next(x for x in report["checks"] if x["rule_id"] == "past_upcoming_review")
        self.assertEqual(row["status"], "ACTION_REQUIRED")
        self.assertEqual(row["observed"]["editorial_status"], "upcoming")

    def test_intentional_warnings_are_not_false_incidents(self):
        report = steward_report_from_audit(
            {"checks": [], "warnings": [{"code": "missing_world_urls_not_necessarily_public",
                "count": 3, "ids": ["private"]}]},
            generated_at="2026-10-30T07:00:00Z")
        self.assertEqual(report["overall_status"], "PASS")
        self.assertFalse(any("world_url" in x["issue_key"] for x in report["checks"]))



class CorrelatedSnapshotDriftTests(unittest.TestCase):
    def test_stale_period_becomes_one_action_and_two_unknown_dependents(self):
        report = {
            "checks": [
                {"code": "map_current_run_counts", "pass": False,
                 "mismatches": ["pt_ych_starriver_arts", "gunsai_jintei"]},
                {"code": "summary_valid_runs", "pass": False,
                 "summary": 1904, "records": 1887, "scope": "current"},
            ],
            "warnings": [{
                "code": "period_projection_snapshot_outdated",
                "period_as_of_utc": "2026-10-26T16:21:03Z",
                "manifest_generated_at": "2026-10-29T18:27:47Z",
                "stale_seconds": 266804,
                "affected_worlds": [
                    {"track_world_code": "pt_ych_starriver_arts", "map_count": 46,
                     "period_current_count": 31},
                    {"track_world_code": "gunsai_jintei", "map_count": 4,
                     "period_current_count": 2},
                ],
                "summary_valid_runs": 1904, "period_current_runs": 1887,
            }],
        }
        out = steward_report_from_audit(report, generated_at="2026-10-30T07:00:00Z")
        issues = {x["rule_id"]: x for x in out["checks"]}
        self.assertEqual(issues["refresh_period_projection"]["status"], "ACTION_REQUIRED")
        self.assertEqual(issues["racing_audit_map_current_run_counts"]["status"], "UNKNOWN")
        self.assertEqual(issues["racing_audit_summary_valid_runs"]["status"], "UNKNOWN")
        self.assertFalse(issues["racing_audit_summary_valid_runs"]["observed"]["pass"])
        self.assertEqual(out["summary"]["ACTION_REQUIRED"], 1)
        self.assertEqual(out["summary"]["UNKNOWN"], 2)
        self.assertEqual(issues["refresh_period_projection"]["observed"]
                         ["summary_valid_runs"], 1904)

    def test_no_staleness_evidence_keeps_count_failures_actionable(self):
        out = steward_report_from_audit({
            "checks": [{"code": "summary_valid_runs", "pass": False,
                         "summary": 1904, "records": 1887}],
            "warnings": [],
        }, generated_at="2026-10-30T07:00:00Z")
        self.assertEqual(out["overall_status"], "ACTION_REQUIRED")
        check = next(c for c in out["checks"] if c["rule_id"] == "racing_audit_summary_valid_runs")
        self.assertEqual(check["status"], "ACTION_REQUIRED")
        self.assertFalse(check["observed"]["pass"])



if __name__ == "__main__":
    unittest.main()
