package com.teamcollabhub.backend.column;

import com.teamcollabhub.backend.event.Event;
import com.teamcollabhub.backend.event.EventService;
import com.teamcollabhub.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class BoardColumnService {

    private final BoardColumnRepository columnRepository;
    private final EventService eventService;

    public BoardColumnService(BoardColumnRepository columnRepository, EventService eventService) {
        this.columnRepository = columnRepository;
        this.eventService = eventService;
    }

    public List<BoardColumn> findAll() {
        return columnRepository.findAll();
    }

    public List<BoardColumn> findByEvent(UUID eventId) {
        return columnRepository.findByEventIdOrderByOrderIndexAsc(eventId);
    }

    public BoardColumn getById(UUID id) {
        return columnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Column not found"));
    }

    public BoardColumn create(ColumnRequest request) {
        Event event = eventService.getById(request.eventId());
        BoardColumn column = new BoardColumn();
        column.setTitle(request.title());
        column.setEvent(event);
        column.setOrderIndex(request.order());
        column.setColor(request.color());
        return columnRepository.save(column);
    }

    public BoardColumn update(UUID id, ColumnRequest request) {
        BoardColumn column = getById(id);
        column.setTitle(request.title());
        column.setOrderIndex(request.order());
        column.setColor(request.color());
        if (!column.getEvent().getId().equals(request.eventId())) {
            Event event = eventService.getById(request.eventId());
            column.setEvent(event);
        }
        return columnRepository.save(column);
    }

    public void delete(UUID id) {
        if (!columnRepository.existsById(id)) {
            throw new ResourceNotFoundException("Column not found");
        }
        columnRepository.deleteById(id);
    }
}
