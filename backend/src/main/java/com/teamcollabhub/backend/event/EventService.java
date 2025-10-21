package com.teamcollabhub.backend.event;

import com.teamcollabhub.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public List<Event> findAll() {
        return eventRepository.findAll();
    }

    public Event getById(UUID id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
    }

    public Event create(Event event) {
        return eventRepository.save(event);
    }

    public Event update(UUID id, EventRequest request) {
        Event event = getById(id);
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setOrderIndex(request.order());
        return eventRepository.save(event);
    }

    public void delete(UUID id) {
        if (!eventRepository.existsById(id)) {
            throw new ResourceNotFoundException("Event not found");
        }
        eventRepository.deleteById(id);
    }
}
