package com.teamcollabhub.backend.event;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public List<EventResponse> getEvents() {
        return eventService.findAll().stream()
                .map(EventMapper::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public EventResponse getEvent(@PathVariable UUID id) {
        return EventMapper.toResponse(eventService.getById(id));
    }

    @PostMapping
    public EventResponse createEvent(@Valid @RequestBody EventRequest request) {
        Event event = EventMapper.toEntity(request);
        return EventMapper.toResponse(eventService.create(event));
    }

    @PutMapping("/{id}")
    public EventResponse updateEvent(@PathVariable UUID id, @Valid @RequestBody EventRequest request) {
        return EventMapper.toResponse(eventService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable UUID id) {
        eventService.delete(id);
    }
}
