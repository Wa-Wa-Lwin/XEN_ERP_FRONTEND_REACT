import { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Select,
  SelectItem,
  Textarea,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
  Alert
} from '@heroui/react'
import { Icon } from '@iconify/react'
import axios from 'axios'
import type { FormSectionProps } from '../../types/shipment-form.types'
import type { AddressData } from '@pages/addresses/types'
import { COUNTRIES } from '@pages/shipment/constants/countries'
import { ISO2_TO_ISO3 } from '@pages/shipment/constants/change-iso-country-codes'


interface AddressSelectorProps extends FormSectionProps {
  title: string
  prefix: 'ship_from' | 'ship_to'
}

const AddressSelector = ({ register, errors, title, prefix, setValue }: AddressSelectorProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [addresses, setAddresses] = useState<AddressData[]>([])
  const [filteredAddresses, setFilteredAddresses] = useState<AddressData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [formKey, setFormKey] = useState(0)
  const [selectedAddressInfo, setSelectedAddressInfo] = useState<string | null>(null)

  const fetchAddresses = async () => {
    setIsLoading(true)
    try {
      // Try to get from cache first
      const cachedData = localStorage.getItem('addresses_data')
      if (cachedData) {
        const parsedData = JSON.parse(cachedData)
        setAddresses(parsedData)
        setFilteredAddresses(parsedData)
        setIsLoading(false)
        return
      }

      // Fetch from API if no cache
      const response = await axios.get(import.meta.env.VITE_APP_GET_ADDRESSES)
      if (response.data?.ret === 0 && response.data?.data) {
        setAddresses(response.data.data)
        setFilteredAddresses(response.data.data)
        localStorage.setItem('addresses_data', JSON.stringify(response.data.data))
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAddresses(addresses)
    } else {
      const filtered = addresses.filter(address =>
        address.CardCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        address.CardName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        address.City?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        address.Country?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredAddresses(filtered)
    }
  }, [searchQuery, addresses])

  const handleSelectFromAddresses = () => {
    if (addresses.length === 0) {
      fetchAddresses()
    }
    setIsModalOpen(true)
  }

  const handleAddressSelect = (address: AddressData) => {
    // Fill form fields with selected address data
    if (setValue) {
      // Use setValue with shouldDirty and shouldTouch options to trigger form updates
      const setValueOptions = { shouldDirty: true, shouldTouch: true, shouldValidate: true }

      // Convert 2-letter to 3-letter (fallback to original if not found)
      const rawCountry = address.Country || address.MailCountr || "";
      const countryISO3 = ISO2_TO_ISO3[rawCountry] || rawCountry;

      // Map address data with fallbacks
      const fieldMappings = [
        { field: `${prefix}_company_name`, value: address.CardName || '' },
        { field: `${prefix}_contact_name`, value: address.CntctPrsn || '' },
        { field: `${prefix}_phone`, value: address.Phone1 || '' },
        { field: `${prefix}_email`, value: address.E_Mail || '' },
        // { field: `${prefix}_country`, value: address.Country || address.MailCountr || '' },
        { field: `${prefix}_country`, value: countryISO3 },   // use ISO3
        { field: `${prefix}_city`, value: address.City || address.MailCity || '' },
        { field: `${prefix}_state`, value: address.County || address.MailCounty || '' },
        { field: `${prefix}_postal_code`, value: address.ZipCode || address.MailZipCod || '' },
        { field: `${prefix}_street1`, value: address.Address || address.MailAddres || '' },
        { field: `${prefix}_street2`, value: address.Building || address.MailBuildi || '' }
      ]

      // Set values using setValue
      fieldMappings.forEach(({ field, value }) => {
        setValue(field, value, setValueOptions)
      })

      // Show success message and force form re-render
      setSelectedAddressInfo(`Address "${address.CardName}" selected and auto-filled`)
      setTimeout(() => {
        setFormKey(prev => prev + 1)
        // Clear success message after a delay
        setTimeout(() => setSelectedAddressInfo(null), 5000)
      }, 100)
    } else {
      console.error('setValue function is not available')
    }

    setIsModalOpen(false)
  }

  const getCardTypeInfo = (type: string) => {
    switch (type) {
      case 'C':
        return { label: 'Customer', color: 'primary' as const, icon: 'solar:user-bold' }
      case 'S':
        return { label: 'Supplier', color: 'secondary' as const, icon: 'solar:shop-bold' }
      default:
        return { label: 'Other', color: 'default' as const, icon: 'solar:buildings-bold' }
    }
  }

  const formatAddress = (address: AddressData) => {
    const parts = [
      address.StreetNo || address.MailStrNo,
      address.Address || address.MailAddres,
      address.Building || address.MailBuildi,
      address.City || address.MailCity,
      address.ZipCode || address.MailZipCod
    ].filter(Boolean)

    return parts.length > 0 ? parts.join(', ') : 'No address available'
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="flat"
              color="primary"
              startContent={<Icon icon="solar:buildings-2-bold" />}
              onPress={handleSelectFromAddresses}
            >
              Select from Addresses
            </Button>
          </div>
        </CardHeader>
        {selectedAddressInfo && (
          <div className="px-6 pb-2">
            <Alert
              color="success"
              variant="flat"
              title="Address Selected"
              description={selectedAddressInfo}
            />
          </div>
        )}
        <CardBody key={formKey} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            {...register(`${prefix}_company_name`, { required: 'Company name is required' })}
            label="Company Name"
            placeholder="Enter company name"
            errorMessage={errors[`${prefix}_company_name`]?.message}
            isInvalid={!!errors[`${prefix}_company_name`]}
            key={`${formKey}_${prefix}_company_name`}
          />
          <Input
            {...register(`${prefix}_contact_name`, { required: 'Contact name is required' })}
            label="Contact Name"
            placeholder="Enter contact name"
            errorMessage={errors[`${prefix}_contact_name`]?.message}
            isInvalid={!!errors[`${prefix}_contact_name`]}
            key={`${formKey}_${prefix}_contact_name`}
          />

          <Input
            {...register(`${prefix}_phone`, { required: 'Phone is required' })}
            label="Phone"
            placeholder="Enter phone"
            errorMessage={errors[`${prefix}_phone`]?.message}
            isInvalid={!!errors[`${prefix}_phone`]}
            key={`${formKey}_${prefix}_phone`}
          />

          <Input
            {...register(`${prefix}_email`, { required: 'Email is required' })}
            type="email"
            label="Email"
            placeholder="Enter email"
            errorMessage={errors[`${prefix}_email`]?.message}
            isInvalid={!!errors[`${prefix}_email`]}
            key={`${formKey}_${prefix}_email`}
          />
          <Select
            {...register(`${prefix}_country`, { required: 'Country is required' })}
            label="Country"
            placeholder="Select Country"
            errorMessage={errors[`${prefix}_country`]?.message}
            isInvalid={!!errors[`${prefix}_country`]}
          >
            {COUNTRIES.map((option) => (
              <SelectItem key={option.key} value={option.value}>
                {option.value}
              </SelectItem>
            ))}
          </Select>
          <Input
            {...register(`${prefix}_city`, { required: 'City is required' })}
            label="City"
            placeholder="Enter city"
            errorMessage={errors[`${prefix}_city`]?.message}
            isInvalid={!!errors[`${prefix}_city`]}
            key={`${formKey}_${prefix}_city`}
          />

          <Input
            {...register(`${prefix}_state`, { required: 'State is required' })}
            label="State"
            placeholder="Enter state"
            errorMessage={errors[`${prefix}_state`]?.message}
            isInvalid={!!errors[`${prefix}_state`]}
          />

          <Input
            {...register(`${prefix}_postal_code`, { required: 'Postal code is required' })}
            label="Postal Code"
            placeholder="Enter postal code"
            errorMessage={errors[`${prefix}_postal_code`]?.message}
            isInvalid={!!errors[`${prefix}_postal_code`]}
          />

          <Textarea
            {...register(`${prefix}_street1`, { required: 'Street 1 is required' })}
            label="Street 1"
            placeholder="Enter street line 1"
            errorMessage={errors[`${prefix}_street1`]?.message}
            isInvalid={!!errors[`${prefix}_street1`]}
          />

          <Textarea
            {...register(`${prefix}_street2`)}
            label="Street 2"
            placeholder="Enter street line 2"
            errorMessage={errors[`${prefix}_street2`]?.message}
            isInvalid={!!errors[`${prefix}_street2`]}
          />
          <Input
            {...register(`${prefix}_tax_id`)}
            label="Tax ID"
            placeholder="Enter tax ID"
            errorMessage={errors[`${prefix}_tax_id`]?.message}
            isInvalid={!!errors[`${prefix}_tax_id`]}
          />
        </CardBody>
      </Card>

      {/* Address Selection Modal */}
      <Modal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        // size="5xl"
        scrollBehavior="inside"
        classNames={{
          base: "max-w-full w-full h-[90vh]", // full width, nearly full height
          wrapper: "w-full m-0 p-0",          // remove margins
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <Icon icon="solar:buildings-2-bold" className="text-primary" width={24} />
                  <div>
                    <h3 className="text-xl font-bold">Select Address</h3>
                    <p className="text-small text-default-600">Choose an address to auto-fill the form</p>
                  </div>
                </div>
                <Input
                  placeholder="Search by name, code, city..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  startContent={<Icon icon="solar:magnifer-bold" />}
                  variant="bordered"
                  className="mt-2"
                  isClearable
                  onClear={() => setSearchQuery('')}
                />
              </ModalHeader>
              <ModalBody>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" label="Loading addresses..." />
                  </div>
                ) : (
                  <Table
                    aria-label="Address selection table"
                    selectionMode="single"
                    classNames={{
                      wrapper: "min-h-[400px]",
                    }}
                  >
                    <TableHeader>
                      <TableColumn>CODE</TableColumn>
                      <TableColumn>TYPE</TableColumn>
                      <TableColumn>COMPANY NAME</TableColumn>
                      <TableColumn>ADDRESS</TableColumn>
                      <TableColumn>COUNTRY</TableColumn>
                      <TableColumn>CONTACT</TableColumn>
                      <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="No addresses found">
                      {filteredAddresses.slice(0, 50).map((address) => {
                        const typeInfo = getCardTypeInfo(address.CardType)
                        return (
                          <TableRow key={address.CardCode}>
                            <TableCell>
                              <span className="font-medium text-primary text-sm">
                                {address.CardCode}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="sm"
                                variant="flat"
                                color={typeInfo.color}
                                startContent={<Icon icon={typeInfo.icon} width={14} />}
                              >
                                {typeInfo.label}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col max-w-[200px]">
                                <span className="text-sm font-medium text-foreground truncate">
                                  {address.CardName}
                                </span>                                
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col max-w-[250px]">
                                <span className="text-sm text-default-600 truncate">
                                  {formatAddress(address)}
                                </span>                                
                              </div>
                            </TableCell>
                             <TableCell>
                              {address.Country || address.MailCountr || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                {address.CntctPrsn && (
                                  <span className="text-tiny text-default-500 truncate">
                                    Contact: {address.CntctPrsn}
                                  </span>
                                )}
                                {address.E_Mail && (
                                  <span className="text-tiny text-default-600 truncate max-w-[150px]">
                                    {address.E_Mail}
                                  </span>
                                )}
                                {address.Phone1 && (
                                  <span className="text-tiny text-default-600">
                                    {address.Phone1}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                startContent={<Icon icon="solar:check-bold" />}
                                onPress={() => handleAddressSelect(address)}
                              >
                                Select
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

export default AddressSelector