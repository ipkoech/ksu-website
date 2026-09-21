from unittest.mock import Mock

from ksu_common.worker_metrics import QueueDepthCollector


def samples(collector):
    return [sample for metric in collector.collect() for sample in metric.samples]


def test_partial_failure_omits_unknown_depth_and_recovers(caplog):
    client = Mock()
    client.llen.side_effect = [12, OSError("redis://secret"), 0, 4]
    collector = QueueDepthCollector(
        redis_url="unused", queues=("main.audit", "main.default"), redis_client=client
    )
    first = samples(collector)
    assert [(s.labels, s.value) for s in first] == [
        ({"queue": "main.audit"}, 12), ({}, 0)
    ]
    assert first[-1].name == "ksu_celery_queue_depth_scrape_success"
    assert "redis://secret" not in caplog.text
    assert [(s.labels, s.value) for s in samples(collector)] == [
        ({"queue": "main.audit"}, 0), ({"queue": "main.default"}, 4), ({}, 1)
    ]


def test_connection_failure_reports_only_failed_scrape(monkeypatch, caplog):
    collector = QueueDepthCollector(redis_url="unused", queues=("main.audit",))
    monkeypatch.setattr(collector, "_client", Mock(side_effect=OSError("redis://secret")))
    result = samples(collector)
    assert len(result) == 1
    assert result[0].name == "ksu_celery_queue_depth_scrape_success"
    assert result[0].value == 0
    assert "redis://secret" not in caplog.text
