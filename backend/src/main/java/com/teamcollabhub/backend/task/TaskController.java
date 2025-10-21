package com.teamcollabhub.backend.task;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public List<TaskResponse> getTasks() {
        return taskService.findAll().stream()
                .map(TaskMapper::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public TaskResponse getTask(@PathVariable UUID id) {
        return TaskMapper.toResponse(taskService.getById(id));
    }

    @PostMapping
    public TaskResponse createTask(@Valid @RequestBody TaskRequest request) {
        return TaskMapper.toResponse(taskService.create(request));
    }

    @PutMapping("/{id}")
    public TaskResponse updateTask(@PathVariable UUID id, @RequestBody TaskUpdateRequest request) {
        return TaskMapper.toResponse(taskService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable UUID id) {
        taskService.delete(id);
    }
}
