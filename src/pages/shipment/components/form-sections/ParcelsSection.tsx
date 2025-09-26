import { useFieldArray, Controller } from 'react-hook-form'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardBody, Button, Input, Textarea, Select, SelectItem } from '@heroui/react'
import { Icon } from '@iconify/react'
import { DEFAULT_PARCEL } from '../../constants/form-defaults'
import { DIMENSION_UNITS, WEIGHT_UNITS } from '../../constants/form-defaults'
import ParcelItems from './ParcelItems'
import type { FormSectionProps } from '../../types/shipment-form.types'
import { PARCEL_BOX_TYPES } from '@pages/shipment/constants/parcel_box_types'
import { ParcelBoxTypeSelectModal } from '@components/ParcelBoxTypeSelectModal'

interface ParcelsSectionProps extends FormSectionProps {
    watch: any
    validationMode?: 'shipment' | 'rate-calculator'
    onClearRates?: () => void
}

const ParcelsSection = ({ register, errors, control, setValue, watch, validationMode = 'shipment', onClearRates }: ParcelsSectionProps) => {
    // Watch the send_to field to conditionally apply validation (only for shipment mode)
    const sendTo = validationMode === 'shipment' ? watch('send_to') : null;

    // Watch ship from and ship to countries for conditional validation (only for shipment mode)
    const shipFromCountry = validationMode === 'shipment' ? watch('ship_from_country') : null;
    const shipToCountry = validationMode === 'shipment' ? watch('ship_to_country') : null;

    // Helper function to determine if a field should be required based on validation mode
    const isFieldRequired = (fieldName: string) => {
        if (validationMode === 'rate-calculator') {
            // For rate calculator, only parcel dimensions and weight are required
            const rateCalculatorRequiredFields = ['width', 'height', 'depth', 'parcel_weight_value'];
            return rateCalculatorRequiredFields.includes(fieldName);
        }

        if (sendTo === 'Logistic') {
            // For logistics, only specific parcel fields are required
            const logisticRequiredFields = ['box_type_name', 'width', 'height', 'depth', 'parcel_weight_value'];
            return logisticRequiredFields.includes(fieldName);
        }
        // For Approver or default, all fields are required as before
        return true;
    };
    const { fields: parcelFields, append: appendParcel, remove: removeParcel } = useFieldArray({
        control,
        name: 'parcels'
    })

    const [autoFilledParcels, setAutoFilledParcels] = useState<Set<number>>(new Set())
    const [manualEditParcels, setManualEditParcels] = useState<Set<number>>(new Set())
    const [manualDescriptionParcels, setManualDescriptionParcels] = useState<Set<number>>(new Set())
    const [modalState, setModalState] = useState<{ isOpen: boolean; parcelIndex: number | null }>({
        isOpen: false,
        parcelIndex: null
    })

    // Watch all parcel data for weight calculations
    const watchedParcels = watch('parcels')

    // Calculate net weight from all items in a parcel
    const calculateNetWeight = useCallback((parcelIndex: number): number => {
        const parcel = watchedParcels?.[parcelIndex]
        if (!parcel?.parcel_items) {
            return 0
        }

        return parcel.parcel_items.reduce((total: number, item: any) => {
            const weight = parseFloat(item.weight_value) || 0
            const quantity = parseInt(item.quantity) || 0
            return total + (weight * quantity)
        }, 0)
    }, [watchedParcels])

    // Calculate gross weight (parcel weight + net weight)
    const calculateGrossWeight = useCallback((parcelIndex: number): number => {
        const parcelWeight = parseFloat(watchedParcels?.[parcelIndex]?.parcel_weight_value) || 0
        const netWeight = calculateNetWeight(parcelIndex)
        return parcelWeight + netWeight
    }, [watchedParcels, calculateNetWeight])

    // Generate parcel description from item descriptions
    const generateParcelDescription = useCallback((parcelIndex: number): string => {
        const parcel = watchedParcels?.[parcelIndex]
        if (!parcel?.parcel_items || !Array.isArray(parcel.parcel_items)) {
            return ''
        }

        // Get all non-empty item descriptions
        const itemDescriptions = parcel.parcel_items
            .map((item: any) => item.description?.trim())
            .filter((desc: string) => desc && desc.length > 0)

        if (itemDescriptions.length === 0) {
            return ''
        }

        // Join descriptions with comma and space
        const fullDescription = itemDescriptions.join(', ')

        // Truncate to 200 characters with "etc." if needed
        if (fullDescription.length > 200) {
            // Find the last complete item before 195 characters (leaving space for ", etc.")
            const truncated = fullDescription.substring(0, 195)
            const lastCommaIndex = truncated.lastIndexOf(', ')

            if (lastCommaIndex > 0) {
                return truncated.substring(0, lastCommaIndex) + ', etc.'
            } else {
                // If no comma found, just truncate and add etc.
                return truncated.substring(0, 195) + ', etc.'
            }
        }

        return fullDescription
    }, [watchedParcels])

    // Update weights and description automatically
    const updateWeights = useCallback((parcelIndex: number) => {
        const netWeight = calculateNetWeight(parcelIndex)
        const grossWeight = calculateGrossWeight(parcelIndex)

        setValue(`parcels.${parcelIndex}.net_weight_value`, netWeight.toFixed(5), {
            shouldValidate: true,
            shouldDirty: true
        })
        setValue(`parcels.${parcelIndex}.weight_value`, grossWeight.toFixed(5), {
            shouldValidate: true,
            shouldDirty: true
        })

        // Only update description if not in manual mode
        if (!manualDescriptionParcels.has(parcelIndex)) {
            const description = generateParcelDescription(parcelIndex)
            setValue(`parcels.${parcelIndex}.description`, description, {
                shouldValidate: true,
                shouldDirty: true
            })
        }
    }, [calculateNetWeight, calculateGrossWeight, generateParcelDescription, setValue, manualDescriptionParcels])

    // Watch for changes in item weights and quantities
    useEffect(() => {
        if (watchedParcels && Array.isArray(watchedParcels)) {
            watchedParcels.forEach((parcel: any, parcelIndex: number) => {
                // Only update if the parcel has items
                if (parcel && parcel.parcel_items && Array.isArray(parcel.parcel_items) && parcel.parcel_items.length > 0) {
                    updateWeights(parcelIndex)
                }
            })
        }
    }, [watchedParcels, updateWeights])

    const handleBoxTypeSelect = (boxType: any) => {
        const parcelIndex = modalState.parcelIndex
        if (parcelIndex === null) return

        console.log('handleBoxTypeSelect called with:', { parcelIndex, boxType })

        // Clear rates since parcel dimensions/weight are changing
        if (onClearRates) {
            console.log('Parcel box type changed, clearing rates...')
            onClearRates()
        }

        // Set form values with shouldValidate and shouldDirty options
        setValue(`parcels.${parcelIndex}.box_type_name`, boxType.box_type_name, {
            shouldValidate: true,
            shouldDirty: true
        })
        setValue(`parcels.${parcelIndex}.width`, boxType.width, { shouldValidate: true, shouldDirty: true })
        setValue(`parcels.${parcelIndex}.height`, boxType.height, { shouldValidate: true, shouldDirty: true })
        setValue(`parcels.${parcelIndex}.depth`, boxType.depth, { shouldValidate: true, shouldDirty: true })
        setValue(`parcels.${parcelIndex}.dimension_unit`, boxType.dimension_unit, {
            shouldValidate: true,
            shouldDirty: true
        })
        setValue(`parcels.${parcelIndex}.parcel_weight_value`, boxType.parcel_weight, {
            shouldValidate: true,
            shouldDirty: true
        })
        setValue(`parcels.${parcelIndex}.weight_unit`, boxType.weight_unit, {
            shouldValidate: true,
            shouldDirty: true
        })

        console.log("selectedBoxType.width ", boxType.width)
        console.log('Form values set for parcel:', parcelIndex)

        // Mark this parcel as auto-filled
        setAutoFilledParcels(prev => new Set(prev).add(parcelIndex))
        // Remove from manual edit if it was there
        setManualEditParcels(prev => {
            const updated = new Set(prev)
            updated.delete(parcelIndex)
            return updated
        })

        // Trigger weight recalculation after parcel weight is set
        setTimeout(() => updateWeights(parcelIndex), 100)
    }

    const openBoxTypeModal = (parcelIndex: number) => {
        setModalState({ isOpen: true, parcelIndex })
    }

    const closeBoxTypeModal = () => {
        setModalState({ isOpen: false, parcelIndex: null })
    }

    const handleToggleManualEdit = (parcelIndex: number) => {
        setManualEditParcels(prev => {
            const updated = new Set(prev)
            if (updated.has(parcelIndex)) {
                updated.delete(parcelIndex)
            } else {
                updated.add(parcelIndex)
            }
            return updated
        })
    }

    const handleToggleDescriptionMode = (parcelIndex: number) => {
        setManualDescriptionParcels(prev => {
            const updated = new Set(prev)
            if (updated.has(parcelIndex)) {
                // Switching back to auto mode - generate description
                updated.delete(parcelIndex)
                setTimeout(() => {
                    const description = generateParcelDescription(parcelIndex)
                    setValue(`parcels.${parcelIndex}.description`, description, {
                        shouldValidate: true,
                        shouldDirty: true
                    })
                }, 100)
            } else {
                // Switching to manual mode
                updated.add(parcelIndex)
            }
            return updated
        })
    }


    const isAutoFilled = (parcelIndex: number) => {
        return autoFilledParcels.has(parcelIndex) && !manualEditParcels.has(parcelIndex)
    }

    const handleRemoveParcel = (parcelIndex: number) => {
        // Clear rates since parcels are being removed
        if (onClearRates) {
            console.log('Parcel removed, clearing rates...')
            onClearRates()
        }

        removeParcel(parcelIndex)
        // Clean up state for removed parcel
        // @ts-expect-error - no type
        setAutoFilledParcels(prev => {
            const updated = new Set()
            prev.forEach(index => {
                if (index < parcelIndex) {
                    updated.add(index)
                } else if (index > parcelIndex) {
                    updated.add(index - 1)
                }
            })
            return updated
        })
        // @ts-expect-error - no type
        setManualEditParcels(prev => {
            const updated = new Set()
            prev.forEach(index => {
                if (index < parcelIndex) {
                    updated.add(index)
                } else if (index > parcelIndex) {
                    updated.add(index - 1)
                }
            })
            return updated
        })
        // @ts-expect-error - no type
        setManualDescriptionParcels(prev => {
            const updated = new Set()
            prev.forEach(index => {
                if (index < parcelIndex) {
                    updated.add(index)
                } else if (index > parcelIndex) {
                    updated.add(index - 1)
                }
            })
            return updated
        })
    }

    return (
        <Card className="p-2">
            {/* <Card shadow="none"> */}
            {/* <Card shadow="none" className="py-0 px-4 m-0"> */}
            <CardHeader className="px-0 pt-0 pb-1 flex-row items-center justify-left">
                <h2 className="text-lg font-semibold pr-3">Parcels and Items</h2>
                <Button
                    type="button"
                    color="primary"
                    size="sm"
                    startContent={<Icon icon="solar:add-circle-bold" />}
                    onPress={() => {
                        // Clear rates since new parcel is being added
                        if (onClearRates) {
                            console.log('New parcel added, clearing rates...')
                            onClearRates()
                        }
                        appendParcel(DEFAULT_PARCEL)
                    }}
                >
                    Add Parcel
                </Button>
            </CardHeader>
            <CardBody className="px-0 pt-0 pb-0 space-y-3">
                {parcelFields.map((parcel, parcelIndex) => (
                    <Card key={parcel.id} shadow="none" className="p-0 m-0">
                        <CardHeader className="px-0 pt-0 pb-1 flex-row items-center justify-left">
                            <h3 className="text-base font-medium pr-3">
                                Parcel {parcelIndex + 1}
                            </h3>

                            {/* Right side */}
                            <div className="flex gap-2 flex-wrap justify-end">
                                {isAutoFilled(parcelIndex) && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="light"
                                        color="primary"
                                        startContent={<Icon icon="solar:pen-bold" />}
                                        onPress={() => handleToggleManualEdit(parcelIndex)}
                                    >
                                        Edit Dimensions Manually
                                    </Button>
                                )}
                                {manualEditParcels.has(parcelIndex) && autoFilledParcels.has(parcelIndex) && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="light"
                                        color="warning"
                                        startContent={<Icon icon="solar:lock-keyhole-minimalistic-bold" />}
                                        onPress={() => handleToggleManualEdit(parcelIndex)}
                                    >
                                        Lock Auto-filled Values
                                    </Button>
                                )}
                                {parcelFields.length > 1 && (
                                    <Button
                                        type="button"
                                        color="danger"
                                        size="sm"
                                        variant="light"
                                        startContent={<Icon icon="solar:trash-bin-minimalistic-bold" />}
                                        onPress={() => handleRemoveParcel(parcelIndex)}
                                    >
                                        Remove Parcel
                                    </Button>
                                )}
                            </div>
                        </CardHeader>

                        <CardBody className="px-0 pt-0 pb-0">
                            {/* Parcel Information */}
                            <div className="space-y-3 mb-4">

                                {/* Box Type and Description Row */}
                                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                                    <div className="space-y-2 col-span-2">
                                        <Controller
                                            name={`parcels.${parcelIndex}.box_type_name`}
                                            control={control}
                                            rules={{ required: isFieldRequired('box_type_name') ? 'Box type is required' : false }}
                                            render={({ field }) => (
                                                <div className="space-y-2">                                                    
                                                    <Button
                                                        type="button"
                                                        variant="bordered"
                                                        color={!field.value ? "warning" : "default"}
                                                        className="w-full justify-between h-14"
                                                        startContent={<Icon icon="solar:box-linear" />}
                                                        endContent={<Icon icon="solar:alt-arrow-down-linear" />}
                                                        onPress={() => openBoxTypeModal(parcelIndex)}
                                                    >
                                                        <span className="truncate">
                                                            Select : {field.value || "box type"}
                                                        </span>
                                                    </Button>
                                                    {errors.parcels?.[parcelIndex]?.box_type_name && (
                                                        <p className="text-xs text-red-500">
                                                            {errors.parcels?.[parcelIndex]?.box_type_name?.message}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Controller
                                            name={`parcels.${parcelIndex}.width`}
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    isRequired={isFieldRequired('width')}
                                                    {...field}
                                                    type="number"
                                                    step="0.01"
                                                    label={<span>Width (cm)</span>}
                                                    placeholder="Enter width"
                                                    errorMessage={errors.parcels?.[parcelIndex]?.width?.message}
                                                    isInvalid={!!errors.parcels?.[parcelIndex]?.width}
                                                    isReadOnly={isAutoFilled(parcelIndex)}
                                                    color={!watch(`parcels.${parcelIndex}.width`) ? "warning" : "default"}
                                                    className={isAutoFilled(parcelIndex) ? 'bg-gray-50' : ''}
                                                    endContent={
                                                        isAutoFilled(parcelIndex) && (
                                                            <Icon icon="solar:lock-keyhole-minimalistic-bold"
                                                                className="text-gray-400" />
                                                        )
                                                    }
                                                    onChange={(e) => {
                                                        field.onChange(e)
                                                        // Clear rates since parcel dimensions are changing
                                                        if (onClearRates) {
                                                            console.log('Parcel width changed, clearing rates...')
                                                            onClearRates()
                                                        }
                                                    }}
                                                    min={1}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Controller
                                            name={`parcels.${parcelIndex}.height`}
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    isRequired={isFieldRequired('height')}
                                                    {...field}
                                                    type="number"
                                                    step="0.01"
                                                    label={<span>Height (cm)</span>}
                                                    placeholder="Enter height"
                                                    errorMessage={errors.parcels?.[parcelIndex]?.height?.message}
                                                    isInvalid={!!errors.parcels?.[parcelIndex]?.height}
                                                    isReadOnly={isAutoFilled(parcelIndex)}
                                                    color={!watch(`parcels.${parcelIndex}.height`) ? "warning" : "default"}
                                                    className={isAutoFilled(parcelIndex) ? 'bg-gray-50' : ''}
                                                    endContent={
                                                        isAutoFilled(parcelIndex) && (
                                                            <Icon icon="solar:lock-keyhole-minimalistic-bold"
                                                                className="text-gray-400" />
                                                        )
                                                    }
                                                    onChange={(e) => {
                                                        field.onChange(e)
                                                        // Clear rates since parcel dimensions are changing
                                                        if (onClearRates) {
                                                            console.log('Parcel height changed, clearing rates...')
                                                            onClearRates()
                                                        }
                                                    }}
                                                    min={1}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Controller
                                            name={`parcels.${parcelIndex}.depth`}
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    isRequired={isFieldRequired('depth')}
                                                    type="number"
                                                    step="0.01"
                                                    label={<span>Depth (cm)</span>}
                                                    placeholder="Enter depth"
                                                    errorMessage={errors.parcels?.[parcelIndex]?.depth?.message}
                                                    isInvalid={!!errors.parcels?.[parcelIndex]?.depth}
                                                    isReadOnly={isAutoFilled(parcelIndex)}
                                                    color={!watch(`parcels.${parcelIndex}.depth`) ? "warning" : "default"}
                                                    className={isAutoFilled(parcelIndex) ? 'bg-gray-50' : ''}
                                                    endContent={
                                                        isAutoFilled(parcelIndex) && (
                                                            <Icon icon="solar:lock-keyhole-minimalistic-bold"
                                                                className="text-gray-400" />
                                                        )
                                                    }
                                                    onChange={(e) => {
                                                        field.onChange(e)
                                                        // Clear rates since parcel dimensions are changing
                                                        if (onClearRates) {
                                                            console.log('Parcel depth changed, clearing rates...')
                                                            onClearRates()
                                                        }
                                                    }}
                                                    min={1}
                                                />
                                            )}
                                        />
                                    </div>
                                    <Controller
                                        name={`parcels.${parcelIndex}.dimension_unit`}
                                        control={control}
                                        defaultValue="cm"
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                isRequired={isFieldRequired('dimension_unit')}
                                                label={<span>Dimension Unit</span>}
                                                defaultSelectedKeys={['cm']}
                                                errorMessage={errors.parcels?.[parcelIndex]?.dimension_unit?.message}
                                                isInvalid={!!errors.parcels?.[parcelIndex]?.dimension_unit}
                                                className="hidden"
                                                color={!watch(`parcels.${parcelIndex}.dimension_unit`) ? "warning" : "default"}
                                                onSelectionChange={(keys) => {
                                                    const selectedKey = Array.from(keys)[0] as string
                                                    if (selectedKey) {
                                                        field.onChange(selectedKey)
                                                    }
                                                }}
                                            >
                                                {DIMENSION_UNITS.map((unit) => (
                                                    <SelectItem key={unit.key} value={unit.value}>
                                                        {unit.label}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                    <div className="relative">
                                        <Controller
                                            name={`parcels.${parcelIndex}.parcel_weight_value`}
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    isRequired={isFieldRequired('parcel_weight_value')}
                                                    type="number"
                                                    step="0.00001"
                                                    label={<span>Parcel Weight (kg)</span>}
                                                    placeholder="0.00000"
                                                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_weight_value?.message}
                                                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_weight_value}
                                                    isReadOnly={isAutoFilled(parcelIndex)}
                                                    color={!watch(`parcels.${parcelIndex}.parcel_weight_value`) ? "warning" : "default"}
                                                    className={isAutoFilled(parcelIndex) ? 'bg-gray-50' : ''}
                                                    endContent={
                                                        isAutoFilled(parcelIndex) && (
                                                            <Icon icon="solar:lock-keyhole-minimalistic-bold"
                                                                className="text-gray-400" />
                                                        )
                                                    }
                                                    onChange={(e) => {
                                                        field.onChange(e)
                                                        // Clear rates since parcel weight is changing
                                                        if (onClearRates) {
                                                            console.log('Parcel weight changed, clearing rates...')
                                                            onClearRates()
                                                        }
                                                        // Trigger weight recalculation when parcel weight changes
                                                        setTimeout(() => updateWeights(parcelIndex), 100)
                                                    }}
                                                    min={0}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Parcel Items */}
                            <ParcelItems parcelIndex={parcelIndex} control={control} register={register} errors={errors}
                                setValue={setValue} watch={watch} onWeightChange={() => updateWeights(parcelIndex)} sendTo={sendTo}
                                shipFromCountry={shipFromCountry} shipToCountry={shipToCountry} validationMode={validationMode}
                                onClearRates={onClearRates} />
                            {/* Dimensions Row */}
                            <div className="grid grid-cols-1 md:grid-cols-6 sm:grid-cols-3 gap-3">
                                <div className='col-span-4 flex gap-3'>
                                    <div>
                                        {/* Description mode toggle */}
                                        {!manualDescriptionParcels.has(parcelIndex) ? (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="bordered"
                                                color="primary"
                                                startContent={<Icon icon="solar:pen-bold" />}
                                                onPress={() => handleToggleDescriptionMode(parcelIndex)}
                                            >
                                                Edit Description Manually
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="bordered"
                                                color="success"
                                                startContent={<Icon icon="solar:magic-stick-3-bold" />}
                                                onPress={() => handleToggleDescriptionMode(parcelIndex)}
                                            >
                                                Use Auto Description
                                            </Button>
                                        )}
                                    </div>
                                    <Controller
                                        name={`parcels.${parcelIndex}.description`}
                                        control={control}
                                        render={({ field }) => (
                                            <Textarea
                                                isRequired={isFieldRequired('description')}
                                                {...field}
                                                label={
                                                    <span>
                                                        Parcel Description {!manualDescriptionParcels.has(parcelIndex) && '(Auto-generated)'}
                                                    </span>}
                                                placeholder={manualDescriptionParcels.has(parcelIndex) ? "Enter parcel description manually" : "Auto-generated from item descriptions"}
                                                errorMessage={errors.parcels?.[parcelIndex]?.description?.message}
                                                isInvalid={!!errors.parcels?.[parcelIndex]?.description}
                                                isReadOnly={!manualDescriptionParcels.has(parcelIndex)}
                                                className={!manualDescriptionParcels.has(parcelIndex) ? "bg-gray-50" : ""}
                                                color={!watch(`parcels.${parcelIndex}.description`) ? "warning" : "default"}
                                                endContent={
                                                    !manualDescriptionParcels.has(parcelIndex) ? (
                                                        <>
                                                            <Icon icon="solar:magic-stick-3-bold" className="text-gray-400" />
                                                            <Icon icon="solar:lock-keyhole-minimalistic-bold" className="text-gray-400" />
                                                        </>
                                                    ) : (
                                                        <Icon icon="solar:pen-bold" className="text-gray-400" />
                                                    )
                                                }
                                                minRows={1}
                                            />
                                        )}
                                    />

                                </div>
                                <div className="relative">
                                    <Controller
                                        name={`parcels.${parcelIndex}.net_weight_value`}
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                            isRequired = {isFieldRequired('net_weight_value')}
                                                {...field}
                                                type="number"
                                                step="0.00001"
                                                label={
                                                <span>
                                                    Net Weight (kg)
                                                </span>}
                                                placeholder="0.00000"
                                                errorMessage={errors.parcels?.[parcelIndex]?.net_weight_value?.message}
                                                isInvalid={!!errors.parcels?.[parcelIndex]?.net_weight_value}
                                                isReadOnly={true}
                                                color={!watch(`parcels.${parcelIndex}.net_weight_value`) ? "warning" : "default"}
                                                className="bg-gray-50"
                                                endContent={
                                                    <>
                                                        <Icon icon="solar:calculator-bold" className="text-gray-400" />
                                                        <Icon icon="solar:lock-keyhole-minimalistic-bold" className="text-gray-400" />
                                                    </>
                                                }
                                                min={1}
                                            />
                                        )}
                                    />
                                </div>
                                <div className="relative">
                                    <Controller
                                        name={`parcels.${parcelIndex}.weight_value`}
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                isRequired={isFieldRequired('weight_value')}
                                                type="number"
                                                step="0.00001"
                                                label={<span>Gross Weight (kg)</span>}
                                                placeholder="0.00000"
                                                errorMessage={errors.parcels?.[parcelIndex]?.weight_value?.message}
                                                isInvalid={!!errors.parcels?.[parcelIndex]?.weight_value}
                                                isReadOnly={true}
                                                color={!watch(`parcels.${parcelIndex}.weight_value`) ? "warning" : "default"}
                                                className="bg-gray-50"
                                                endContent={
                                                    <>
                                                        <Icon icon="solar:calculator-bold" className="text-gray-400" />
                                                        <Icon icon="solar:lock-keyhole-minimalistic-bold" className="text-gray-400" />
                                                    </>
                                                }
                                                min={1}
                                            />
                                        )}
                                    />
                                </div>
                                <Controller
                                    name={`parcels.${parcelIndex}.weight_unit`}
                                    control={control}
                                    defaultValue="kg"
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            isRequired={isFieldRequired('weight_unit')}
                                            label={<span>Weight Unit</span>}
                                            defaultSelectedKeys={['kg']}
                                            errorMessage={errors.parcels?.[parcelIndex]?.weight_unit?.message}
                                            isInvalid={!!errors.parcels?.[parcelIndex]?.weight_unit}
                                            className="hidden"
                                            color={!watch(`parcels.${parcelIndex}.weight_unit`) ? "warning" : "default"}
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
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </CardBody>

            <ParcelBoxTypeSelectModal
                isOpen={modalState.isOpen}
                onClose={closeBoxTypeModal}
                onSelect={handleBoxTypeSelect}
                selectedBoxType={modalState.parcelIndex !== null ?
                    PARCEL_BOX_TYPES.find(boxType =>
                        boxType.box_type_name === watch(`parcels.${modalState.parcelIndex}.box_type_name`)
                    ) : null
                }
            />
        </Card>
    )
}

export default ParcelsSection