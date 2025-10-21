package com.teamcollabhub.backend.column;

public final class ColumnMapper {

    private ColumnMapper() {
    }

    public static ColumnResponse toResponse(BoardColumn column) {
        return new ColumnResponse(
                column.getId(),
                column.getTitle(),
                column.getEvent().getId(),
                column.getOrderIndex(),
                column.getColor()
        );
    }
}
