package com.teamcollabhub.backend.event;

public final class EventMapper {

    private EventMapper() {
    }

    public static EventResponse toResponse(Event event) {
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getCreatedAt(),
                event.getOrderIndex()
        );
    }

    public static Event toEntity(EventRequest request) {
        Event event = new Event();
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setOrderIndex(request.order());
        return event;
    }

    public static void updateEntity(Event event, EventRequest request) {
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setOrderIndex(request.order());
    }
}
