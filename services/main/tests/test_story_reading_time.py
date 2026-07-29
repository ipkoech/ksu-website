from app.services.content import calculate_story_reading_minutes


def test_calculate_story_reading_minutes_uses_rich_text_words():
    content = "<h2>Heading</h2> " + "word " * 450

    assert calculate_story_reading_minutes(content) == 3


def test_calculate_story_reading_minutes_returns_one_for_empty_content():
    assert calculate_story_reading_minutes(None) == 1
