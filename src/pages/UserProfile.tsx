import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { motion } from "framer-motion";
import { useTasks } from "@/hooks/useTasks";
import { useProfile } from "@/hooks/useProfiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Clock, Mail, User as UserIcon, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { tasks } = useTasks();
  const { profile: user, loading } = useProfile(userId || '');
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Загрузка...</div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Пользователь не найден</h1>
            <Button onClick={() => navigate("/employees")}>Вернуться к команде</Button>
          </div>
        </main>
      </div>
    );
  }

  const userTasks = tasks.filter((t) => t.assignedTo === user.id);
  const activeTasks = userTasks.filter((t) => {
    // Задачи в колонках с именем "Завершено" или "Готово" считаются выполненными
    return t.columnId !== 'done';
  });
  const completedTasks = userTasks.filter((t) => t.columnId === 'done');

  const recentTasks = userTasks
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate("/employees")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к команде
          </Button>
          <h1 className="text-4xl font-bold mb-2">Профиль пользователя</h1>
          <p className="text-muted-foreground">Информация и статистика сотрудника</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="border-2">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-32 h-32 border-4 border-primary/20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-4xl">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <Badge variant="secondary" className="mt-2 w-fit mx-auto">
                  {user.role}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                  <span>{user.department}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>С нами с {formatDate(user.joinedDate)}</span>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">
                      {activeTasks.length}
                    </div>
                    <p className="text-xs text-muted-foreground">Активные</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">
                      {completedTasks.length}
                    </div>
                    <p className="text-xs text-muted-foreground">Выполнено</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats & Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Statistics */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Статистика</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-4 bg-info/10 rounded-lg border border-info/30">
                    <Clock className="w-8 h-8 text-info" />
                    <div>
                      <div className="text-2xl font-bold text-info">
                        {tasks.filter((t) => t.assignedTo === user.id && t.status === "todo").length}
                      </div>
                      <p className="text-xs text-muted-foreground">К выполнению</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-warning/10 rounded-lg border border-warning/30">
                    <Clock className="w-8 h-8 text-warning" />
                    <div>
                      <div className="text-2xl font-bold text-warning">
                        {tasks.filter((t) => t.assignedTo === user.id && t.status === "in-progress").length}
                      </div>
                      <p className="text-xs text-muted-foreground">В работе</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-success/10 rounded-lg border border-success/30">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                    <div>
                      <div className="text-2xl font-bold text-success">
                        {completedTasks.length}
                      </div>
                      <p className="text-xs text-muted-foreground">Завершено</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Недавняя активность</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTasks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      У пользователя пока нет задач
                    </p>
                  ) : (
                    recentTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            task.status === "done"
                              ? "bg-success"
                              : task.status === "in-progress"
                              ? "bg-warning"
                              : "bg-info"
                          }`}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {task.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge
                              variant="outline"
                              className={
                                task.status === "done"
                                  ? "bg-success/10 border-success/30 text-success"
                                  : task.status === "in-progress"
                                  ? "bg-warning/10 border-warning/30 text-warning"
                                  : "bg-info/10 border-info/30 text-info"
                              }
                            >
                              {task.status === "done"
                                ? "Завершено"
                                : task.status === "in-progress"
                                ? "В работе"
                                : "К выполнению"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(task.updatedAt).toLocaleDateString("ru-RU")}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
