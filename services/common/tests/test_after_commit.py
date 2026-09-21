from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from ksu_common.after_commit import defer_after_commit


def test_nested_commit_waits_and_nested_rollback_discards_only_its_work():
    calls = []
    with Session(create_engine("sqlite://")) as session:
        defer_after_commit(session, lambda: calls.append("outer"))
        with session.begin_nested():
            defer_after_commit(session, lambda: calls.append("nested"))
        assert calls == []
        nested = session.begin_nested()
        defer_after_commit(session, lambda: calls.append("discarded"))
        nested.rollback()
        session.commit()
        assert calls == ["outer", "nested"]


def test_outer_rollback_and_close_never_leak_into_reused_session():
    calls = []
    with Session(create_engine("sqlite://")) as session:
        defer_after_commit(session, lambda: calls.append("rollback"))
        session.rollback()
        defer_after_commit(session, lambda: calls.append("close"))
        session.close()
        session.commit()
        assert calls == []


def test_recoverable_wakeup_failure_does_not_fail_commit_or_other_wakeups():
    calls = []

    def unavailable():
        raise ConnectionError("test broker unavailable")

    with Session(create_engine("sqlite://")) as session:
        defer_after_commit(session, unavailable, recoverable=True)
        defer_after_commit(session, lambda: calls.append("next"))
        session.commit()
    assert calls == ["next"]
