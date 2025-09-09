


// import React from 'react'
// import MainLayout from '@components/layout/MainLayout';
import { Outlet,  Navigate, useNavigate } from 'react-router-dom';
import Breadcrumb from "./components/Breadcrumb";
import { useAuth } from '@context/AuthContext';



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

import {AcmeIcon} from "./components/acme";
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
    <div className="flex h-screen w-full">
      <div
        className={cn(
          "border-r-small! border-divider transition-width relative flex h-full w-72 flex-col p-6",
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
          <div className="bg-foreground flex h-8 w-8 items-center justify-center rounded-full">
            <img src="./images/xenoptics_only_logo.png" alt="Xen Logistic Logo"/>
          </div>
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
  );
}















// import { useState } from 'react'
// import { Router, useNavigate } from 'react-router-dom'
// import {
//   Navbar,
//   NavbarBrand,
//   NavbarContent,
//   NavbarItem,
//   NavbarMenuToggle,
//   NavbarMenu,
//   NavbarMenuItem,
//   Button,
//   Card,
//   CardBody,
//   CardHeader,
//   Avatar,
//   Dropdown,
//   DropdownTrigger,
//   DropdownMenu,
//   DropdownItem,
//   Chip,
//   Progress
// } from '@heroui/react'

// import { Routes, Route, Navigate } from 'react-router-dom';
// import { Suspense, lazy } from 'react';

// import Logistics from "@features/logistics/Logistics";
// import Shipment from "@features/shipment/Shipment";
// import ShipmentDetails from "@features/shipment/components/ShipmentDetails";
// import ShipmentForm from "@features/shipment/components/ShipmentForm";
// import Overview from '@features/overview/Overview';

// const Home = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false)
//   const navigate = useNavigate()

//   const handleLogout = () => {
//     navigate('/')
//   }

//   const menuItems = [
//     "Dashboard",
//     "Projects",
//     "Team",
//     "Analytics",
//     "Settings"
//   ]

//   // Loading component
// const Loading = () => (
//   <div className="flex items-center justify-center min-h-screen">
//     <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
//   </div>
// );

//   return (
//     <Suspense fallback={<Loading />}>
//       <Routes>
//         <Route path="/overview" element={<Overview />} />
        
//         {/* packaging */}
//         {/* hs-code-and-duty */}
//         <Route path="/logistics/:category?" element={<Logistics />} />
//         <Route path="/logistics" element={<Navigate to="/logistics/packaging" replace />} />

//         <Route path="/shipment" element={<Shipment />} />
//         <Route path="/shipment/:shipmentId" element={<ShipmentDetails />} />
//         <Route path="/shipment/request-form" element={<ShipmentForm />} />

//         <Route path="/" element={<Overview />} />
//       </Routes>
//     </Suspense>
    
//   )
// }

// export default Home





// // <div className="min-h-screen bg-gray-50">
//     //   <Navbar onMenuOpenChange={setIsMenuOpen} className="bg-white shadow-sm">
//     //     <NavbarContent>
//     //       <NavbarMenuToggle
//     //         aria-label={isMenuOpen ? "Close menu" : "Open menu"}
//     //         className="sm:hidden"
//     //       />
//     //       <NavbarBrand>
//     //         <p className="font-bold text-inherit text-xl">MyApp</p>
//     //       </NavbarBrand>
//     //     </NavbarContent>

//     //     <NavbarContent className="hidden sm:flex gap-4" justify="center">
//     //       {menuItems.map((item, index) => (
//     //         <NavbarItem key={`${item}-${index}`}>
//     //           <Button
//     //             color="foreground"
//     //             variant="light"
//     //             className="font-medium"
//     //           >
//     //             {item}
//     //           </Button>
//     //         </NavbarItem>
//     //       ))}
//     //     </NavbarContent>

//     //     <NavbarContent justify="end">
//     //       <Dropdown placement="bottom-end">
//     //         <DropdownTrigger>
//     //           <Avatar
//     //             isBordered
//     //             as="button"
//     //             className="transition-transform"
//     //             color="secondary"
//     //             name="Jason Hughes"
//     //             size="sm"
//     //             src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
//     //           />
//     //         </DropdownTrigger>
//     //         <DropdownMenu aria-label="Profile Actions" variant="flat">
//     //           <DropdownItem key="profile" className="h-14 gap-2">
//     //             <p className="font-semibold">Signed in as</p>
//     //             <p className="font-semibold">jason@example.com</p>
//     //           </DropdownItem>
//     //           <DropdownItem key="settings">My Settings</DropdownItem>
//     //           <DropdownItem key="team_settings">Team Settings</DropdownItem>
//     //           <DropdownItem key="analytics">Analytics</DropdownItem>
//     //           <DropdownItem key="system">System</DropdownItem>
//     //           <DropdownItem key="configurations">Configurations</DropdownItem>
//     //           <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
//     //           <DropdownItem key="logout" color="danger" onClick={handleLogout}>
//     //             Log Out
//     //           </DropdownItem>
//     //         </DropdownMenu>
//     //       </Dropdown>
//     //     </NavbarContent>

//     //     <NavbarMenu>
//     //       {menuItems.map((item, index) => (
//     //         <NavbarMenuItem key={`${item}-${index}`}>
//     //           <Button
//     //             color="foreground"
//     //             variant="light"
//     //             className="w-full justify-start"
//     //           >
//     //             {item}
//     //           </Button>
//     //         </NavbarMenuItem>
//     //       ))}
//     //     </NavbarMenu>
//     //   </Navbar>

//     //   <div className="container mx-auto px-4 py-8">
//     //     <div className="mb-8">
//     //       <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Jason!</h1>
//     //       <p className="text-gray-600">Here's what's happening with your projects today.</p>
//     //     </div>

//     //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//     //       <Card>
//     //         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//     //           <p className="text-sm font-medium">Total Revenue</p>
//     //           <Chip color="success" variant="flat" size="sm">+20.1%</Chip>
//     //         </CardHeader>
//     //         <CardBody>
//     //           <div className="text-2xl font-bold">$45,231.89</div>
//     //           <p className="text-xs text-muted-foreground">
//     //             +20.1% from last month
//     //           </p>
//     //         </CardBody>
//     //       </Card>

//     //       <Card>
//     //         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//     //           <p className="text-sm font-medium">Subscriptions</p>
//     //           <Chip color="success" variant="flat" size="sm">+180.1%</Chip>
//     //         </CardHeader>
//     //         <CardBody>
//     //           <div className="text-2xl font-bold">+2350</div>
//     //           <p className="text-xs text-muted-foreground">
//     //             +180.1% from last month
//     //           </p>
//     //         </CardBody>
//     //       </Card>

//     //       <Card>
//     //         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//     //           <p className="text-sm font-medium">Sales</p>
//     //           <Chip color="danger" variant="flat" size="sm">+19%</Chip>
//     //         </CardHeader>
//     //         <CardBody>
//     //           <div className="text-2xl font-bold">+12,234</div>
//     //           <p className="text-xs text-muted-foreground">
//     //             +19% from last month
//     //           </p>
//     //         </CardBody>
//     //       </Card>
//     //     </div>

//     //     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//     //       <Card>
//     //         <CardHeader>
//     //           <h3 className="text-lg font-semibold">Recent Projects</h3>
//     //         </CardHeader>
//     //         <CardBody className="space-y-4">
//     //           <div className="flex items-center justify-between">
//     //             <div>
//     //               <p className="font-medium">Website Redesign</p>
//     //               <p className="text-sm text-gray-500">Due in 3 days</p>
//     //             </div>
//     //             <Progress value={75} className="w-20" />
//     //           </div>
//     //           <div className="flex items-center justify-between">
//     //             <div>
//     //               <p className="font-medium">Mobile App</p>
//     //               <p className="text-sm text-gray-500">Due in 1 week</p>
//     //             </div>
//     //             <Progress value={45} className="w-20" />
//     //           </div>
//     //           <div className="flex items-center justify-between">
//     //             <div>
//     //               <p className="font-medium">API Integration</p>
//     //               <p className="text-sm text-gray-500">Due in 2 weeks</p>
//     //             </div>
//     //             <Progress value={90} className="w-20" />
//     //           </div>
//     //         </CardBody>
//     //       </Card>

//     //       <Card>
//     //         <CardHeader>
//     //           <h3 className="text-lg font-semibold">Quick Actions</h3>
//     //         </CardHeader>
//     //         <CardBody className="space-y-3">
//     //           <Button color="primary" className="w-full justify-start">
//     //             Create New Project
//     //           </Button>
//     //           <Button color="secondary" variant="bordered" className="w-full justify-start">
//     //             View Analytics
//     //           </Button>
//     //           <Button color="default" variant="bordered" className="w-full justify-start">
//     //             Manage Team
//     //           </Button>
//     //           <Button color="default" variant="bordered" className="w-full justify-start">
//     //             Settings
//     //           </Button>
//     //         </CardBody>
//     //       </Card>
//     //     </div>
//     //   </div>
//     // </div>