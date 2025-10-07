import { useState, useEffect } from 'react'
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
  useDisclosure
} from '@heroui/react'
import { Icon } from '@iconify/react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

interface AddressData {
  addressID: number
  CardCode: string
  company_name: string
  CardType: string
  full_address: string
  street1: string
  street2: string
  street3: string
  city: string
  state: string
  country: string
  postal_code: string
  contact_name: string
  contact: string
  phone: string
  email: string
  tax_id: string
  phone1: string
  website: string
  active: string
  created_userID: number | null
  created_time: string | null
  updated_userID: number | null
  updated_time: string | null
  created_user_name: string | null
  updated_user_name: string | null
  eori_number: string | null
}

const STORAGE_KEY = 'address_list_cache'

const AddressList = () => {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const [addresses, setAddresses] = useState<AddressData[]>([])
  const [filteredAddresses, setFilteredAddresses] = useState<AddressData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingAddress, setEditingAddress] = useState<AddressData | null>(null)
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    CardCode: '',
    company_name: '',
    CardType: 'S',
    full_address: '',
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
  const itemsPerPage = 15

  const fetchAddresses = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        try {
          const cachedData = JSON.parse(cached)
          setAddresses(cachedData)
          setFilteredAddresses(cachedData)
          return
        } catch (error) {
          console.error('Failed to parse cached data:', error)
        }
      }
    }

    setIsLoading(true)
    try {
      const response = await axios.get(import.meta.env.VITE_APP_NEW_ADDRESS_LIST_GET_ALL)
      if (response.data?.all_address_list) {
        const data = response.data.all_address_list
        setAddresses(data)
        setFilteredAddresses(data)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
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
    if (searchQuery.trim() === '') {
      setFilteredAddresses(addresses)
    } else {
      const filtered = addresses.filter(address =>
        address.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        address.CardCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        address.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        address.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        address.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredAddresses(filtered)
    }
    setCurrentPage(1)
  }, [searchQuery, addresses])

  const totalPages = Math.ceil(filteredAddresses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredAddresses.slice(startIndex, endIndex)

  const handleCreateNew = () => {
    setEditingAddress(null)
    setFormData({
      CardCode: '',
      company_name: '',
      CardType: 'S',
      full_address: '',
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
    onOpen()
  }

  const handleEdit = (address: AddressData) => {
    setEditingAddress(address)
    setFormData({
      CardCode: address.CardCode || '',
      company_name: address.company_name,
      CardType: address.CardType,
      full_address: address.full_address || '',
      street1: address.street1,
      street2: address.street2 || '',
      street3: address.street3 || '',
      city: address.city,
      state: address.state,
      country: address.country,
      postal_code: address.postal_code,
      contact_name: address.contact_name,
      contact: address.contact || '',
      phone: address.phone || '',
      email: address.email || '',
      tax_id: address.tax_id || '',
      phone1: address.phone1 || '',
      website: address.website || '',
      eori_number: address.eori_number || ''
    })
    onOpen()
  }

  const handleViewDetail = (addressID: number) => {
    navigate(`/local/address-list/${addressID}`)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const payload = {
        ...formData,
        active: 1,
        user_id: 1, // Replace with actual user ID from auth
        user_name: 'Admin', // Replace with actual user name from auth
        updated_userID: editingAddress ? 1 : undefined,
        updated_user_name: editingAddress ? 'Admin' : undefined
      }

      if (editingAddress) {
        await axios.post(`${import.meta.env.VITE_APP_NEW_ADDRESS_LIST_UPDATE}/${editingAddress.addressID}`, payload)
      } else {
        await axios.post(import.meta.env.VITE_APP_NEW_ADDRESS_LIST_CREATE, payload)
      }

      onClose()
      fetchAddresses(true)
    } catch (error) {
      console.error('Failed to save address:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInactivate = (addressID: number) => {
    setDeletingAddressId(addressID)
    onDeleteOpen()
  }

  const confirmInactivate = async () => {
    if (!deletingAddressId) return

    setIsLoading(true)
    try {
      await axios.post(`${import.meta.env.VITE_APP_NEW_ADDRESS_LIST_INACTIVE}/${deletingAddressId}`, {
        active: 0,
        updated_userID: 1, // Replace with actual user ID
        updated_user_name: 'Admin' // Replace with actual user name
      })
      onDeleteClose()
      fetchAddresses(true)
    } catch (error) {
      console.error('Failed to inactivate address:', error)
    } finally {
      setIsLoading(false)
      setDeletingAddressId(null)
    }
  }

  return (
    <div>
      <Card className="w-full">
        <CardHeader className="flex flex-col gap-4 pb-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold">Address List</h1>
              <p className="text-small text-default-600">
                {filteredAddresses.length} addresses found
              </p>
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
            <div className="flex items-center gap-2">
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
              <Button
                color="primary"
                onPress={handleCreateNew}
                startContent={<Icon icon="solar:add-circle-bold" />}
              >
                Create New
              </Button>
              <Chip color="primary" variant="flat">
                Total: {addresses.length}
              </Chip>
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
                  <TableColumn className="w-16">No.</TableColumn>
                  <TableColumn className="w-32">CODE</TableColumn>
                  <TableColumn className="min-w-[250px]">COMPANY</TableColumn>
                  <TableColumn className="w-24">TYPE</TableColumn>
                  <TableColumn className="min-w-[300px]">ADDRESS</TableColumn>
                  <TableColumn className="w-32">CONTACT</TableColumn>
                  <TableColumn className="w-40">PHONE</TableColumn>
                  <TableColumn className="w-24">STATUS</TableColumn>
                  <TableColumn className="w-32">ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No addresses found">
                  {currentItems.map((address, index) => (
                    <TableRow key={address.addressID}>
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
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            isIconOnly
                            size="sm"
                            key="view"
                            startContent={<Icon icon="solar:eye-bold" />}
                            onPress={() => handleViewDetail(address.addressID)}
                          >
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            key="edit"
                            startContent={<Icon icon="solar:pen-bold" />}
                            onPress={() => handleEdit(address)}
                          >                            
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            key="inactivate"
                            color="danger"
                            startContent={<Icon icon="solar:trash-bin-trash-bold" />}
                            onPress={() => handleInactivate(address.addressID)}
                          >                            
                          </Button>
                        </div>
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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="md">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-danger">
              <Icon icon="solar:danger-circle-bold" className="text-3xl" />
              <span>Confirm Inactivation</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-default-600">
              Are you sure you want to inactivate this address? This action will mark the address as inactive.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteClose}>
              Cancel
            </Button>
            <Button color="danger" onPress={confirmInactivate} isLoading={isLoading}>
              Inactivate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            {editingAddress ? 'Edit Address' : 'Create New Address'}
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
              />
              <Input
                label="Card Type"
                isRequired
                value={formData.CardType}
                onValueChange={(value) => setFormData({ ...formData, CardType: value })}
              />
              <Input
                label="Street 1"
                isRequired
                value={formData.street1}
                onValueChange={(value) => setFormData({ ...formData, street1: value })}
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
              />
              <Input
                label="State"
                isRequired
                value={formData.state}
                onValueChange={(value) => setFormData({ ...formData, state: value })}
              />
              <Input
                label="Country"
                isRequired
                value={formData.country}
                onValueChange={(value) => setFormData({ ...formData, country: value })}
              />
              <Input
                label="Postal Code"
                isRequired
                value={formData.postal_code}
                onValueChange={(value) => setFormData({ ...formData, postal_code: value })}
              />
              <Input
                label="Contact Name"
                isRequired
                value={formData.contact_name}
                onValueChange={(value) => setFormData({ ...formData, contact_name: value })}
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
                label="Full Address"
                value={formData.full_address}
                onValueChange={(value) => setFormData({ ...formData, full_address: value })}
                className="col-span-2"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSubmit} isLoading={isLoading}>
              {editingAddress ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default AddressList
