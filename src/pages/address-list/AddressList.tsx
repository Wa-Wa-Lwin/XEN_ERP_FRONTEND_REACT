import { useState, useEffect, useMemo } from 'react'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Chip,
  Pagination,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem
} from '@heroui/react'
import { Icon } from '@iconify/react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { ISO_2_COUNTRIES } from '@pages/shipment/constants/iso2countries'
import type { AddressListData } from './types'
import { useAuth } from '@context/AuthContext'

const STORAGE_KEY = 'address_list_cache'

const AddressList = () => {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [addresses, setAddresses] = useState<AddressListData[]>([])
  const [allAddresses, setAllAddresses] = useState<AddressListData[]>([])
  const [activeAddresses, setActiveAddresses] = useState<AddressListData[]>([])
  const [inactiveAddresses, setInactiveAddresses] = useState<AddressListData[]>([])
  const [filteredAddresses, setFilteredAddresses] = useState<AddressListData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const { user, msLoginUser } = useAuth()
  const [sortConfig, setSortConfig] = useState<{ key: keyof AddressListData | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc'
  })
  const [formData, setFormData] = useState({
    CardCode: '',
    company_name: '',
    CardType: 'S',
    street1: '',
    street2: '',
    street3: '',
    city: '',
    state: '',
    country: 'TH',
    postal_code: '',
    contact_name: '',
    contact: '',
    phone: '',
    email: '',
    tax_id: '',
    phone1: '',
    website: '',
    eori_number: ''
  })

  // Automatically generate full address from address components
  const fullAddress = [
    formData.street1,
    formData.street2,
    formData.street3,
    formData.city,
    formData.state,
    formData.country,
    formData.postal_code
  ].filter(Boolean).join(', ')
  const itemsPerPage = 15

  const fetchAddresses = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        try {
          const cachedData = JSON.parse(cached)
          setAllAddresses(cachedData.all_address_list || [])
          setActiveAddresses(cachedData.all_active_address_list || [])
          setInactiveAddresses(cachedData.all_inactive_address_list || [])

          // Set addresses based on current filter
          if (statusFilter === 'active') {
            setAddresses(cachedData.all_active_address_list || [])
          } else if (statusFilter === 'inactive') {
            setAddresses(cachedData.all_inactive_address_list || [])
          } else {
            setAddresses(cachedData.all_address_list || [])
          }
          return
        } catch (error) {
          console.error('Failed to parse cached data:', error)
        }
      }
    }

    setIsLoading(true)
    try {
      const response = await axios.get(import.meta.env.VITE_APP_NEW_ADDRESS_LIST_GET_ALL)
      if (response.data) {
        const allData = response.data.all_address_list || []
        const activeData = response.data.all_active_address_list || []
        const inactiveData = response.data.all_inactive_address_list || []

        setAllAddresses(allData)
        setActiveAddresses(activeData)
        setInactiveAddresses(inactiveData)

        // Set addresses based on current filter
        if (statusFilter === 'active') {
          setAddresses(activeData)
        } else if (statusFilter === 'inactive') {
          setAddresses(inactiveData)
        } else {
          setAddresses(allData)
        }

        // Cache the entire response
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data))
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForceRefresh = () => {
    fetchAddresses(true)
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  useEffect(() => {
    fetchAddresses()
  }, [statusFilter])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAddresses(addresses)
    } else {
      const q = searchQuery.toLowerCase()
      const filtered = addresses.filter(address =>
        (address.company_name || '').toLowerCase().includes(q) ||
        (address.CardCode || '').toLowerCase().includes(q) ||
        (address.city || '').toLowerCase().includes(q) ||
        (address.state || '').toLowerCase().includes(q) ||
        (address.contact_name || '').toLowerCase().includes(q) ||
        (address.phone || '').toLowerCase().includes(q) ||
        (address.country || '').toLowerCase().includes(q)
      )
      setFilteredAddresses(filtered)
    }
    setCurrentPage(1)
  }, [searchQuery, addresses])

  const handleStatusFilterChange = (filter: 'all' | 'active' | 'inactive') => {
    setStatusFilter(filter)
    setSearchQuery('')
  }

  const handleSort = (key: keyof AddressListData) => {
    setSortConfig((currentConfig) => {
      if (currentConfig.key === key) {
        // Toggle direction if clicking the same column
        return {
          key,
          direction: currentConfig.direction === 'asc' ? 'desc' : 'asc'
        }
      }
      // New column, default to ascending
      return { key, direction: 'asc' }
    })
  }

  // Sort the filtered addresses
  const sortedAddresses = useMemo(() => {
    if (!sortConfig.key) {
      return filteredAddresses
    }

    const sorted = [...filteredAddresses].sort((a, b) => {
      const aValue = a[sortConfig.key!]
      const bValue = b[sortConfig.key!]

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      // Compare values
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })

    return sorted
  }, [filteredAddresses, sortConfig])

  const totalPages = Math.ceil(sortedAddresses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = sortedAddresses.slice(startIndex, endIndex)

  const handleCreateNew = () => {
    setFormData({
      CardCode: '',
      company_name: '',
      CardType: 'S',
      street1: '',
      street2: '',
      street3: '',
      city: '',
      state: '',
      country: 'TH',
      postal_code: '',
      contact_name: '',
      contact: '',
      phone: '',
      email: '',
      tax_id: '',
      phone1: '',
      website: '',
      eori_number: ''
    })
    setFormErrors({})
    onOpen()
  }

  const handleViewDetail = (addressID: number) => {
    navigate(`/local/address-list/${addressID}`)
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.company_name.trim()) {
      errors.company_name = 'Company name is required'
    }
    if (!formData.street1.trim()) {
      errors.street1 = 'Street 1 is required'
    }
    if (!formData.city.trim()) {
      errors.city = 'City is required'
    }
    if (!formData.state.trim()) {
      errors.state = 'State is required'
    }
    if (!formData.country.trim()) {
      errors.country = 'Country is required'
    }
    if (!formData.postal_code.trim()) {
      errors.postal_code = 'Postal code is required'
    }
    if (!formData.contact_name.trim()) {
      errors.contact_name = 'Contact name is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsCreating(true)
    try {
      const payload = {
        ...formData,
        full_address: fullAddress,
        active: 1,
        user_id: user?.userID,
        user_name: msLoginUser?.name
      }

      await axios.post(import.meta.env.VITE_APP_NEW_ADDRESS_LIST_CREATE, payload)

      // Clear cache and force refresh
      localStorage.removeItem(STORAGE_KEY)

      onClose()
      setFormErrors({})

      // Force refresh to show the new address
      await fetchAddresses(true)
    } catch (error: any) {
      console.error('Failed to save address:', error)

      // Handle validation errors from backend
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const backendErrors: Record<string, string> = {}
        Object.keys(error.response.data.errors).forEach(key => {
          backendErrors[key] = error.response.data.errors[key][0]
        })
        setFormErrors(backendErrors)
      } else {
        alert('Failed to create address. Please try again.')
      }
    } finally {
      setIsCreating(false)
    }
  }

  // Helper component for sortable column headers
  const SortableHeader = ({ columnKey, label, className = '' }: { columnKey: keyof AddressListData; label: string; className?: string }) => (
    <div
      className={`flex items-center gap-1 cursor-pointer select-none hover:text-primary transition-colors ${className}`}
      onClick={() => handleSort(columnKey)}
    >
      <span>{label}</span>
      {sortConfig.key === columnKey && (
        <Icon
          icon={sortConfig.direction === 'asc' ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'}
          width={16}
        />
      )}
    </div>
  )

  return (
    <div>
      <Card className="w-full">
        <CardHeader className="flex flex-col gap-4 pb-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-2 items-center">
              <h1 className="text-2xl font-bold">New Address List</h1>
              <Button
                color="primary"
                size="sm"
                onPress={handleCreateNew}
                startContent={<Icon icon="solar:add-circle-bold" />}
              >
                Create New
              </Button>
              <Button
                color="primary"
                variant="flat"
                size="sm"
                onPress={handleForceRefresh}
                isLoading={isLoading}
                startContent={!isLoading && <Icon icon="solar:refresh-bold" />}
              >
                Refresh
              </Button>
            </div>
            <Input
              placeholder="Search by company, city, contact..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Icon icon="solar:magnifer-bold" />}
              variant="bordered"
              className="max-w-md"
              isClearable
              onClear={() => setSearchQuery('')}
            />
            {/* Status Filter Tabs */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={statusFilter === 'all' ? 'solid' : 'flat'}
                color={statusFilter === 'all' ? 'primary' : 'default'}
                onPress={() => handleStatusFilterChange('all')}
              >
                All ({allAddresses.length})
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'active' ? 'solid' : 'flat'}
                color={statusFilter === 'active' ? 'success' : 'default'}
                onPress={() => handleStatusFilterChange('active')}
              >
                Active ({activeAddresses.length})
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'inactive' ? 'solid' : 'flat'}
                color={statusFilter === 'inactive' ? 'danger' : 'default'}
                onPress={() => handleStatusFilterChange('inactive')}
              >
                Inactive ({inactiveAddresses.length})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardBody className="overflow-visible p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" label="Loading addresses..." />
            </div>
          ) : (
            <>
              <Table
                aria-label="Address list table"
                classNames={{
                  wrapper: "min-h-[400px]",
                  table: "min-w-full",
                }}
                isStriped
              >
                <TableHeader>
                  <TableColumn className="w-16">
                    <SortableHeader columnKey="addressID" label="No." />
                  </TableColumn>
                  <TableColumn className="w-32">
                    <SortableHeader columnKey="CardCode" label="CODE" />
                  </TableColumn>
                  <TableColumn className="min-w-[250px]">
                    <SortableHeader columnKey="company_name" label="COMPANY" />
                  </TableColumn>
                  <TableColumn className="w-24">
                    <SortableHeader columnKey="country" label="COUNTRY" />
                  </TableColumn>
                  <TableColumn className="w-24">
                    <SortableHeader columnKey="CardType" label="TYPE" />
                  </TableColumn>
                  <TableColumn className="min-w-[300px]">
                    <SortableHeader columnKey="full_address" label="ADDRESS" />
                  </TableColumn>
                  <TableColumn className="w-32">
                    <SortableHeader columnKey="contact_name" label="CONTACT" />
                  </TableColumn>
                  <TableColumn className="w-40">
                    <SortableHeader columnKey="phone" label="PHONE" />
                  </TableColumn>
                  <TableColumn className="w-24">
                    <SortableHeader columnKey="active" label="STATUS" />
                  </TableColumn>
                </TableHeader>
                <TableBody emptyContent="No addresses found">
                  {currentItems.map((address, index) => (
                    <TableRow
                      key={address.addressID}
                      onClick={() => handleViewDetail(address.addressID)}
                      className="cursor-pointer hover:bg-yellow-100 transition-colors"
                    >
                      <TableCell>
                        <span className="text-sm font-medium text-default-600">
                          {startIndex + index + 1}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-default-600">
                          {address.CardCode || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {address.company_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {address.country}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color={address.CardType === 'S' ? 'primary' : 'secondary'}>
                          {address.CardType}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-default-600 line-clamp-2">
                          {address.full_address || `${address.street1}, ${address.city}, ${address.state} ${address.postal_code}`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-default-600">
                          {address.contact_name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-default-600">
                          {address.phone || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={address.active === '1' ? 'success' : 'danger'}
                        >
                          {address.active === '1' ? 'Active' : 'Inactive'}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex justify-center py-4">
                  <Pagination
                    total={totalPages}
                    page={currentPage}
                    onChange={setCurrentPage}
                    showControls
                    showShadow
                    color="primary"
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Create Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            Create New Address
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Card Code"
                value={formData.CardCode}
                onValueChange={(value) => setFormData({ ...formData, CardCode: value })}
              />
              <Input
                label="Company Name"
                isRequired
                value={formData.company_name}
                onValueChange={(value) => setFormData({ ...formData, company_name: value })}
                isInvalid={!!formErrors.company_name}
                errorMessage={formErrors.company_name}
              />
              <Select
                label="Card Type"
                isRequired
                selectedKeys={[formData.CardType]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string
                  setFormData({ ...formData, CardType: value })
                }}
              >
                <SelectItem key="S" value="S">S</SelectItem>
                <SelectItem key="C" value="C">C</SelectItem>
              </Select>
              <Input
                label="Street 1"
                isRequired
                value={formData.street1}
                onValueChange={(value) => setFormData({ ...formData, street1: value })}
                isInvalid={!!formErrors.street1}
                errorMessage={formErrors.street1}
              />
              <Input
                label="Street 2"
                value={formData.street2}
                onValueChange={(value) => setFormData({ ...formData, street2: value })}
              />
              <Input
                label="Street 3"
                value={formData.street3}
                onValueChange={(value) => setFormData({ ...formData, street3: value })}
              />
              <Input
                label="City"
                isRequired
                value={formData.city}
                onValueChange={(value) => setFormData({ ...formData, city: value })}
                isInvalid={!!formErrors.city}
                errorMessage={formErrors.city}
              />
              <Input
                label="State"
                isRequired
                value={formData.state}
                onValueChange={(value) => setFormData({ ...formData, state: value })}
                isInvalid={!!formErrors.state}
                errorMessage={formErrors.state}
              />
              <Autocomplete
                label="Country"
                isRequired
                selectedKey={formData.country}
                onSelectionChange={(key) => {
                  if (key) {
                    const countryCode = key.toString()
                    // Automatically set postal code for Hong Kong
                    if (countryCode === 'HK') {
                      setFormData({ ...formData, country: countryCode, postal_code: '00000' })
                    } else {
                      setFormData({ ...formData, country: countryCode })
                    }
                  }
                }}
              >
                {ISO_2_COUNTRIES.map((country) => (
                  <AutocompleteItem key={country.key} value={country.key}>
                    {country.value}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
              <Input
                label="Postal Code"
                isRequired
                value={formData.postal_code}
                onValueChange={(value) => setFormData({ ...formData, postal_code: value })}
                isInvalid={!!formErrors.postal_code}
                errorMessage={formErrors.postal_code}
              />
              <Input
                label="Contact Name"
                isRequired
                value={formData.contact_name}
                onValueChange={(value) => setFormData({ ...formData, contact_name: value })}
                isInvalid={!!formErrors.contact_name}
                errorMessage={formErrors.contact_name}
              />
              <Input
                label="Contact"
                value={formData.contact}
                onValueChange={(value) => setFormData({ ...formData, contact: value })}
              />
              <Input
                label="Phone"
                value={formData.phone}
                onValueChange={(value) => setFormData({ ...formData, phone: value })}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onValueChange={(value) => setFormData({ ...formData, email: value })}
              />
              <Input
                label="Tax ID"
                value={formData.tax_id}
                onValueChange={(value) => setFormData({ ...formData, tax_id: value })}
              />
              <Input
                label="Phone 1"
                value={formData.phone1}
                onValueChange={(value) => setFormData({ ...formData, phone1: value })}
              />
              <Input
                label="Website"
                value={formData.website}
                onValueChange={(value) => setFormData({ ...formData, website: value })}
              />
              <Input
                label="EORI Number"
                value={formData.eori_number}
                onValueChange={(value) => setFormData({ ...formData, eori_number: value })}
              />
              <Input
                label="Full Address (Auto-generated)"
                value={fullAddress}
                isReadOnly
                className="col-span-2"
                description="This field is automatically generated from the address fields above"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="default" onPress={onClose} isDisabled={isCreating}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={isCreating}
            >
              {isCreating ? 'Creating New Address...' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default AddressList
