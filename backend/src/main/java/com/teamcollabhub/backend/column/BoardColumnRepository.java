package com.teamcollabhub.backend.column;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BoardColumnRepository extends JpaRepository<BoardColumn, UUID> {
    List<BoardColumn> findByEventIdOrderByOrderIndexAsc(UUID eventId);
}
