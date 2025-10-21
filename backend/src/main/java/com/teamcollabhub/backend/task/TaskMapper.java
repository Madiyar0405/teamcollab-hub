package com.teamcollabhub.backend.task;

public final class TaskMapper {

    private TaskMapper() {
    }

    public static TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getEvent().getId(),
                task.getColumn().getId(),
                task.getPriority() != null ? task.getPriority().name().toLowerCase() : null,
                task.getAssignedTo() != null ? task.getAssignedTo().getId() : null,
                task.getCreatedBy() != null ? task.getCreatedBy().getId() : null,
                task.getCreatedAt(),
                task.getUpdatedAt(),
                task.getStatus() != null ? task.getStatus().name().toLowerCase().replace('_', '-') : null,
                task.getDueDate()
        );
    }
}
