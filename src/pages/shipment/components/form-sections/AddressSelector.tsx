import { useState, useEffect } from 'react'
import { Controller } from 'react-hook-form'
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Autocomplete,
  AutocompleteItem,
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

const AddressSelector = ({ register, errors, control, title, prefix, setValue }: AddressSelectorProps) => {
  // Helper function to determine if a field should be required based on send_to value
  const isFieldRequired = (_fieldName: string) => {
    // All address fields are required regardless of send_to value
    return true;
  };
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
      const countryISO3 = ISO2_TO_ISO3[rawCountry.toUpperCase()] || rawCountry;

      console.log('Country conversion:', { rawCountry, countryISO3 });

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
        { field: `${prefix}_street1`, value: address.MailStrNo || address.BillToDef || address.ShipToDef || '' },
        { field: `${prefix}_street2`, value: address.Address || address.MailAddres || '' }
      ]

      // Set values using setValue
      fieldMappings.forEach(({ field, value }) => {
        console.log('Setting field:', field, 'to value:', value);
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
      <Card shadow="none">
      {/* <Card shadow="none" className="py-0 px-4 m-0"> */}
        <CardHeader className="px-0 pt-0 pb-1 flex-row items-center gap-6 justify-left">
          <h2 className="text-lg font-semibold">{title}</h2>
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
        <CardBody className="px-0 pt-0 pb-0">
          {selectedAddressInfo && (
            <div className="mb-3">
              <Alert
                color="success"
                variant="flat"
                title="Address Selected"
                description={selectedAddressInfo}
              />
            </div>
          )}
          <div key={formKey} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            {...register(`${prefix}_company_name`, { required: isFieldRequired('company_name') ? 'Company name is required' : false })}
            label={<span>Company Name {isFieldRequired('company_name') && <span className="text-red-500">*</span>}</span>}
            placeholder="Enter company name"
            errorMessage={errors[`${prefix}_company_name`]?.message}
            isInvalid={!!errors[`${prefix}_company_name`]}
            key={`${formKey}_${prefix}_company_name`}
          />
          <Input
            {...register(`${prefix}_contact_name`, { required: isFieldRequired('contact_name') ? 'Contact name is required' : false })}
            label={<span>Contact Name {isFieldRequired('contact_name') && <span className="text-red-500">*</span>}</span>}
            placeholder="Enter contact name"
            errorMessage={errors[`${prefix}_contact_name`]?.message}
            isInvalid={!!errors[`${prefix}_contact_name`]}
            key={`${formKey}_${prefix}_contact_name`}
          />

          <Input
            {...register(`${prefix}_phone`, { required: isFieldRequired('phone') ? 'Phone is required' : false })}
            label={<span>Phone {isFieldRequired('phone') && <span className="text-red-500">*</span>}</span>}
            placeholder="Enter phone"
            errorMessage={errors[`${prefix}_phone`]?.message}
            isInvalid={!!errors[`${prefix}_phone`]}
            key={`${formKey}_${prefix}_phone`}
          />

          <Input
            {...register(`${prefix}_email`, { required: isFieldRequired('email') ? 'Email is required' : false })}
            type="email"
            label={<span>Email {isFieldRequired('email') && <span className="text-red-500">*</span>}</span>}
            placeholder="Enter email"
            errorMessage={errors[`${prefix}_email`]?.message}
            isInvalid={!!errors[`${prefix}_email`]}
            key={`${formKey}_${prefix}_email`}
          />
          <Controller
            name={`${prefix}_country`}
            control={control}
            rules={{ required: isFieldRequired('country') ? 'Country is required' : false }}
            render={({ field }) => (
              <Autocomplete
                {...field}
                defaultItems={COUNTRIES}
                label={
                  <span>
                    Country {isFieldRequired('country') && <span className="text-red-500">*</span>}
                  </span>
                }
                placeholder="Search or select a country"
                errorMessage={errors[`${prefix}_country`]?.message}
                isInvalid={!!errors[`${prefix}_country`]}
                selectedKey={field.value || null}
                onSelectionChange={(key) => {
                  console.log('Country selected:', key);
                  if (key) {
                    field.onChange(key)
                  }
                }}
                listboxProps={{
                  emptyContent: "No countries found."
                }}
                scrollShadowProps={{
                  isEnabled: false
                }}
                classNames={{
                  listbox: "max-h-60"
                }}
              >
                {(item) => (
                  <AutocompleteItem key={item.key} value={item.value}>
                    {item.value}
                  </AutocompleteItem>
                )}
              </Autocomplete>
            )}
          />

          <Input
            {...register(`${prefix}_city`, { required: isFieldRequired('city') ? 'City is required' : false })}
            label={<span>City {isFieldRequired('city') && <span className="text-red-500">*</span>}</span>}
            placeholder="Enter city"
            errorMessage={errors[`${prefix}_city`]?.message}
            isInvalid={!!errors[`${prefix}_city`]}
            key={`${formKey}_${prefix}_city`}
          />

          <Input
            {...register(`${prefix}_state`, { required: isFieldRequired('state') ? 'State is required' : false })}
            label={<span>State {isFieldRequired('state') && <span className="text-red-500">*</span>}</span>}
            placeholder="Enter state"
            errorMessage={errors[`${prefix}_state`]?.message}
            isInvalid={!!errors[`${prefix}_state`]}
          />

          <Input
            {...register(`${prefix}_postal_code`, { required: isFieldRequired('postal_code') ? 'Postal code is required' : false })}
            label={<span>Postal Code {isFieldRequired('postal_code') && <span className="text-red-500">*</span>}</span>}
            placeholder="Enter postal code"
            errorMessage={errors[`${prefix}_postal_code`]?.message}
            isInvalid={!!errors[`${prefix}_postal_code`]}
          />

          <Textarea
            {...register(`${prefix}_street1`, { required: isFieldRequired('street1') ? 'Street 1 is required' : false })}
            label={<span>Street 1 {isFieldRequired('street1') && <span className="text-red-500">*</span>}</span>}
            placeholder="Enter street line 1"
            errorMessage={errors[`${prefix}_street1`]?.message}
            isInvalid={!!errors[`${prefix}_street1`]}
            minRows={1}
          />

          <Textarea
            {...register(`${prefix}_street2`)}
            label="Street 2"
            placeholder="Enter street line 2"
            errorMessage={errors[`${prefix}_street2`]?.message}
            isInvalid={!!errors[`${prefix}_street2`]}
            minRows={1}
          />
          <Input
            {...register(`${prefix}_tax_id`)}
            label="Tax ID"
            placeholder="Enter tax ID"
            errorMessage={errors[`${prefix}_tax_id`]?.message}
            isInvalid={!!errors[`${prefix}_tax_id`]}
          />
          </div>
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
                    <p className="text-small text-default-600">Click on any row to select and auto-fill the form</p>
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
                    </TableHeader>
                    <TableBody emptyContent="No addresses found">
                      {filteredAddresses.slice(0, 50).map((address) => {
                        const typeInfo = getCardTypeInfo(address.CardType)
                        return (
                          <TableRow
                            key={address.CardCode}
                            className="cursor-pointer hover:bg-default-100 transition-colors"
                            onClick={() => handleAddressSelect(address)}
                          >
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