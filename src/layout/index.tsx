import ApplicationSidebar, {
  type NavigationItem,
} from "@/components/custom/ApplicationSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { navigation } from "@/data/nagivation";
import { getCurrentUser } from "@/lib/storage";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return null;
  }

  const navigationData: NavigationItem[] = navigation[currentUser.role];

  return (
    <SidebarProvider>
      <ApplicationSidebar
        navigation={navigationData}
        user={{
          name: currentUser.username,
          role: currentUser.role,
        }}
      />

      <main className="w-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
};

export default Layout;
