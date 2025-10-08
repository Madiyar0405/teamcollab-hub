import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ReactNode } from "react";

interface DroppableColumnProps {
  id: string;
  children: ReactNode;
  items: string[];
}

export const DroppableColumn = ({ id, children, items }: DroppableColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <SortableContext
      id={id}
      items={items}
      strategy={verticalListSortingStrategy}
    >
      <div 
        ref={setNodeRef} 
        className={`transition-colors ${isOver ? 'ring-2 ring-primary ring-offset-2' : ''}`}
      >
        {children}
      </div>
    </SortableContext>
  );
};
