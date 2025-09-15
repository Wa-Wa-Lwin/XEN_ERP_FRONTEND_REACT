import { useState, useEffect } from 'react'
import { useFieldArray } from 'react-hook-form'
import { 
  Button, Input, Select, SelectItem, 
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter
} from '@heroui/react'
import { Icon } from '@iconify/react'
import { useParcelItemsCache } from '@hooks/useParcelItemsCache'
import { DEFAULT_PARCEL_ITEM, WEIGHT_UNITS } from '../../constants/form-defaults'
import type { ParcelItemsProps } from '../../types/shipment-form.types'
import { CURRENCIES } from '@pages/shipment/constants/currencies'
import { COUNTRIES } from '@pages/shipment/constants/countries'

interface MaterialData {
  material_code: string;
  description: string;
  type_name: string;
  part_revision: string;
  supplier_name: string;
  sku: string;
  part_no: string;
}

const ParcelItems = ({ parcelIndex, control, register, errors, setValue }: ParcelItemsProps & { setValue: any }) => {
  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control,
    name: `parcels.${parcelIndex}.parcel_items`
  })

  const { materials, isLoading: isLoadingMaterials, fetchParcelItems } = useParcelItemsCache()
  const [filteredMaterials, setFilteredMaterials] = useState<MaterialData[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Initialize filtered materials when materials change
  useEffect(() => {
    setFilteredMaterials(materials)
  }, [materials])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMaterials(materials)
    } else {
      const filtered = materials.filter(material =>
        material.material_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.type_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.part_no.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredMaterials(filtered)
    }
  }, [searchQuery, materials])

  const openMaterialModal = (itemIndex: number) => {
    console.log("Clicked material list select", itemIndex)
    setCurrentItemIndex(itemIndex)
    setSearchQuery('')
    setIsModalOpen(true)
    
    // If materials are not loaded, fetch them asynchronously after opening modal
    if (materials.length === 0) {
      fetchParcelItems().catch(error => {
        console.error('Failed to load materials:', error)
      })
    }
  }

  const handleMaterialSelect = (selectedMaterial: MaterialData) => {
    if (currentItemIndex !== null) {
      const basePath = `parcels.${parcelIndex}.parcel_items.${currentItemIndex}`

      // Update form fields using react-hook-form
      setValue(`${basePath}.description`, selectedMaterial.description, { shouldValidate: true, shouldDirty: true })
      setValue(`${basePath}.sku`, selectedMaterial.sku, { shouldValidate: true, shouldDirty: true })
    }
    setIsModalOpen(false)
    setCurrentItemIndex(null)
  }

  return (
    <div className="border-t pt-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-medium">Parcel Items</h4>
        <Button
          type="button"
          color="secondary"
          size="sm"
          variant="bordered"
          startContent={<Icon icon="solar:add-circle-bold" />}
          onPress={() => appendItem(DEFAULT_PARCEL_ITEM)}
        >
          Add Item
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table 
          aria-label="Parcel items table"
          classNames={{
            wrapper: "min-h-[200px]",
            table: "min-w-[1200px]",
            td: "px-1 py-1",
            th: "px-1 py-2",
          }}
        >
          <TableHeader>
            <TableColumn className="w-12">#</TableColumn>
            <TableColumn className="w-48 min-w-[80px]">DESCRIPTION</TableColumn>
            <TableColumn className="w-36">SKU</TableColumn>
            <TableColumn className="w-24">HS CODE</TableColumn>
            <TableColumn className="w-28">ORIGIN</TableColumn>
            <TableColumn className="w-20">PRICE</TableColumn>
            <TableColumn className="w-28">CURRENCY</TableColumn>
            <TableColumn className="w-20">WEIGHT(kg)</TableColumn>
            <TableColumn className="w-16">QTY</TableColumn>
            <TableColumn className="w-16">ACTION</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No items added yet">
            {itemFields.map((item, itemIndex) => (
              <TableRow key={item.id}>
                <TableCell>
                  <span className="text-sm font-medium text-default-600">
                    {itemIndex + 1}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      color={materials.length > 0 ? "success" : "primary"}
                      size="sm"
                      variant="light"
                      isIconOnly
                      onPress={() => openMaterialModal(itemIndex)}
                      isLoading={isLoadingMaterials}
                    >
                      {!isLoadingMaterials && (
                        <Icon 
                          icon={materials.length > 0 ? "solar:database-bold" : "material-symbols:search"} 
                          width={16} 
                        />
                      )}
                    </Button>
                    <Input
                      {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.description`, { required: 'Item description is required' })}
                      placeholder="Enter item description"
                      variant="flat"
                      size="sm"
                      errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.description?.message}
                      isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.description}
                      classNames={{
                        input: "text-sm",
                        inputWrapper: "min-h-unit-8 h-unit-8"
                      }}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.sku`, { required: 'SKU is required' })}
                    placeholder="SKU"
                    variant="flat"
                    size="sm"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.sku?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.sku}
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "min-h-unit-8 h-unit-8"
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.hs_code`, { required: 'HS Code is required' })}
                    placeholder="HS Code"
                    variant="flat"
                    size="sm"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.hs_code?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.hs_code}
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "min-h-unit-8 h-unit-8"
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.origin_country`, { required: 'Origin country is required' })}
                    placeholder="Country"
                    variant="flat"
                    size="sm"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.origin_country?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.origin_country}
                    classNames={{
                      trigger: "min-h-unit-8 h-unit-8",
                      value: "text-sm"
                    }}
                  >
                    {COUNTRIES.map((option) => (
                      <SelectItem key={option.key} value={option.value}>
                        {option.key}
                      </SelectItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.price_amount`, { required: 'Price is required', min: 0 })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    variant="flat"
                    size="sm"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.price_amount?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.price_amount}
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "min-h-unit-8 h-unit-8"
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.price_currency`, { required: 'Currency is required' })}
                    placeholder="THB"
                    variant="flat"
                    size="sm"
                    defaultSelectedKeys={['THB']}
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.price_currency?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.price_currency}
                    classNames={{
                      trigger: "min-h-unit-8 h-unit-8",
                      value: "text-sm"
                    }}
                  >
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.key} value={currency.value}>
                        {currency.key}
                      </SelectItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.weight_value`, { required: 'Weight is required', min: 0 })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    variant="flat"
                    size="sm"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.weight_value?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.weight_value}
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "min-h-unit-8 h-unit-8"
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.quantity`, { required: 'Quantity is required', min: 1 })}
                    type="number"
                    placeholder="1"
                    variant="flat"
                    size="sm"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.quantity?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.quantity}
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "min-h-unit-8 h-unit-8"
                    }}
                  />
                </TableCell>
                <TableCell>
                  {itemFields.length > 1 && (
                    <Button
                      type="button"
                      color="danger"
                      size="sm"
                      variant="light"
                      isIconOnly
                      onPress={() => removeItem(itemIndex)}
                    >
                      <Icon icon="solar:trash-bin-minimalistic-bold" width={16} />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Hidden weight unit field */}
      {itemFields.map((item, itemIndex) => (
        <Select
          key={`weight-unit-${item.id}`}
          {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.weight_unit`, { required: 'Weight unit is required' })}
          defaultSelectedKeys={['kg']}
          className="hidden"
        >
          {WEIGHT_UNITS.map((unit) => (
            <SelectItem key={unit.key} value={unit.value}>
              {unit.label}
            </SelectItem>
          ))}
        </Select>
      ))}

      {/* Material Lookup Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h3>Material Lookup</h3>
                  {materials.length > 0 && (
                    <span className="text-sm text-default-500">
                      {materials.length} materials available
                    </span>
                  )}
                </div>
                <Input
                  placeholder="Search materials by any field..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  startContent={<Icon icon="solar:magnifer-bold" />}
                  variant="flat"
                  className="mt-2"
                  isDisabled={isLoadingMaterials}
                />
              </ModalHeader>
              <ModalBody>
                <div className="overflow-x-auto">
                  <Table 
                    aria-label="Materials table"
                    classNames={{
                      wrapper: "min-h-[400px]",
                    }}
                  >
                    <TableHeader>
                      <TableColumn>MATERIAL CODE</TableColumn>
                      <TableColumn>DESCRIPTION</TableColumn>
                      <TableColumn>TYPE</TableColumn>
                      <TableColumn>SKU</TableColumn>
                      <TableColumn>PART NO</TableColumn>
                      <TableColumn>SUPPLIER</TableColumn>
                      <TableColumn>REVISION</TableColumn>
                      <TableColumn>ACTION</TableColumn>
                    </TableHeader>
                    <TableBody 
                      emptyContent={
                        isLoadingMaterials 
                          ? "Loading materials from cache..." 
                          : materials.length === 0
                            ? "No materials available. Please wait while we load the data."
                            : "No materials found matching your search."
                      }
                      isLoading={isLoadingMaterials && materials.length === 0}
                      loadingContent="Loading materials from server..."
                    >
                      {filteredMaterials.map((material) => (
                        <TableRow key={material.material_code}>
                          <TableCell>
                            <span className="font-medium text-primary">
                              {material.material_code}
                            </span>
                          </TableCell>
                          <TableCell><span className="text-sm">{material.description}</span></TableCell>
                          <TableCell><span className="text-sm">{material.type_name}</span></TableCell>
                          <TableCell><span className="text-sm">{material.sku}</span></TableCell>
                          <TableCell><span className="text-sm">{material.part_no}</span></TableCell>
                          <TableCell><span className="text-sm">{material.supplier_name}</span></TableCell>
                          <TableCell><span className="text-sm">{material.part_revision}</span></TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              color="primary"
                              variant="flat"
                              onPress={() => handleMaterialSelect(material)}
                            >
                              Select
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
    </div>
  )
}

export default ParcelItems
