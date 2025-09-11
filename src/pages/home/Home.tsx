


// import React from 'react'
// import MainLayout from '@components/layout/MainLayout';
import { Outlet,  Navigate, useNavigate } from 'react-router-dom';
import Breadcrumb from "./components/Breadcrumb";
import { useAuth } from '@context/AuthContext';
import { BreadcrumbProvider } from '@context/BreadcrumbContext';



// const Home = () => {
//   const isAuthenticated = true
//   // const isAuthenticated = Boolean(localStorage.getItem("token")); // example auth check

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return (
//     <div>
// 			<p>Header</p>
// 			<p>Navbar</p>
// 			<div className="flex flex-col flex-wrap gap-4">
// 				<Breadcrumb />
// 			</div>
// 			<Outlet />
// 			<p>footer</p>
// 		</div>
    
//   );
// }

// export default Home



import React, { useEffect, useRef, useState } from "react";
import {Avatar, Button, ScrollShadow, Spacer, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
import {useMediaQuery} from "usehooks-ts";
import {cn} from "@heroui/react";

import Sidebar from "./components/Sidebar";

import {sectionItemsWithTeams} from "./components/sidebar-items";

/**
 *  This example requires installing the `usehooks-ts` package:
 * `npm install usehooks-ts`
 *
 * import {useMediaQuery} from "usehooks-ts";
 *
 * 💡 TIP: You can use the usePathname hook from Next.js App Router to get the current pathname
 * and use it as the active key for the Sidebar component.
 *
 * ```tsx
 * import {usePathname} from "next/navigation";
 *
 * const pathname = usePathname();
 * const currentPath = pathname.split("/")?.[1]
 *
 * <Sidebar defaultSelectedKey="home" selectedKeys={[currentPath]} />
 * ```
 */
export default function Component() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { logout, user } = useAuth();
  
  const isCompact = isCollapsed || isMobile;

  const navigate = useNavigate();

  const onToggle = React.useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

   const [height, setHeight] = useState(window.innerHeight);

  const headerRef = useRef<HTMLDivElement>(null);
  const [mainHeight, setMainHeight] = useState(window.innerHeight);

  useEffect(() => {
    const updateHeight = () => {
      const headerHeight = headerRef.current?.offsetHeight || 0;

      console.log("headerHeight",headerHeight)
      setMainHeight(window.innerHeight - headerHeight - 16 - 40); // -16 for your mt-4
    };

    updateHeight(); // run on mount
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, []);
  const handleLogout = () => {
    logout();
    navigate("/login");
  }

  console.log(mainHeight)

  return (
    <BreadcrumbProvider>
      <div className="flex h-screen w-full">
        <div
          className={cn(
            "border-r-small! border-divider transition-width relative flex h-full w-72 flex-col p-1",
            {
              "w-16 items-center px-2 py-6": isCompact,
            },
          )}
        >
        <div
          className={cn(
            "flex items-center gap-3 px-3",

            {
              "justify-center gap-0": isCompact,
            },
          )}
        >
          {/* <div className="bg-foreground flex h-8 w-8 items-center justify-center rounded-full">
            <img src="./xenoptics_only_logo.png" alt="Xen Logistic Logo"/>
          </div> */}
          <span
            className={cn("text-small font-bold uppercase opacity-100", {
              "w-0 opacity-0": isCompact,
            })}
          >
            Logistics 
          </span>
        </div>
        <Spacer y={8} />
        <div className="flex items-center gap-3 px-3">
          <Avatar
            isBordered
            className="flex-none"
            size="sm"
            // src="https://i.pravatar.cc/150?u=a04258114e29026708c"
          />
          <div className={cn("flex max-w-full flex-col", {hidden: isCompact})}>
            <p className="text-small text-default-600 truncate font-medium">{user?.name || 'User'}</p>
            <p className="text-tiny text-default-400 truncate">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
        <ScrollShadow className="-mr-6 h-full max-h-full py-6 pr-6">
          <Sidebar defaultSelectedKey="home" isCompact={isCompact} items={sectionItemsWithTeams} />
        </ScrollShadow>
        <Spacer y={2} />
        <div
          className={cn("mt-auto flex flex-col", {
            "items-center": isCompact,
          })}
        >
          <Tooltip content="Help & Feedback" isDisabled={!isCompact} placement="right">
            <Button
              fullWidth
              className={cn(
                "text-default-500 data-[hover=true]:text-foreground justify-start truncate",
                {
                  "justify-center": isCompact,
                },
              )}
              isIconOnly={isCompact}
              startContent={
                isCompact ? null : (
                  <Icon
                    className="text-default-500 flex-none"
                    icon="solar:info-circle-line-duotone"
                    width={24}
                  />
                )
              }
              variant="light"
            >
              {isCompact ? (
                <Icon
                  className="text-default-500"
                  icon="solar:info-circle-line-duotone"
                  width={24}
                />
              ) : (
                "Help & Information"
              )}
            </Button>
          </Tooltip>
          <Tooltip content="Log Out" isDisabled={!isCompact} placement="right">
            <Button
              className={cn("text-default-500 data-[hover=true]:text-foreground justify-start", {
                "justify-center": isCompact,
              })}
              isIconOnly={isCompact}
              startContent={
                isCompact ? null : (
                  <Icon
                    className="text-default-500 flex-none rotate-180"
                    icon="solar:minus-circle-line-duotone"
                    width={24}
                  />
                )
              }
              variant="light"
              onPress={handleLogout}
            >
              {isCompact ? (
                <Icon
                  className="text-default-500 rotate-180"
                  icon="solar:minus-circle-line-duotone"
                  width={24}
                />
              ) : (
                "Log Out"
              )}
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="w-full flex-1 flex-col p-4">
        <header ref={headerRef} className="rounded-medium border-small border-divider flex items-center gap-3 p-4">
          <Button isIconOnly size="sm" variant="light" onPress={onToggle}>
            <Icon
              className="text-default-500"
              height={24}
              icon="solar:sidebar-minimalistic-outline"
              width={24}
            />
          </Button>
          <h2 className="text-medium text-default-700 font-medium">
						<Breadcrumb />
					</h2>
        </header>
        <main 
          className="mt-4 w-full rounded-medium border-small border-divider  overflow-auto"
          style={{ height: mainHeight }}
        > 
          <div className="h-full w-full flex  flex-col gap-4  " >
						<Outlet />
					</div>
        </main>
      </div>
    </div>
    </BreadcrumbProvider>
  );
}
