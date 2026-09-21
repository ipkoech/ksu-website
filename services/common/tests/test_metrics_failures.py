import os
import subprocess
import sys
from unittest.mock import Mock

from ksu_common.observability import CompositeMetricsSink, Metrics


def test_failed_sink_does_not_interrupt_operation_or_other_sinks(caplog):
    broken, healthy = Mock(), Mock()
    for method in ("increment", "gauge", "observe_latency"):
        getattr(broken, method).side_effect = OSError("sensitive storage location")
    metrics = Metrics(CompositeMetricsSink(broken, healthy))
    for _ in range(2):
        metrics.increment("test.counter")
        metrics.gauge("test.gauge", 1)
        metrics.observe_latency("test.duration", 10)
    assert healthy.increment.call_count == 2
    assert healthy.gauge.call_count == 2
    assert healthy.observe_latency.call_count == 2
    assert caplog.text.count("metrics sink failed") == 3
    assert "sensitive storage location" not in caplog.text


def test_worker_gauge_exports_latest_value_from_multiprocess_storage(tmp_path):
    code = '''
from prometheus_client import CollectorRegistry, generate_latest, multiprocess
from ksu_common.worker_metrics import MultiprocessMetricsSink
sink = MultiprocessMetricsSink()
sink.gauge("test.pending", 120, tags={"service": "main"})
sink.gauge("test.pending", 0, tags={"service": "main"})
registry = CollectorRegistry()
multiprocess.MultiProcessCollector(registry)
print(generate_latest(registry).decode())
'''
    environment = {**os.environ, "PROMETHEUS_MULTIPROC_DIR": str(tmp_path)}
    result = subprocess.run([sys.executable, "-c", code], env=environment,
                            capture_output=True, text=True, timeout=20, check=True)
    assert 'ksu_test_pending{service="main"} 0.0' in result.stdout


def test_latest_worker_recovery_overrides_stale_process_gauge(tmp_path):
    environment = {**os.environ, "PROMETHEUS_MULTIPROC_DIR": str(tmp_path)}
    producer = '''
import os, sys
from ksu_common.worker_metrics import MultiprocessMetricsSink
sink = MultiprocessMetricsSink()
sink.gauge("test.recovery", float(sys.argv[1]), tags={"service": "main"})
print(os.getpid())
'''
    pids = []
    for value in (120, 0):
        result = subprocess.run([sys.executable, "-c", producer, str(value)], env=environment,
                                capture_output=True, text=True, timeout=20, check=True)
        pids.append(int(result.stdout.strip()))
    collector = '''
import sys
from prometheus_client import CollectorRegistry, generate_latest, multiprocess
registry = CollectorRegistry()
multiprocess.MultiProcessCollector(registry)
text = generate_latest(registry).decode()
assert 'ksu_test_recovery{service="main"} 0.0' in text, text
multiprocess.mark_process_dead(int(sys.argv[1]))
assert 'ksu_test_recovery{service="main"} 0.0' in generate_latest(registry).decode()
multiprocess.mark_process_dead(int(sys.argv[2]))
assert 'ksu_test_recovery{' not in generate_latest(registry).decode()
'''
    subprocess.run([sys.executable, "-c", collector, *map(str, pids)], env=environment,
                   capture_output=True, text=True, timeout=20, check=True)
