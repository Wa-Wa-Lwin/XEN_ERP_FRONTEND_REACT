import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Progress
} from '@heroui/react'

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/')
  }

  const menuItems = [
    "Dashboard",
    "Projects",
    "Team",
    "Analytics",
    "Settings"
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuOpenChange={setIsMenuOpen} className="bg-white shadow-sm">
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
          <NavbarBrand>
            <p className="font-bold text-inherit text-xl">MyApp</p>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {menuItems.map((item, index) => (
            <NavbarItem key={`${item}-${index}`}>
              <Button
                color="foreground"
                variant="light"
                className="font-medium"
              >
                {item}
              </Button>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent justify="end">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="secondary"
                name="Jason Hughes"
                size="sm"
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">jason@example.com</p>
              </DropdownItem>
              <DropdownItem key="settings">My Settings</DropdownItem>
              <DropdownItem key="team_settings">Team Settings</DropdownItem>
              <DropdownItem key="analytics">Analytics</DropdownItem>
              <DropdownItem key="system">System</DropdownItem>
              <DropdownItem key="configurations">Configurations</DropdownItem>
              <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
              <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>

        <NavbarMenu>
          {menuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Button
                color="foreground"
                variant="light"
                className="w-full justify-start"
              >
                {item}
              </Button>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Jason!</h1>
          <p className="text-gray-600">Here's what's happening with your projects today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium">Total Revenue</p>
              <Chip color="success" variant="flat" size="sm">+20.1%</Chip>
            </CardHeader>
            <CardBody>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium">Subscriptions</p>
              <Chip color="success" variant="flat" size="sm">+180.1%</Chip>
            </CardHeader>
            <CardBody>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium">Sales</p>
              <Chip color="danger" variant="flat" size="sm">+19%</Chip>
            </CardHeader>
            <CardBody>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Recent Projects</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Website Redesign</p>
                  <p className="text-sm text-gray-500">Due in 3 days</p>
                </div>
                <Progress value={75} className="w-20" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mobile App</p>
                  <p className="text-sm text-gray-500">Due in 1 week</p>
                </div>
                <Progress value={45} className="w-20" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">API Integration</p>
                  <p className="text-sm text-gray-500">Due in 2 weeks</p>
                </div>
                <Progress value={90} className="w-20" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Quick Actions</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <Button color="primary" className="w-full justify-start">
                Create New Project
              </Button>
              <Button color="secondary" variant="bordered" className="w-full justify-start">
                View Analytics
              </Button>
              <Button color="default" variant="bordered" className="w-full justify-start">
                Manage Team
              </Button>
              <Button color="default" variant="bordered" className="w-full justify-start">
                Settings
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Home
