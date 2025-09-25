import React, { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
  Pagination
} from '@heroui/react'
import { Icon } from '@iconify/react'
import { useAddresses } from '@pages/addresses/hooks/useAddresses'
import type { AddressData } from '@pages/addresses/types'

interface AddressSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (address: AddressData) => void
  title: string
  selectedAddress?: AddressData | null
}

export const AddressSelectModal: React.FC<AddressSelectModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title,
  selectedAddress
}) => {
  const { filteredAddresses, isLoading, searchQuery, setSearchQuery, fetchAddresses } = useAddresses()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalPages = Math.ceil(filteredAddresses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAddresses = filteredAddresses.slice(startIndex, endIndex)

  const handleSelect = (address: AddressData) => {
    onSelect(address)
    onClose()
  }

  const getCardTypeInfo = (cardType: string) => {
    const types = {
      'C': { label: 'Customer', color: 'primary' as const, icon: 'solar:user-bold' },
      'S': { label: 'Supplier', color: 'secondary' as const, icon: 'solar:buildings-bold' },
      'L': { label: 'Lead', color: 'default' as const, icon: 'solar:user-plus-bold' }
    }
    return types[cardType as keyof typeof types] || { label: cardType, color: 'default' as const, icon: 'solar:question-circle-bold' }
  }

  const formatAddress = (address: AddressData) => {
    const parts = [
      address.Address,
      address.Building,
      address.StreetNo,
      address.City,
      address.County,
      address.Country,
      address.ZipCode
    ].filter(Boolean)
    return parts.join(', ')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex gap-2 items-center">
          <Icon icon="solar:location-linear" width={24} className="text-primary" />
          {title}
        </ModalHeader>

        <ModalBody className="py-4">
          {/* Search Input */}
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search addresses by name, code, city, country, email..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Icon icon="solar:magnifer-linear" width={20} />}
              isClearable
              onClear={() => setSearchQuery('')}
              className="flex-1"
            />
            <Button
              variant="bordered"
              isIconOnly
              onPress={() => fetchAddresses(true)}
              isLoading={isLoading}
              title="Refresh addresses"
            >
              <Icon icon="solar:refresh-linear" width={20} />
            </Button>
          </div>

          {/* Results Info */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              {filteredAddresses.length > 0
                ? `${filteredAddresses.length} address${filteredAddresses.length === 1 ? '' : 'es'} found`
                : 'No addresses found'
              }
            </p>
            {selectedAddress && (
              <Chip size="sm" color="success" variant="flat">
                Current: {selectedAddress.CardName}
              </Chip>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          )}

          {/* No Results */}
          {!isLoading && filteredAddresses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Icon icon="solar:inbox-linear" width={48} className="text-default-300 mb-4" />
              <p className="text-default-500">No addresses found</p>
              <p className="text-default-400 text-sm">
                {searchQuery ? 'Try adjusting your search terms' : 'No addresses available'}
              </p>
            </div>
          )}

          {/* Address Table */}
          {!isLoading && currentAddresses.length > 0 && (
            <>
              <Table
                aria-label="Address selection table"
                selectionMode="single"
                classNames={{
                  wrapper: "max-h-[400px]"
                }}
              >
                <TableHeader>
                  <TableColumn>NAME & CODE</TableColumn>
                  <TableColumn>TYPE</TableColumn>
                  <TableColumn>CONTACT</TableColumn>
                  <TableColumn>ADDRESS</TableColumn>
                </TableHeader>
                <TableBody>
                  {currentAddresses.map((address) => {
                    const typeInfo = getCardTypeInfo(address.CardType)
                    const isSelected = selectedAddress?.CardCode === address.CardCode

                    return (
                      <TableRow
                        key={address.CardCode}
                        className={`cursor-pointer hover:bg-default-100 ${isSelected ? 'bg-primary-50' : ''}`}
                        onClick={() => handleSelect(address)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <Icon icon="solar:check-circle-bold" width={16} className="text-success" />
                            )}
                            <div className="flex flex-col">
                              <p className="font-semibold text-sm">{address.CardName}</p>
                              <p className="text-xs text-default-400">{address.CardCode}</p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="sm"
                            color={typeInfo.color}
                            variant="flat"
                            startContent={<Icon icon={typeInfo.icon} width={14} />}
                          >
                            {typeInfo.label}
                          </Chip>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            {address.CntctPrsn && (
                              <p className="text-sm">{address.CntctPrsn}</p>
                            )}
                            {address.E_Mail && (
                              <p className="text-xs text-default-400">{address.E_Mail}</p>
                            )}
                            {address.Phone1 && (
                              <p className="text-xs text-default-400">{address.Phone1}</p>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <p className="text-sm max-w-xs truncate" title={formatAddress(address)}>
                            {formatAddress(address) || 'No address provided'}
                          </p>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    total={totalPages}
                    page={currentPage}
                    onChange={setCurrentPage}
                    showControls
                    showShadow
                  />
                </div>
              )}
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={onClose}
          >
            Cancel
          </Button>
          {selectedAddress && (
            <Button
              color="warning"
              variant="light"
              onPress={() => {
                // Clear selection logic could be implemented here
                onClose()
              }}
            >
              Clear Selection
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}