from app.api.v1.vice_chancellor import router


def test_vc_router_exposes_studio_and_public_content_routes():
    routes = {(route.path, method) for route in router.routes for method in route.methods}
    assert ("/vice-chancellor/hub", "GET") in routes
    assert ("/vice-chancellor/hub/portraits", "GET") in routes
    assert ("/vice-chancellor/hub/portraits", "POST") in routes
    assert ("/vice-chancellor/hub/portraits/reorder", "POST") in routes
    assert ("/vice-chancellor/hub/portraits/{portrait_id}", "PATCH") in routes
    assert ("/vice-chancellor/hub/portraits/{portrait_id}", "DELETE") in routes
    assert ("/vice-chancellor/hub/portraits/{portrait_id}/select", "POST") in routes
    assert ("/vice-chancellor/videos", "POST") in routes
    assert ("/vice-chancellor/speeches", "POST") in routes
    assert ("/vice-chancellor/galleries", "POST") in routes
    assert ("/vice-chancellor/placements", "POST") in routes
    assert ("/public/vice-chancellor", "GET") in routes
    assert ("/public/vice-chancellor/speeches/{slug}", "GET") in routes
    assert ("/public/vice-chancellor/galleries/{slug}", "GET") in routes
