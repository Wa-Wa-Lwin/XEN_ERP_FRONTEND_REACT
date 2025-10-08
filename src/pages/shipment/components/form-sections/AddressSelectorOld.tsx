import { useState, useEffect } from 'react'
import { Controller } from 'react-hook-form'
import {
  Card,
  CardHeader,
  CardBody,
  Textarea,
  Autocomplete,
  AutocompleteItem,
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
  forceRefresh?: number
  watch: (name?: string) => any
  onClearRates?: () => void
}

const AddressSelector = ({ register, errors, control, title, prefix, setValue, forceRefresh, watch, onClearRates }: AddressSelectorProps) => {
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

  // Watch for forceRefresh prop changes to trigger form re-render
  useEffect(() => {
    if (forceRefresh !== undefined && forceRefresh > 0) {
      setFormKey(prev => prev + 1)
    }
  }, [forceRefresh])

  const handleSelectFromAddresses = () => {
    if (addresses.length === 0) {
      fetchAddresses()
    }
    setIsModalOpen(true)
  }

  const handleAddressSelect = (address: AddressData) => {
    // Clear rates since address is changing
    if (onClearRates) {
      console.log(`${prefix} address selected, clearing rates...`)
      onClearRates()
    }

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
        { field: `${prefix}_phone`, value: (() => {
          let phone = address.Phone1 || '';
          // Remove all non-digit and non-plus characters
          phone = phone.replace(/[^0-9+]/g, "");
          // Ensure only one + and it's at the beginning
          const plusCount = (phone.match(/\+/g) || []).length;
          if (plusCount > 1) {
            const firstPlusIndex = phone.indexOf('+');
            phone = phone.charAt(firstPlusIndex) + phone.replace(/\+/g, '');
          }
          if (phone.includes('+') && !phone.startsWith('+')) {
            phone = '+' + phone.replace(/\+/g, '');
          }
          return phone.slice(0, 15);
        })() },
        { field: `${prefix}_email`, value: address.E_Mail || '' },
        // { field: `${prefix}_country`, value: address.Country || address.MailCountr || '' },
        { field: `${prefix}_country`, value: countryISO3 },   // use ISO3
        { field: `${prefix}_city`, value: address.City || address.MailCity || '' },
        { field: `${prefix}_state`, value: address.County || address.MailCounty || '' },
        { field: `${prefix}_postal_code`, value: address.ZipCode || address.MailZipCod || '' },        
        { field: `${prefix}_street1`, value: address.MailStrNo || address.BillToDef || address.ShipToDef || '' },
        { field: `${prefix}_street2`, value: address.Address || address.MailAddres || '' },
        { field: `${prefix}_tax_id`, value: address.TaxID || '' }
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
          <Textarea
            {...register(`${prefix}_company_name`, { required: isFieldRequired('company_name') ? 'Company name is required' : false })}
            isRequired={isFieldRequired('company_name')}
            label={<span>Company Name</span>}
            placeholder="Enter company name"
            errorMessage={errors[`${prefix}_company_name`]?.message}
            isInvalid={!!errors[`${prefix}_company_name`]}
            key={`${formKey}_${prefix}_company_name`}
            color={!watch(`${prefix}_company_name`) ? "warning" : "default"}
            maxLength={255}
            onChange={() => {
              // Clear rates since company name changed
              if (onClearRates) {
                console.log(`${prefix} company name changed, clearing rates...`)
                onClearRates()
              }
            }}
            minRows={1}
          />
          <Textarea
            {...register(`${prefix}_contact_name`, { required: isFieldRequired('contact_name') ? 'Contact name is required' : false })}
            isRequired={isFieldRequired('contact_name')}
            label={<span>Contact Name</span>}
            placeholder="Enter contact name"
            errorMessage={errors[`${prefix}_contact_name`]?.message}
            isInvalid={!!errors[`${prefix}_contact_name`]}
            key={`${formKey}_${prefix}_contact_name`}
            color={!watch(`${prefix}_contact_name`) ? "warning" : "default"}
            maxLength={100}
            minRows={1}
          />

          <Textarea
            {...register(`${prefix}_phone`, { required: isFieldRequired('phone') ? 'Phone is required' : false })}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              // Allow only numbers and one + at the beginning
              let sanitized = e.target.value;

              // Remove all non-digit and non-plus characters
              sanitized = sanitized.replace(/[^0-9+]/g, "");

              // Ensure only one + and it's at the beginning
              const plusCount = (sanitized.match(/\+/g) || []).length;
              if (plusCount > 1) {
                // Keep only the first +
                const firstPlusIndex = sanitized.indexOf('+');
                sanitized = sanitized.charAt(firstPlusIndex) + sanitized.replace(/\+/g, '');
              }

              // If + exists, it must be at the beginning
              if (sanitized.includes('+') && !sanitized.startsWith('+')) {
                sanitized = '+' + sanitized.replace(/\+/g, '');
              }

              // Limit to 15 characters
              sanitized = sanitized.slice(0, 15);

              setValue(`${prefix}_phone`, sanitized, { shouldValidate: true });
            }}
            isRequired={isFieldRequired("phone")}
            label={<span>Phone</span>}
            placeholder="Enter phone (e.g. +1234567890)"
            errorMessage={errors[`${prefix}_phone`]?.message}
            isInvalid={!!errors[`${prefix}_phone`]}
            key={`${formKey}_${prefix}_phone`}
            color={!watch(`${prefix}_phone`) ? "warning" : "default"}
            minRows={1}
          />

          <Textarea
            {...register(`${prefix}_email`, {
              required: isFieldRequired('email') ? 'Email is required' : false,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Please enter a valid email address"
              }
            })}
            isRequired={isFieldRequired('email')}
            type="email"
            label={<span>Email</span>}
            placeholder="Enter email"
            errorMessage={errors[`${prefix}_email`]?.message}
            isInvalid={!!errors[`${prefix}_email`]}
            key={`${formKey}_${prefix}_email`}
            color={!watch(`${prefix}_email`) ? "warning" : "default"}
            maxLength={255}
            minRows={1}
          />
          <Controller
            key={`${formKey}_${prefix}_country`}
            name={`${prefix}_country`}
            control={control}
            rules={{ required: isFieldRequired('country') ? 'Country is required' : false }}
            render={({ field }) => (
              <Autocomplete
                isRequired={isFieldRequired('country')}
                {...field}
                defaultItems={COUNTRIES}
                label={
                  <span>
                    Country
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
                    // Clear rates since country changed
                    if (onClearRates) {
                      console.log(`${prefix} country changed, clearing rates...`)
                      onClearRates()
                    }
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
                color={!watch(`${prefix}_country`) ? "warning" : "default"}
              >
                {(item) => (
                  <AutocompleteItem key={item.key} value={item.value}>
                    {item.value}
                  </AutocompleteItem>
                )}
              </Autocomplete>
            )}
          />

          <Textarea
            {...register(`${prefix}_city`, { required: isFieldRequired('city') ? 'City is required' : false })}
            isRequired={isFieldRequired('city')}
            label={<span>City</span>}
            placeholder="Enter city"
            errorMessage={errors[`${prefix}_city`]?.message}
            isInvalid={!!errors[`${prefix}_city`]}
            key={`${formKey}_${prefix}_city`}
            color={!watch(`${prefix}_city`) ? "warning" : "default"}
            maxLength={100}
            onChange={() => {
              // Clear rates since city changed
              if (onClearRates) {
                console.log(`${prefix} city changed, clearing rates...`)
                onClearRates()
              }
            }}
            minRows={1}
          />

          <Textarea
            {...register(`${prefix}_state`, { required: isFieldRequired('state') ? 'State is required' : false })}
            isRequired={isFieldRequired('state')}
            label={<span>State</span>}
            placeholder="Enter state"
            errorMessage={errors[`${prefix}_state`]?.message}
            isInvalid={!!errors[`${prefix}_state`]}
            key={`${formKey}_${prefix}_state`}
            color={!watch(`${prefix}_state`) ? "warning" : "default"}
            maxLength={100}
            onChange={() => {
              // Clear rates since state changed
              if (onClearRates) {
                console.log(`${prefix} state changed, clearing rates...`)
                onClearRates()
              }
            }}
            minRows={1}
          />

          <Textarea
            {...register(`${prefix}_postal_code`, { required: isFieldRequired('postal_code') ? 'Postal code is required' : false })}
            isRequired={isFieldRequired('postal_code')}
            label={<span>Postal Code</span>}
            placeholder="Enter postal code"
            errorMessage={errors[`${prefix}_postal_code`]?.message}
            isInvalid={!!errors[`${prefix}_postal_code`]}
            key={`${formKey}_${prefix}_postal_code`}
            color={!watch(`${prefix}_postal_code`) ? "warning" : "default"}
            maxLength={255}
            onChange={() => {
              // Clear rates since postal code changed
              if (onClearRates) {
                console.log(`${prefix} postal code changed, clearing rates...`)
                onClearRates()
              }
            }}
            minRows={1}
          />

          <Textarea
            isRequired={isFieldRequired('street1')}
             {...register(`${prefix}_street1`, { required: isFieldRequired('street1') ? "Street 1 is required" : false })}
            label={<span>Street 1</span>}
            placeholder="Enter street line 1"
            errorMessage={errors[`${prefix}_street1`]?.message}
            isInvalid={!!errors[`${prefix}_street1`]}
            minRows={1}
            key={`${formKey}_${prefix}_street1`}
            color={!watch(`${prefix}_street1`) ? "warning" : "default"}
            maxLength={45}
            onChange={() => {
              // Clear rates since street address changed
              if (onClearRates) {
                console.log(`${prefix} street address changed, clearing rates...`)
                onClearRates()
              }
            }}
          />

          <Textarea
            {...register(`${prefix}_street2`)}
            label="Street 2"
            placeholder="Enter street line 2"
            errorMessage={errors[`${prefix}_street2`]?.message}
            isInvalid={!!errors[`${prefix}_street2`]}
            minRows={1}
            key={`${formKey}_${prefix}_street2`}
            maxLength={45}
            // color={!watch(`${prefix}_street2`) ? "warning" : "default"}
          />
          <Textarea
            {...register(`${prefix}_tax_id`)}
            label="Tax ID"
            placeholder="Enter tax ID"
            errorMessage={errors[`${prefix}_tax_id`]?.message}
            isInvalid={!!errors[`${prefix}_tax_id`]}
            key={`${formKey}_${prefix}_tax_id`}
            maxLength={255}
            // color={!watch(`${prefix}_tax_id`) ? "warning" : "default"}
            minRows={1}
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
                    <p className="text-small text-default-600">Choose an address to auto-fill the form</p>
                  </div>
                </div>
                <Textarea
                  placeholder="Search by name, code, city..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  startContent={<Icon icon="solar:magnifer-bold" />}
                  variant="bordered"
                  className="mt-2"
                  isClearable
                  onClear={() => setSearchQuery('')}
                  minRows={1}
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