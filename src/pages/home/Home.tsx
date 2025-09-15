


// import React from 'react'
// import MainLayout from '@components/layout/MainLayout';
import { Outlet,  useNavigate } from 'react-router-dom';
import Breadcrumb from "./components/Breadcrumb";
import { useAuth } from '@context/AuthContext';
import { BreadcrumbProvider } from '@context/BreadcrumbContext';
import React, { useEffect, useRef, useState } from "react";
import {Avatar, Button, ScrollShadow, Spacer, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
import {useMediaQuery} from "usehooks-ts";
import {cn} from "@heroui/react";

import Sidebar from "./components/Sidebar";

import {sectionItemsWithTeams} from "./components/sidebar-items";
import { useParcelItemsCache } from '@hooks/useParcelItemsCache';

export default function Component() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { logout, user, hasDbData, msLoginUser } = useAuth();
  const { fetchParcelItems } = useParcelItemsCache();
  
  const isCompact = isCollapsed || isMobile;

  const navigate = useNavigate();

  const onToggle = React.useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const headerRef = useRef<HTMLDivElement>(null);
  const [mainHeight, setMainHeight] = useState(window.innerHeight);

  useEffect(() => {
    const updateHeight = () => {
      const headerHeight = headerRef.current?.offsetHeight || 0;

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

  // const handleSidebarSelect = async (key: string) => {
  //   // Pre-fetch parcel items when request form is accessed
  //   if (key === 'request-form') {
  //     try {
  //       await fetchParcelItems();
  //       console.log('Parcel items cached successfully');
  //     } catch (error) {
  //       console.error('Failed to cache parcel items:', error);
  //     }
  //   }
  // }
  const handleSidebarSelect = (key: string) => {
    if (key === 'request-form') {
      fetchParcelItems().catch(() => {
        // Silently handle error - user will see loading state if needed
      });
    }
  };



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
            "flex items-center gap-3 p-3",

            {
              "justify-center gap-0": isCompact,
            },
          )}
        >
          <div className="bg-foreground flex h-8 w-8 items-center justify-center rounded-full">
            <img src="/xenoptics_only_logo.png" alt="Xen Logistic Logo"/>
          </div>
          <span
            className={cn("text-small font-bold uppercase opacity-100", {
              "w-0 opacity-0": isCompact,
            })}
          >
            LOGISTIC SYSTEM
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
            <p className="text-small text-default-600 truncate font-medium">{user?.firstName || 'User'}</p>
            <p className="text-tiny text-default-400 truncate">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
        <ScrollShadow className="-mr-6 h-full max-h-full py-6 pr-6">
          <Sidebar 
            defaultSelectedKey="home" 
            isCompact={isCompact} 
            items={sectionItemsWithTeams}
            onSelect={handleSidebarSelect}
          />
        </ScrollShadow>
        <Spacer y={2} />
        <div
          className={cn("mt-auto flex flex-col", {
            "items-center": isCompact,
          })}
        >
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
        
        {/* Database Status Notification */}
        {msLoginUser && !hasDbData && (
          <div className="mt-4 p-4 bg-warning-50 border border-warning-200 rounded-medium">
            <div className="flex items-center gap-2">
              <Icon 
                icon="solar:info-circle-bold" 
                className="text-warning-600" 
                width={20} 
              />
              <p className="text-warning-800 text-sm font-medium">
                Don't have your data in database
              </p>
            </div>
            <p className="text-warning-700 text-xs mt-1 ml-6">
              Your @xenoptics.com account is authenticated, but we couldn't find your profile data in our database. Please contact your administrator.
            </p>
          </div>
        )}
        
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
