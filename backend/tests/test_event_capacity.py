import pytest

def test_event_capacity_calculation():
    max_capacity = 300
    existing_attending_rsvps = [
        {"adults_count": 2, "children_count": 1, "total_guests": 3},
        {"adults_count": 1, "children_count": 0, "total_guests": 1},
        {"adults_count": 2, "children_count": 2, "total_guests": 4}
    ]

    current_confirmed = sum(r["total_guests"] for r in existing_attending_rsvps)
    assert current_confirmed == 8

    # Scenario A: Valid RSVP request under capacity
    new_request = {"adults_count": 2, "children_count": 1}
    requested_seats = new_request["adults_count"] + new_request["children_count"]
    assert current_confirmed + requested_seats <= max_capacity

    # Scenario B: Capacity Exceeded
    tiny_capacity = 10
    assert current_confirmed + requested_seats > tiny_capacity
