import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTaskStore } from "@/store/useTaskStore";
import { Task } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface TaskSearchProps {
  onTaskSelect?: (task: Task) => void;
}

export const TaskSearch = ({ onTaskSelect }: TaskSearchProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { tasks } = useTaskStore();

  const searchResults = query.trim()
    ? tasks
        .filter(
          (task) =>
            task.title.toLowerCase().includes(query.toLowerCase()) ||
            task.description.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
    : [];

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Быстрый поиск задач..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2"
          >
            <Card className="p-2 shadow-lg border-2">
              {searchResults.map((task) => (
                <motion.div
                  key={task.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 rounded-lg hover:bg-muted cursor-pointer mb-1 last:mb-0"
                  onClick={() => {
                    onTaskSelect?.(task);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {task.description}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        task.priority === "high"
                          ? "bg-destructive/10 border-destructive/30 text-destructive"
                          : task.priority === "medium"
                          ? "bg-warning/10 border-warning/30 text-warning"
                          : "bg-info/10 border-info/30 text-info"
                      }
                    >
                      {task.priority === "high"
                        ? "Высокий"
                        : task.priority === "medium"
                        ? "Средний"
                        : "Низкий"}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
