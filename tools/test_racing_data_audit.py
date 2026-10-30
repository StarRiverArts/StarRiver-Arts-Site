"""Membership regressions for the public artifact audit, without a database."""
import unittest

from racing_data_audit import current_route_rows, event_projection_status_drifts


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



if __name__ == "__main__":
    unittest.main()
