import React, { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Card,
  CardBody,
  Chip,
  Divider
} from '@heroui/react'
import { Icon } from '@iconify/react'

interface BoxType {
  id: string
  name: string
  category: string
  dimensions: {
    length: number
    width: number
    height: number
    unit: string
  }
  maxWeight: {
    value: number
    unit: string
  }
  description: string
  icon: string
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default'
}

interface ParcelBoxTypeSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (boxType: BoxType) => void
  selectedBoxType?: BoxType | null
}

const BOX_TYPES: BoxType[] = [
  {
    id: 'small_box',
    name: 'Small Box',
    category: 'Standard',
    dimensions: { length: 20, width: 15, height: 10, unit: 'cm' },
    maxWeight: { value: 2, unit: 'kg' },
    description: 'Ideal for small items like electronics, jewelry, or documents',
    icon: 'solar:box-linear',
    color: 'primary'
  },
  {
    id: 'medium_box',
    name: 'Medium Box',
    category: 'Standard',
    dimensions: { length: 30, width: 25, height: 20, unit: 'cm' },
    maxWeight: { value: 5, unit: 'kg' },
    description: 'Perfect for clothing, books, or medium-sized items',
    icon: 'solar:box-linear',
    color: 'secondary'
  },
  {
    id: 'large_box',
    name: 'Large Box',
    category: 'Standard',
    dimensions: { length: 40, width: 30, height: 25, unit: 'cm' },
    maxWeight: { value: 10, unit: 'kg' },
    description: 'Great for multiple items or larger single items',
    icon: 'solar:box-linear',
    color: 'success'
  },
  {
    id: 'envelope',
    name: 'Envelope',
    category: 'Document',
    dimensions: { length: 35, width: 25, height: 2, unit: 'cm' },
    maxWeight: { value: 0.5, unit: 'kg' },
    description: 'For documents, photos, or thin flat items',
    icon: 'solar:document-linear',
    color: 'warning'
  },
  {
    id: 'tube',
    name: 'Tube',
    category: 'Specialty',
    dimensions: { length: 60, width: 10, height: 10, unit: 'cm' },
    maxWeight: { value: 3, unit: 'kg' },
    description: 'For posters, blueprints, or cylindrical items',
    icon: 'solar:pipe-linear',
    color: 'danger'
  },
  {
    id: 'custom',
    name: 'Custom Box',
    category: 'Custom',
    dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
    maxWeight: { value: 0, unit: 'kg' },
    description: 'Define your own dimensions and specifications',
    icon: 'solar:settings-linear',
    color: 'default'
  }
]

export const ParcelBoxTypeSelectModal: React.FC<ParcelBoxTypeSelectModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedBoxType
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const categories = ['All', ...Array.from(new Set(BOX_TYPES.map(box => box.category)))]

  const filteredBoxTypes = BOX_TYPES.filter(boxType => {
    const matchesSearch = boxType.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         boxType.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || boxType.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSelect = (boxType: BoxType) => {
    onSelect(boxType)
    onClose()
  }

  const formatDimensions = (dimensions: BoxType['dimensions']) => {
    if (dimensions.length === 0 && dimensions.width === 0 && dimensions.height === 0) {
      return 'Custom dimensions'
    }
    return `${dimensions.length} × ${dimensions.width} × ${dimensions.height} ${dimensions.unit}`
  }

  const formatWeight = (weight: BoxType['maxWeight']) => {
    if (weight.value === 0) return 'Custom weight'
    return `Max ${weight.value} ${weight.unit}`
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex gap-2 items-center">
          <Icon icon="solar:box-linear" width={24} className="text-primary" />
          Select Parcel Box Type
        </ModalHeader>

        <ModalBody className="py-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Input
              placeholder="Search box types..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Icon icon="solar:magnifer-linear" width={20} />}
              isClearable
              onClear={() => setSearchQuery('')}
              className="flex-1"
            />

            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Chip
                  key={category}
                  variant={selectedCategory === category ? "solid" : "bordered"}
                  color={selectedCategory === category ? "primary" : "default"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Chip>
              ))}
            </div>
          </div>

          {/* Results Info */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              {filteredBoxTypes.length > 0
                ? `${filteredBoxTypes.length} box type${filteredBoxTypes.length === 1 ? '' : 's'} found`
                : 'No box types found'
              }
            </p>
            {selectedBoxType && (
              <Chip size="sm" color="success" variant="flat">
                Current: {selectedBoxType.name}
              </Chip>
            )}
          </div>

          {/* No Results */}
          {filteredBoxTypes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Icon icon="solar:inbox-linear" width={48} className="text-default-300 mb-4" />
              <p className="text-default-500">No box types found</p>
              <p className="text-default-400 text-sm">Try adjusting your search terms or category filter</p>
            </div>
          )}

          {/* Box Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBoxTypes.map((boxType) => {
              const isSelected = selectedBoxType?.id === boxType.id

              return (
                <Card
                  key={boxType.id}
                  isPressable
                  isHoverable
                  className={`transition-all ${
                    isSelected ? 'ring-2 ring-primary bg-primary-50' : ''
                  }`}
                  onPress={() => handleSelect(boxType)}
                >
                  <CardBody className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-lg bg-${boxType.color}-100`}>
                        <Icon
                          icon={boxType.icon}
                          width={24}
                          className={`text-${boxType.color}-600`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-sm">{boxType.name}</h3>
                          <Chip size="sm" color={boxType.color} variant="flat">
                            {boxType.category}
                          </Chip>
                          {isSelected && (
                            <Chip size="sm" color="success" variant="solid">
                              <Icon icon="solar:check-circle-bold" width={14} />
                            </Chip>
                          )}
                        </div>

                        <p className="text-xs text-default-600 mb-3">
                          {boxType.description}
                        </p>

                        <Divider className="my-2" />

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Icon icon="solar:ruler-linear" width={14} className="text-default-400" />
                            <span className="text-xs text-default-600">
                              {formatDimensions(boxType.dimensions)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Icon icon="solar:scale-linear" width={14} className="text-default-400" />
                            <span className="text-xs text-default-600">
                              {formatWeight(boxType.maxWeight)}
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          color={isSelected ? "success" : "primary"}
                          variant={isSelected ? "solid" : "flat"}
                          className="mt-3 w-full"
                          startContent={
                            <Icon
                              icon={isSelected ? "solar:check-circle-bold" : "solar:arrow-right-linear"}
                              width={16}
                            />
                          }
                          onPress={() => handleSelect(boxType)}
                        >
                          {isSelected ? 'Selected' : 'Select This Type'}
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={onClose}
          >
            Cancel
          </Button>
          {selectedBoxType && (
            <Button
              color="warning"
              variant="light"
              onPress={() => {
                // Clear selection logic
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