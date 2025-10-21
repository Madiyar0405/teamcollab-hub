package com.teamcollabhub.backend.user;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                defaultAvatar(user),
                user.getRole(),
                user.getDepartment(),
                user.getActiveTasks(),
                user.getCompletedTasks(),
                user.getJoinedDate()
        );
    }

    private static String defaultAvatar(User user) {
        if (user.getAvatar() != null && !user.getAvatar().isBlank()) {
            return user.getAvatar();
        }
        if (user.getName() == null || user.getName().isBlank()) {
            return null;
        }
        return "https://ui-avatars.com/api/?name=" + user.getName().replace(" ", "%20") + "&background=0D8ABC&color=fff";
    }
}
