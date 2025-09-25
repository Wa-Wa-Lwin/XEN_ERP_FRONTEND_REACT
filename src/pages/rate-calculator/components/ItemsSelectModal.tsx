import React, { useState, useEffect } from 'react'
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
import { useParcelItemsCache } from '@hooks/useParcelItemsCache'

interface MaterialData {
  material_code: string
  description: string
  type_name: string
  part_revision: string
  supplier_name: string
  sku: string
  part_no: string
  hscode: string
}

interface ItemsSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (item: MaterialData) => void
  selectedItems?: MaterialData[]
  title?: string
}

export const ItemsSelectModal: React.FC<ItemsSelectModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedItems = [],
  title = "Select Item"
}) => {
  const { materials, isLoading, fetchParcelItems } = useParcelItemsCache()
  const [filteredMaterials, setFilteredMaterials] = useState<MaterialData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter materials based on search only
  useEffect(() => {
    let filtered = materials

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.material_code.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.part_no.toLowerCase().includes(query) ||
        item.supplier_name.toLowerCase().includes(query) ||
        item.hscode.toLowerCase().includes(query)
      )
    }

    setFilteredMaterials(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [materials, searchQuery])

  // Load materials when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchParcelItems()
    }
  }, [isOpen, fetchParcelItems])

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentMaterials = filteredMaterials.slice(startIndex, endIndex)

  const handleSelect = (item: MaterialData) => {
    onSelect(item)
    onClose()
  }

  const isItemSelected = (item: MaterialData) => {
    return selectedItems.some(selected => selected.material_code === item.material_code)
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
          <Icon icon="solar:widget-linear" width={24} className="text-primary" />
          {title}
        </ModalHeader>

        <ModalBody className="py-4">
          {/* Search Controls */}
          <div className="flex gap-3 mb-4">
            <Input
              placeholder="Search by code, description, SKU, part number, supplier..."
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
              onPress={() => fetchParcelItems(true)}
              isLoading={isLoading}
              title="Refresh items"
            >
              <Icon icon="solar:refresh-linear" width={20} />
            </Button>
          </div>

          {/* Results Info */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              {filteredMaterials.length > 0
                ? `${filteredMaterials.length} item${filteredMaterials.length === 1 ? '' : 's'} found`
                : 'No items found'
              }
            </p>
            {selectedItems.length > 0 && (
              <Chip size="sm" color="success" variant="flat">
                {selectedItems.length} selected
              </Chip>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
              <span className="ml-3">Loading materials...</span>
            </div>
          )}

          {/* No Results */}
          {!isLoading && filteredMaterials.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Icon icon="solar:inbox-linear" width={48} className="text-default-300 mb-4" />
              <p className="text-default-500">No items found</p>
              <p className="text-default-400 text-sm">
                {searchQuery ? 'Try adjusting your search terms' : 'No materials available'}
              </p>
            </div>
          )}

          {/* Materials Table */}
          {!isLoading && currentMaterials.length > 0 && (
            <>
              <Table
                aria-label="Materials selection table"
                classNames={{
                  wrapper: "max-h-[400px]"
                }}
              >
                <TableHeader>
                  <TableColumn>MATERIAL CODE</TableColumn>
                  <TableColumn>DESCRIPTION</TableColumn>
                  <TableColumn>TYPE</TableColumn>
                  <TableColumn>SKU / PART NO</TableColumn>
                  <TableColumn>HS CODE</TableColumn>
                  <TableColumn>SUPPLIER</TableColumn>
                </TableHeader>
                <TableBody>
                  {currentMaterials.map((item) => {
                    const isSelected = isItemSelected(item)

                    return (
                      <TableRow
                        key={item.material_code}
                        className={`cursor-pointer hover:bg-default-100 ${isSelected ? 'bg-primary-50' : ''}`}
                        onClick={() => handleSelect(item)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <Icon icon="solar:check-circle-bold" width={16} className="text-success" />
                            )}
                            <div className="flex flex-col">
                              <p className="font-semibold text-sm">{item.material_code}</p>
                              {item.part_revision && (
                                <p className="text-xs text-default-400">Rev: {item.part_revision}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <p className="text-sm max-w-xs" title={item.description}>
                            {item.description || 'No description'}
                          </p>
                        </TableCell>

                        <TableCell>
                          {item.type_name ? (
                            <Chip size="sm" variant="flat" color="primary">
                              {item.type_name}
                            </Chip>
                          ) : (
                            <span className="text-xs text-default-400">N/A</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            {item.sku && (
                              <p className="text-xs">SKU: {item.sku}</p>
                            )}
                            {item.part_no && (
                              <p className="text-xs">Part: {item.part_no}</p>
                            )}
                            {!item.sku && !item.part_no && (
                              <span className="text-xs text-default-400">N/A</span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <p className="text-xs font-mono">
                            {item.hscode || 'N/A'}
                          </p>
                        </TableCell>

                        <TableCell>
                          <p className="text-xs max-w-24 truncate" title={item.supplier_name}>
                            {item.supplier_name || 'N/A'}
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
          <Button
            color="primary"
            variant="light"
            onPress={() => fetchParcelItems(true)}
            isLoading={isLoading}
            startContent={<Icon icon="solar:refresh-linear" width={16} />}
          >
            Refresh Items
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}