package com.teamcollabhub.backend.column;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ColumnController {

    private final BoardColumnService columnService;

    public ColumnController(BoardColumnService columnService) {
        this.columnService = columnService;
    }

    @GetMapping("/columns")
    public List<ColumnResponse> getColumns() {
        return columnService.findAll().stream()
                .map(ColumnMapper::toResponse)
                .toList();
    }

    @GetMapping("/events/{eventId}/columns")
    public List<ColumnResponse> getColumnsByEvent(@PathVariable UUID eventId) {
        return columnService.findByEvent(eventId).stream()
                .map(ColumnMapper::toResponse)
                .toList();
    }

    @PostMapping("/columns")
    public ColumnResponse createColumn(@Valid @RequestBody ColumnRequest request) {
        return ColumnMapper.toResponse(columnService.create(request));
    }

    @PutMapping("/columns/{id}")
    public ColumnResponse updateColumn(@PathVariable UUID id, @Valid @RequestBody ColumnRequest request) {
        return ColumnMapper.toResponse(columnService.update(id, request));
    }

    @DeleteMapping("/columns/{id}")
    public void deleteColumn(@PathVariable UUID id) {
        columnService.delete(id);
    }
}
