import { useState, useEffect, useMemo } from 'react'
import { useFieldArray } from 'react-hook-form'
import {
    Button, Input, Select, SelectItem, Autocomplete, AutocompleteItem,
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Pagination,
    Textarea
} from '@heroui/react'
import { Icon } from '@iconify/react'
import { useParcelItemsCache } from '@hooks/useParcelItemsCache'
import { DEFAULT_PARCEL_ITEM, WEIGHT_UNITS } from '../../constants/form-defaults'
import type { ParcelItemsProps } from '../../types/shipment-form.types'
import { CURRENCIES } from '@pages/shipment/constants/currencies'
import { COUNTRIES } from '@pages/shipment/constants/countries'
import { Controller } from 'react-hook-form'

interface MaterialData {
    material_code: string;
    description: string;
    type_name: string;
    part_revision: string;
    supplier_name: string;
    sku: string;
    part_no: string;
    hscode: string;
}

const DEBOUNCE_MS = 200

interface ExtendedParcelItemsProps extends ParcelItemsProps {
    sendTo?: string
    shipFromCountry?: string
    shipToCountry?: string
    validationMode?: 'shipment' | 'rate-calculator'
    onClearRates?: () => void
}

const ParcelItems = ({ parcelIndex, control, register, errors, setValue, watch, onWeightChange, sendTo, shipFromCountry, shipToCountry, validationMode = 'shipment', onClearRates }: ExtendedParcelItemsProps) => {
    // Helper function to determine if item fields should be required based on validation mode
    const isItemFieldRequired = (fieldName: string) => {
        if (validationMode === 'rate-calculator') {
            // For rate calculator, only quantity and weight are required
            const rateCalculatorRequiredFields = ['quantity', 'weight_value'];
            return rateCalculatorRequiredFields.includes(fieldName);
        }

        if (sendTo === 'Logistic') {
            // For logistics, HS code and origin country are not required
            const logisticNotRequiredFields = ['hs_code', 'origin_country'];
            if (logisticNotRequiredFields.includes(fieldName)) {
                return false;
            }
            // All other fields are still required for logistics
            return true;
        }

        // Additional condition: HS Code and Origin country are optional if both ship from and ship to countries are THA
        if ((fieldName === 'hs_code' || fieldName === 'origin_country') &&
            shipFromCountry === 'THA' && shipToCountry === 'THA') {
            return false;
        }

        // For Approver or default, all other fields are required as before
        return true;
    };
    const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
        control,
        name: `parcels.${parcelIndex}.parcel_items`
    })

    const { materials, isLoading: isLoadingMaterials, fetchParcelItems } = useParcelItemsCache()

    // Modal + lookup state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null)

    // Search (debounced for large lists)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')

    useEffect(() => {
        const id = setTimeout(() => setDebouncedQuery(searchQuery), DEBOUNCE_MS)
        return () => clearTimeout(id)
    }, [searchQuery])

    // Pagination state
    const [page, setPage] = useState(1)
    const rowsPerPage = 25

    // Reset to page 1 whenever the dataset or query changes
    useEffect(() => {
        setPage(1)
    }, [debouncedQuery, materials])

    const filteredMaterials: MaterialData[] = useMemo(() => {
        if (!debouncedQuery.trim()) return materials
        const q = debouncedQuery.toLowerCase()
        // single pass filter (fast even for 100k with debounce)
        return materials.filter(m =>
            m.material_code?.toLowerCase().includes(q) ||
            m.description?.toLowerCase().includes(q) ||
            m.type_name?.toLowerCase().includes(q) ||
            m.supplier_name?.toLowerCase().includes(q) ||
            m.sku?.toLowerCase().includes(q) ||
            m.part_no?.toLowerCase().includes(q) ||
            m.hscode?.toLowerCase().includes(q)
        )
    }, [materials, debouncedQuery])

    const totalItems = filteredMaterials.length
    const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage))
    const clampedPage = Math.min(page, totalPages)

    // compute current page slice
    const paginatedMaterials = useMemo(() => {
        const start = (clampedPage - 1) * rowsPerPage
        const end = start + rowsPerPage
        return filteredMaterials.slice(start, end)
    }, [filteredMaterials, clampedPage, rowsPerPage])

    const showingFrom = totalItems === 0 ? 0 : (clampedPage - 1) * rowsPerPage + 1
    const showingTo = Math.min(clampedPage * rowsPerPage, totalItems)

    const openMaterialModal = (itemIndex: number) => {
        setCurrentItemIndex(itemIndex)
        setSearchQuery('')
        setIsModalOpen(true)

        // If materials are not loaded, fetch them after opening modal
        if (materials.length === 0) {
            fetchParcelItems().catch(error => {
                console.error('Failed to load materials:', error)
            })
        }
    }

    const handleMaterialSelect = (selectedMaterial: MaterialData) => {
        if (currentItemIndex !== null) {
            // Clear rates since material selection changes multiple fields
            if (onClearRates) {
                console.log('Material selected for item, clearing rates...')
                onClearRates()
            }

            const basePath = `parcels.${parcelIndex}.parcel_items.${currentItemIndex}`
            setValue(`${basePath}.description`, selectedMaterial.description || '', { shouldValidate: true, shouldDirty: true })
            setValue(`${basePath}.sku`, selectedMaterial.sku || '', { shouldValidate: true, shouldDirty: true })
            setValue(`${basePath}.hs_code`, selectedMaterial.hscode || '', { shouldValidate: true, shouldDirty: true })
        }
        setIsModalOpen(false)
        setCurrentItemIndex(null)
    }

    return (
        <div className="border-t border-b pt-2 pb-2 mb-2 bg-gray-100">
            <div className="flex justify-left items-center mb-4 gap-3">
                <h4 className="text-md font-medium">Parcel Items</h4>
                <Button
                    type="button"
                    color="primary"
                    size="sm"
                    variant="bordered"
                    startContent={<Icon icon="solar:add-circle-bold" />}
                    onPress={() => {
                        // Clear rates since new item is being added
                        if (onClearRates) {
                            console.log('New item added to parcel, clearing rates...')
                            onClearRates()
                        }
                        appendItem(DEFAULT_PARCEL_ITEM)
                        if (onWeightChange) {
                            setTimeout(onWeightChange, 100)
                        }
                    }}
                >
                    Add Item
                </Button>
            </div>

            <div className="overflow-x-auto">
                <Table
                    aria-label="Parcel items table"
                    classNames={{
                        wrapper: `${itemFields.length <= 1 ? 'min-h-0' : 'min-h-[50px]'} p-0 border-0 rounded-none`,
                        table: "min-w-[1200px]",
                        td: "px-1 py-1",
                        th: "px-1 py-2",
                    }}
                >
                    <TableHeader>
                        <TableColumn className="w-12">#</TableColumn>
                        <TableColumn className="w-48 min-w-[80px]">DESCRIPTION {isItemFieldRequired('description') && <span className="text-red-500">*</span>}</TableColumn>
                        <TableColumn className="w-36">SKU {isItemFieldRequired('sku') && <span className="text-red-500">*</span>}</TableColumn>
                        <TableColumn className="w-24">HS CODE {isItemFieldRequired('hs_code') && <span className="text-red-500">*</span>}</TableColumn>
                        <TableColumn className="w-28">ORIGIN {isItemFieldRequired('origin_country') && <span className="text-red-500">*</span>}</TableColumn>
                        <TableColumn className="w-20">PRICE {isItemFieldRequired('price_amount') && <span className="text-red-500">*</span>}</TableColumn>
                        <TableColumn className="w-28">CURRENCY {isItemFieldRequired('price_currency') && <span className="text-red-500">*</span>}</TableColumn>
                        <TableColumn className="w-20">WEIGHT(kg) {isItemFieldRequired('weight_value') && <span className="text-red-500">*</span>}</TableColumn>
                        <TableColumn className="w-16">QTY {isItemFieldRequired('quantity') && <span className="text-red-500">*</span>}</TableColumn>
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

                                        <Controller
                                            name={`parcels.${parcelIndex}.parcel_items.${itemIndex}.description`}
                                            control={control}
                                            rules={{ required: isItemFieldRequired('description') ? 'Item description is required' : false }}
                                            render={({ field }) => (
                                                <Textarea
                                                    {...field}                     // makes it controlled + subscribed
                                                    placeholder="Enter item description"
                                                    variant="flat"
                                                    size="sm"
                                                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.description?.message}
                                                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.description}
                                                    classNames={{
                                                        input: "text-sm",
                                                        inputWrapper: "min-h-unit-8 h-unit-8"
                                                    }}
                                                    color={!watch(`parcels.${parcelIndex}.parcel_items.${itemIndex}.description`) ? "warning" : "default"}
                                                    minRows={1}
                                                    onChange={(e) => {
                                                        field.onChange(e)
                                                        // Clear rates since item description changed
                                                        if (onClearRates) {
                                                            console.log('Item description changed, clearing rates...')
                                                            onClearRates()
                                                        }
                                                        if (onWeightChange) {
                                                            setTimeout(onWeightChange, 100)
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                </TableCell>

                                {/* SKU cell */}
                                <TableCell>
                                    <Controller
                                        name={`parcels.${parcelIndex}.parcel_items.${itemIndex}.sku`}
                                        control={control}
                                        rules={{ required: isItemFieldRequired('sku') ? 'SKU is required' : false }}
                                        render={({ field }) => (
                                            <Textarea
                                                {...field}
                                                placeholder="SKU"
                                                variant="flat"
                                                size="sm"
                                                errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.sku?.message}
                                                isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.sku}
                                                classNames={{
                                                    input: "text-sm",
                                                    inputWrapper: "min-h-unit-8 h-unit-8"
                                                }}
                                                color={!watch(`parcels.${parcelIndex}.parcel_items.${itemIndex}.sku`) ? "warning" : "default"}
                                                onChange={(e) => {
                                                    field.onChange(e)
                                                    // Clear rates since SKU changed
                                                    if (onClearRates) {
                                                        console.log('Item SKU changed, clearing rates...')
                                                        onClearRates()
                                                    }
                                                }}
                                                minRows={1}
                                            />
                                        )}
                                    />
                                </TableCell>
                                {/* HS CODE cell */}
                                <TableCell>
                                    <Controller
                                        name={`parcels.${parcelIndex}.parcel_items.${itemIndex}.hs_code`}
                                        control={control}
                                        // isRequired
                                        // rules={{ required: isItemFieldRequired('hs_code') ? 'HS Code is Required' : false }}
                                        render={({ field }) => (
                                            <Textarea
                                                isRequired={isItemFieldRequired('hs_code')}
                                                {...field}
                                                placeholder="HS CODE"
                                                variant="flat"
                                                size="sm"
                                                errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.hs_code?.message}
                                                isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.hs_code}
                                                classNames={{
                                                    input: "text-sm",
                                                    inputWrapper: "min-h-unit-8 h-unit-8"
                                                }}
                                                color={!watch(`parcels.${parcelIndex}.parcel_items.${itemIndex}.hs_code`) ? "warning" : "default"}
                                                onChange={(e) => {
                                                    field.onChange(e)
                                                    // Clear rates since HS code changed
                                                    if (onClearRates) {
                                                        console.log('Item HS code changed, clearing rates...')
                                                        onClearRates()
                                                    }
                                                }}
                                                minRows={1}
                                            />
                                        )}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Controller
                                        name={`parcels.${parcelIndex}.parcel_items.${itemIndex}.origin_country`}
                                        control={control}
                                        // rules={{ required: isItemFieldRequired('origin_country') ? 'Origin country is required' : false }}
                                        render={({ field }) => (
                                            <Autocomplete
                                                isRequired={isItemFieldRequired('origin_country')}
                                                {...field}
                                                defaultItems={COUNTRIES}
                                                placeholder="country"
                                                variant="flat"
                                                size="sm"
                                                errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.origin_country?.message}
                                                isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.origin_country}
                                                selectedKey={field.value || null}
                                                onSelectionChange={(key) => {
                                                    if (key) {
                                                        field.onChange(key)
                                                        // Clear rates since origin country changed
                                                        if (onClearRates) {
                                                            console.log('Item origin country changed, clearing rates...')
                                                            onClearRates()
                                                        }
                                                    }
                                                }}
                                                listboxProps={{
                                                    emptyContent: "No countries found."
                                                }}
                                                classNames={{
                                                    base: "min-h-unit-8 h-unit-8",
                                                    listbox: "max-h-60"
                                                }}
                                                color={!watch(`parcels.${parcelIndex}.parcel_items.${itemIndex}.origin_country`) ? "warning" : "default"}
                                            >
                                                {(item) => (
                                                    <AutocompleteItem key={item.key} value={item.value}>
                                                        {item.key}
                                                    </AutocompleteItem>
                                                )}
                                            </Autocomplete>
                                        )}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        {...register(
                                            `parcels.${parcelIndex}.parcel_items.${itemIndex}.price_amount`,
                                            {
                                                required: isItemFieldRequired('price_amount') ? 'Price is required' : false,
                                                min: { value: 0, message: 'Price must be at least 0' },
                                                pattern: {
                                                    value: /^\d*\.?\d*$/,
                                                    message: 'Only numbers and decimals allowed',
                                                },
                                            }
                                        )}
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
                                        color={!watch(`parcels.${parcelIndex}.parcel_items.${itemIndex}.price_amount`) ? "warning" : "default"}
                                        onChange={(e) => {
                                            // register automatically handles the field change
                                            // Clear rates since price changed
                                            if (onClearRates) {
                                                console.log('Item price changed, clearing rates...')
                                                onClearRates()
                                            }
                                        }}
                                        min={0}
                                    />

                                    {/* <Textarea
                                        {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.price_amount`, { required: isItemFieldRequired('price_amount') ? 'Price is required' : false, min: 0 })}
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
                                        min={0}
                                        minRows={1}
                                    /> */}
                                </TableCell>
                                {/* <TableCell>
                                    <Controller
                                        name={`parcels.${parcelIndex}.parcel_items.${itemIndex}.price_currency`}
                                        control={control}
                                        rules={{ required: isItemFieldRequired('price_currency') ? 'Currency is required' : false }}
                                        defaultValue="THB"
                                        render={({ field }) => (
                                            <Select
                                                {...field}
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
                                                onSelectionChange={(keys) => {
                                                    const selectedKey = Array.from(keys)[0] as string
                                                    if (selectedKey) {
                                                        field.onChange(selectedKey)
                                                    }
                                                }}
                                            >
                                                {CURRENCIES.map((currency) => (
                                                    <SelectItem key={currency.key} value={currency.value}>
                                                        {currency.key}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                </TableCell> */}
                                <TableCell>
                                    <Controller
                                        name={`parcels.${parcelIndex}.parcel_items.${itemIndex}.price_currency`}
                                        control={control}
                                        rules={{ required: isItemFieldRequired('price_currency') ? 'Currency is required' : false }}
                                        defaultValue="THB"
                                        render={({ field }) => (
                                            <Autocomplete
                                                {...field}
                                                defaultItems={CURRENCIES}
                                                placeholder="Select currency"
                                                variant="flat"
                                                size="sm"
                                                selectedKey={field.value || "THB"}
                                                errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.price_currency?.message}
                                                isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.price_currency}
                                                onSelectionChange={(key) => {
                                                    if (key) {
                                                        field.onChange(key.toString());
                                                        // Clear rates since currency changed
                                                        if (onClearRates) {
                                                            console.log('Item currency changed, clearing rates...')
                                                            onClearRates()
                                                        }
                                                    } else {
                                                        field.onChange("THB");
                                                    }
                                                }}
                                                color={!watch(`parcels.${parcelIndex}.parcel_items.${itemIndex}.price_currency`) ? "warning" : "default"}
                                            >
                                                {(currency) => (
                                                    <AutocompleteItem key={currency.key} value={currency.value}>
                                                        {currency.key}
                                                    </AutocompleteItem>
                                                )}
                                            </Autocomplete>
                                        )}
                                    />
                                </TableCell>

                                <TableCell>
                                    <Controller
                                        name={`parcels.${parcelIndex}.parcel_items.${itemIndex}.weight_value`}
                                        control={control}
                                        rules={{ required: isItemFieldRequired('weight_value') ? 'Weight is required' : false, min: 0 }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
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
                                                color={!watch(`parcels.${parcelIndex}.parcel_items.${itemIndex}.weight_value`) ? "warning" : "default"}
                                                onChange={(e) => {
                                                    field.onChange(e)
                                                    if (onWeightChange) {
                                                        setTimeout(onWeightChange, 100)
                                                    }
                                                }}
                                                min={0}
                                            />
                                        )}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Controller
                                        name={`parcels.${parcelIndex}.parcel_items.${itemIndex}.quantity`}
                                        control={control}
                                        rules={{ required: isItemFieldRequired('quantity') ? 'Quantity is required' : false, min: 1 }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
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
                                                color={!watch(`parcels.${parcelIndex}.parcel_items.${itemIndex}.quantity`) ? "warning" : "default"}
                                                onChange={(e) => {
                                                    field.onChange(e)
                                                    if (onWeightChange) {
                                                        setTimeout(onWeightChange, 100)
                                                    }
                                                }}
                                            />
                                        )}
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
                                            onPress={() => {
                                                // Clear rates since item is being removed
                                                if (onClearRates) {
                                                    console.log('Item removed from parcel, clearing rates...')
                                                    onClearRates()
                                                }
                                                removeItem(itemIndex)
                                                if (onWeightChange) {
                                                    setTimeout(onWeightChange, 100)
                                                }
                                            }}
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
                <Controller
                    key={`weight-unit-${item.id}`}
                    name={`parcels.${parcelIndex}.parcel_items.${itemIndex}.weight_unit`}
                    control={control}
                    rules={{ required: isItemFieldRequired('weight_unit') ? 'Weight unit is required' : false }}
                    defaultValue="kg"
                    render={({ field }) => (
                        <Select
                            {...field}
                            defaultSelectedKeys={['kg']}
                            className="hidden"
                            color={!watch(`parcels.${parcelIndex}.parcel_items.${itemIndex}.weight_unit`) ? "warning" : "default"}
                            onSelectionChange={(keys) => {
                                const selectedKey = Array.from(keys)[0] as string
                                if (selectedKey) {
                                    field.onChange(selectedKey)
                                }
                            }}
                        >
                            {WEIGHT_UNITS.map((unit) => (
                                <SelectItem key={unit.key} value={unit.value}>
                                    {unit.label}
                                </SelectItem>
                            ))}
                        </Select>
                    )}
                />
            ))}

            {/* Material Lookup Modal */}
            <Modal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                className="min-w-[90svw]"
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
                                <div className="flex gap-2 items-center mt-2">
                                    <Input
                                        placeholder="Search materials by any field..."
                                        value={searchQuery}
                                        onValueChange={setSearchQuery}
                                        startContent={<Icon icon="solar:magnifer-bold" />}
                                        variant="flat"
                                        isDisabled={isLoadingMaterials}
                                        className="flex-1"
                                    />
                                </div>
                            </ModalHeader>
                            <ModalBody>
                                <div>
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
                                            <TableColumn>HS CODE</TableColumn>
                                            <TableColumn>SUPPLIER</TableColumn>
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
                                            {paginatedMaterials.map((material) => (
                                                <TableRow
                                                    key={material.material_code}
                                                    className="cursor-pointer hover:bg-default-100 transition-colors"
                                                    onClick={() => handleMaterialSelect(material)}
                                                >
                                                    <TableCell>
                                                        <span className="font-medium text-primary">
                                                            {material.material_code}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell><span className="text-sm">{material.description}</span></TableCell>
                                                    <TableCell><span className="text-sm">{material.type_name}</span></TableCell>
                                                    <TableCell><span className="text-sm">{material.sku}</span></TableCell>
                                                    <TableCell><span className="text-sm">{material.part_no}</span></TableCell>
                                                    <TableCell><span className="text-sm">{material.hscode}</span></TableCell>
                                                    <TableCell><span className="text-sm">{material.supplier_name}</span></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination footer inside body */}
                                <div className="flex items-center justify-between pt-3">
                                    <span className="text-sm text-default-500">
                                        Showing {showingFrom.toLocaleString()}–{showingTo.toLocaleString()} of {totalItems.toLocaleString()}
                                    </span>
                                    <Pagination
                                        page={clampedPage}
                                        total={totalPages}
                                        onChange={setPage}
                                        showControls
                                        size="sm"
                                        className="ml-auto"
                                    />
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
