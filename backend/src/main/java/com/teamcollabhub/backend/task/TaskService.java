package com.teamcollabhub.backend.task;

import com.teamcollabhub.backend.column.BoardColumn;
import com.teamcollabhub.backend.column.BoardColumnService;
import com.teamcollabhub.backend.event.Event;
import com.teamcollabhub.backend.event.EventService;
import com.teamcollabhub.backend.exception.ResourceNotFoundException;
import com.teamcollabhub.backend.user.User;
import com.teamcollabhub.backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final EventService eventService;
    private final BoardColumnService columnService;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository,
                       EventService eventService,
                       BoardColumnService columnService,
                       UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.eventService = eventService;
        this.columnService = columnService;
        this.userRepository = userRepository;
    }

    public List<Task> findAll() {
        return taskRepository.findAll();
    }

    public Task getById(UUID id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }

    public Task create(TaskRequest request) {
        Event event = eventService.getById(request.eventId());
        BoardColumn column = columnService.getById(request.columnId());
        if (!column.getEvent().getId().equals(event.getId())) {
            throw new ResourceNotFoundException("Column does not belong to the specified event");
        }

        Task task = new Task();
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setEvent(event);
        task.setColumn(column);
        task.setPriority(parsePriority(request.priority()));
        task.setStatus(parseStatus(request.status()));
        if (request.assignedTo() != null) {
            task.setAssignedTo(resolveUser(request.assignedTo()));
        }
        if (request.createdBy() != null) {
            task.setCreatedBy(resolveUser(request.createdBy()));
        }
        task.setDueDate(parseInstant(request.dueDate()));
        return taskRepository.save(task);
    }

    public Task update(UUID id, TaskUpdateRequest request) {
        Task task = getById(id);
        if (request.title() != null) {
            task.setTitle(request.title());
        }
        if (request.description() != null) {
            task.setDescription(request.description());
        }
        if (request.eventId() != null) {
            Event event = eventService.getById(request.eventId());
            task.setEvent(event);
            if (!task.getColumn().getEvent().getId().equals(event.getId())) {
                throw new ResourceNotFoundException("Column does not belong to the specified event");
            }
        }
        if (request.columnId() != null) {
            BoardColumn column = columnService.getById(request.columnId());
            UUID expectedEventId = request.eventId() != null ? request.eventId() : task.getEvent().getId();
            if (!column.getEvent().getId().equals(expectedEventId)) {
                throw new ResourceNotFoundException("Column does not belong to the specified event");
            }
            task.setColumn(column);
        }
        if (request.priority() != null) {
            task.setPriority(parsePriority(request.priority()));
        }
        if (request.status() != null) {
            task.setStatus(parseStatus(request.status()));
        }
        if (request.assignedTo() != null) {
            task.setAssignedTo(resolveUser(request.assignedTo()));
        }
        if (request.createdBy() != null) {
            task.setCreatedBy(resolveUser(request.createdBy()));
        }
        if (request.dueDate() != null) {
            task.setDueDate(parseInstant(request.dueDate()));
        }
        task.setUpdatedAt(Instant.now());
        return taskRepository.save(task);
    }

    public void delete(UUID id) {
        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Task not found");
        }
        taskRepository.deleteById(id);
    }

    private TaskPriority parsePriority(String priority) {
        if (priority == null) {
            return TaskPriority.MEDIUM;
        }
        try {
            return TaskPriority.valueOf(priority.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return TaskPriority.MEDIUM;
        }
    }

    private TaskStatus parseStatus(String status) {
        if (status == null) {
            return null;
        }
        try {
            return TaskStatus.valueOf(status.toUpperCase().replace('-', '_'));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private Instant parseInstant(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Instant.parse(value);
        } catch (DateTimeParseException ex) {
            try {
                LocalDate date = LocalDate.parse(value);
                return date.atStartOfDay().toInstant(ZoneOffset.UTC);
            } catch (DateTimeParseException ignored) {
                return null;
            }
        }
    }

    private User resolveUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
