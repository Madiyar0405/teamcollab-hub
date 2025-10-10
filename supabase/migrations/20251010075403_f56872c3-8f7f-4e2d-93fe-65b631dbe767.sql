-- Создание enum для ролей
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Создание таблицы профилей пользователей
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  department TEXT,
  joined_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включение RLS для профилей
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Политики для профилей
CREATE POLICY "Пользователи могут видеть все профили"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Пользователи могут обновлять свой профиль"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Создание таблицы ролей пользователей
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Включение RLS для ролей
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Политики для ролей
CREATE POLICY "Пользователи могут видеть свои роли"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Только админы могут управлять ролями"
ON public.user_roles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Функция для проверки ролей (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Триггер для автоматического создания профиля
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar, department)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Новый пользователь'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'department', 'Команда')
  );
  
  -- Назначение роли по умолчанию
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Создание таблицы событий
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Все могут видеть события"
ON public.events FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Только админы и модераторы могут создавать события"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

CREATE POLICY "Только админы и модераторы могут обновлять события"
ON public.events FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

CREATE POLICY "Только админы могут удалять события"
ON public.events FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Создание таблицы колонок
CREATE TABLE public.columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Все могут видеть колонки"
ON public.columns FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Только админы и модераторы могут управлять колонками"
ON public.columns FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

-- Создание таблицы задач
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  column_id UUID REFERENCES public.columns(id) ON DELETE CASCADE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Пользователи могут видеть все задачи"
ON public.tasks FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Пользователи могут создавать задачи"
ON public.tasks FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Создатель и назначенный могут обновлять задачу"
ON public.tasks FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "Только создатель и админы могут удалять задачи"
ON public.tasks FOR DELETE
TO authenticated
USING (
  created_by = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Создание таблицы чатов
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  type TEXT NOT NULL CHECK (type IN ('personal', 'group')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Создание таблицы участников чата
CREATE TABLE public.chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (chat_id, user_id)
);

ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Пользователи видят чаты где они участники"
ON public.chats FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_id = id AND user_id = auth.uid()
  )
);

CREATE POLICY "Пользователи могут создавать чаты"
ON public.chats FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Участники видят участников своих чатов"
ON public.chat_participants FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants cp
    WHERE cp.chat_id = chat_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Пользователи могут добавлять участников в чаты"
ON public.chat_participants FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_id = chat_participants.chat_id AND user_id = auth.uid()
  )
);

-- Создание таблицы сообщений
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  reply_to UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Участники чата могут видеть сообщения"
ON public.chat_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_id = chat_messages.chat_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Участники могут отправлять сообщения"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_id = chat_messages.chat_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Пользователи могут удалять свои сообщения"
ON public.chat_messages FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Включение realtime для чатов
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;