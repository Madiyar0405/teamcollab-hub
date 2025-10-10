import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { motion } from "framer-motion";
import { useProfiles } from "@/hooks/useProfiles";
import { useTasks } from "@/hooks/useTasks";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mail, Briefcase, ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Employees() {
  const navigate = useNavigate();
  const { profiles } = useProfiles();
  const { tasks } = useTasks();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "tasks">("name");

  // Подсчет активных задач для каждого сотрудника
  const employeesWithTasks = profiles.map((user) => {
    const userTasks = tasks.filter(t => t.assignedTo === user.id);
    const activeTasks = userTasks.filter(t => t.columnId !== 'done').length;
    const completed = userTasks.filter(t => t.columnId === 'done').length;
    
    return {
      ...user,
      activeTasksCount: activeTasks,
      completedTasks: completed,
    };
  });

  // Фильтрация и сортировка
  const filteredEmployees = employeesWithTasks
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else {
        return b.activeTasksCount - a.activeTasksCount;
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Команда</h1>
          <p className="text-muted-foreground">
            Список всех сотрудников и их текущая загрузка
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">
                {profiles.length}
              </div>
              <p className="text-sm text-muted-foreground">Всего сотрудников</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-warning/30 bg-warning/5">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-warning">
                {tasks.length}
              </div>
              <p className="text-sm text-muted-foreground">Активных задач</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-success/30 bg-success/5">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-success">
                {profiles.length > 0 ? (tasks.length / profiles.length).toFixed(1) : '0'}
              </div>
              <p className="text-sm text-muted-foreground">
                Средняя загрузка
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Поиск сотрудников..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">По имени</SelectItem>
              <SelectItem value="tasks">По загрузке</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Employees Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredEmployees.map((employee, index) => (
            <motion.div
              key={employee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="border-2 hover:shadow-lg transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16 border-2 border-primary/20">
                      <AvatarImage src={employee.avatar} alt={employee.name} />
                      <AvatarFallback className="text-lg">
                        {employee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {employee.name}
                      </h3>
                      <Badge variant="secondary" className="mt-1">
                        {employee.role}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span>{employee.department}</span>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-warning">
                          {employee.activeTasksCount}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Активных задач
                        </p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-success">
                          {employee.completedTasks}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Выполнено
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/user/${employee.id}`)}
                  >
                    Посмотреть профиль
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Сотрудники не найдены</p>
          </div>
        )}
      </main>
    </div>
  );
}
