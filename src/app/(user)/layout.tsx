import { UserAppShell } from "@/components/user/user-app-shell";
import { getUserShell } from "@/infrastructure/auth/session";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const { avatarUrl, displayName, points } = await getUserShell();

  return (
    <UserAppShell avatarUrl={avatarUrl} displayName={displayName} points={points}>
      {children}
    </UserAppShell>
  );
}
