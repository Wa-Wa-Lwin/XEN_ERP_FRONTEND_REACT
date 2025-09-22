import { useFieldArray, Controller } from 'react-hook-form'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardBody, Button, Input, Textarea, Select, SelectItem } from '@heroui/react'
import { Icon } from '@iconify/react'
import { DEFAULT_PARCEL } from '../../constants/form-defaults'
import { DIMENSION_UNITS, WEIGHT_UNITS } from '../../constants/form-defaults'
import ParcelItems from './ParcelItems'
import type { FormSectionProps } from '../../types/shipment-form.types'
import { PARCEL_BOX_TYPES } from '@pages/shipment/constants/parcel_box_types'

const ParcelsSection = ({ register, errors, control, setValue, watch }: FormSectionProps & { watch: any }) => {
    // Watch the send_to field to conditionally apply validation
    const sendTo = watch('send_to');

    // Watch ship from and ship to countries for conditional validation
    const shipFromCountry = watch('ship_from_country');
    const shipToCountry = watch('ship_to_country');

    // Helper function to determine if a field should be required based on send_to value
    const isFieldRequired = (fieldName: string) => {
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

        setValue(`parcels.${parcelIndex}.net_weight_value`, netWeight.toFixed(2), {
            shouldValidate: true,
            shouldDirty: true
        })
        setValue(`parcels.${parcelIndex}.weight_value`, grossWeight.toFixed(2), {
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

    const handleBoxTypeChange = (parcelIndex: number, selectedBoxTypeName: string) => {
        const selectedBoxType = PARCEL_BOX_TYPES.find(box => box.box_type_name === selectedBoxTypeName)

        console.log('handleBoxTypeChange called with:', { parcelIndex, selectedBoxTypeName, selectedBoxType })

        if (selectedBoxType) {
            // Set form values with shouldValidate and shouldDirty options
            setValue(`parcels.${parcelIndex}.box_type`, selectedBoxType.box_type_name, { shouldValidate: true, shouldDirty: true })
            setValue(`parcels.${parcelIndex}.box_type_name`, selectedBoxType.box_type_name, {
                shouldValidate: true,
                shouldDirty: true
            })
            setValue(`parcels.${parcelIndex}.width`, selectedBoxType.width, { shouldValidate: true, shouldDirty: true })
            setValue(`parcels.${parcelIndex}.height`, selectedBoxType.height, { shouldValidate: true, shouldDirty: true })
            setValue(`parcels.${parcelIndex}.depth`, selectedBoxType.depth, { shouldValidate: true, shouldDirty: true })
            setValue(`parcels.${parcelIndex}.dimension_unit`, selectedBoxType.dimension_unit, {
                shouldValidate: true,
                shouldDirty: true
            })
            setValue(`parcels.${parcelIndex}.parcel_weight_value`, selectedBoxType.parcel_weight, {
                shouldValidate: true,
                shouldDirty: true
            })
            setValue(`parcels.${parcelIndex}.weight_unit`, selectedBoxType.weight_unit, {
                shouldValidate: true,
                shouldDirty: true
            })

            console.log("selectedBoxType.width ", selectedBoxType.width)
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
        } else {
            console.log('No box type found for name:', selectedBoxTypeName)
        }
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
            <CardHeader className="px-0 pt-0 pb-1 flex-row items-center justify-between">
                <h2 className="text-lg font-semibold">Parcels and Items</h2>
                <Button
                    type="button"
                    color="primary"
                    size="sm"
                    startContent={<Icon icon="solar:add-circle-bold" />}
                    onPress={() => appendParcel(DEFAULT_PARCEL)}
                >
                    Add Parcel
                </Button>
            </CardHeader>
            <CardBody className="px-0 pt-0 pb-0 space-y-3">
                {parcelFields.map((parcel, parcelIndex) => (
                    <Card key={parcel.id} shadow="none" className="p-0 m-0">
                        <CardHeader className="px-0 pt-0 pb-1 flex-row items-center justify-between">
                            <h3 className="text-base font-medium">
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
                                                <Select
                                                    {...field}
                                                    label={
                                                        <span>
                                                            Box Type{' '}
                                                            {isFieldRequired('box_type_name') && (
                                                                <span className="text-red-500">*</span>
                                                            )}
                                                        </span>
                                                    }
                                                    placeholder="Select box type"
                                                    errorMessage={errors.parcels?.[parcelIndex]?.box_type_name?.message}
                                                    isInvalid={!!errors.parcels?.[parcelIndex]?.box_type_name}

                                                    onSelectionChange={(keys) => {
                                                        const selectedKey = Array.from(keys)[0] as string
                                                        if (selectedKey) {
                                                            const selectedBoxType = PARCEL_BOX_TYPES.find(box => box.box_type_name === selectedKey)
                                                            if (selectedBoxType) {
                                                                field.onChange(selectedBoxType.box_type_name)
                                                                handleBoxTypeChange(parcelIndex, selectedKey)
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {PARCEL_BOX_TYPES.map((boxType) => (
                                                        <SelectItem key={boxType.box_type_name} value={boxType.box_type_name}>
                                                            {boxType.box_type_name}
                                                        </SelectItem>
                                                    ))}
                                                </Select>
                                            )}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Controller
                                            name={`parcels.${parcelIndex}.width`}
                                            control={control}
                                            rules={{ required: isFieldRequired('width') ? 'Width is required' : false, min: 0 }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    step="0.01"
                                                    label={<span>Width (cm) {isFieldRequired('width') && <span className="text-red-500">*</span>}</span>}
                                                    placeholder="Enter width"
                                                    errorMessage={errors.parcels?.[parcelIndex]?.width?.message}
                                                    isInvalid={!!errors.parcels?.[parcelIndex]?.width}
                                                    isReadOnly={isAutoFilled(parcelIndex)}
                                                    className={isAutoFilled(parcelIndex) ? 'bg-gray-50' : ''}
                                                    endContent={
                                                        isAutoFilled(parcelIndex) && (
                                                            <Icon icon="solar:lock-keyhole-minimalistic-bold"
                                                                className="text-gray-400" />
                                                        )
                                                    }
                                                    min={1}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Controller
                                            name={`parcels.${parcelIndex}.height`}
                                            control={control}
                                            rules={{ required: isFieldRequired('height') ? 'Height is required' : false, min: 0 }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    step="0.01"
                                                    label={<span>Height (cm) {isFieldRequired('height') && <span className="text-red-500">*</span>}</span>}
                                                    placeholder="Enter height"
                                                    errorMessage={errors.parcels?.[parcelIndex]?.height?.message}
                                                    isInvalid={!!errors.parcels?.[parcelIndex]?.height}
                                                    isReadOnly={isAutoFilled(parcelIndex)}
                                                    className={isAutoFilled(parcelIndex) ? 'bg-gray-50' : ''}
                                                    endContent={
                                                        isAutoFilled(parcelIndex) && (
                                                            <Icon icon="solar:lock-keyhole-minimalistic-bold"
                                                                className="text-gray-400" />
                                                        )
                                                    }
                                                    min={1}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Controller
                                            name={`parcels.${parcelIndex}.depth`}
                                            control={control}
                                            rules={{ required: isFieldRequired('depth') ? 'Depth is required' : false, min: 0 }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    step="0.01"
                                                    label={<span>Depth (cm) {isFieldRequired('depth') && <span className="text-red-500">*</span>}</span>}
                                                    placeholder="Enter depth"
                                                    errorMessage={errors.parcels?.[parcelIndex]?.depth?.message}
                                                    isInvalid={!!errors.parcels?.[parcelIndex]?.depth}
                                                    isReadOnly={isAutoFilled(parcelIndex)}
                                                    className={isAutoFilled(parcelIndex) ? 'bg-gray-50' : ''}
                                                    endContent={
                                                        isAutoFilled(parcelIndex) && (
                                                            <Icon icon="solar:lock-keyhole-minimalistic-bold"
                                                                className="text-gray-400" />
                                                        )
                                                    }
                                                    min={1}
                                                />
                                            )}
                                        />
                                    </div>
                                    <Controller
                                        name={`parcels.${parcelIndex}.dimension_unit`}
                                        control={control}
                                        rules={{ required: isFieldRequired('dimension_unit') ? 'Dimension unit is required' : false }}
                                        defaultValue="cm"
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                label={<span>Dimension Unit {isFieldRequired('dimension_unit') && <span className="text-red-500">*</span>}</span>}
                                                defaultSelectedKeys={['cm']}
                                                errorMessage={errors.parcels?.[parcelIndex]?.dimension_unit?.message}
                                                isInvalid={!!errors.parcels?.[parcelIndex]?.dimension_unit}
                                                className="hidden"
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
                                            rules={{ required: isFieldRequired('parcel_weight_value') ? 'Parcel weight is required' : false, min: 0 }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    step="0.01"
                                                    label={<span>Parcel Weight (kg) {isFieldRequired('parcel_weight_value') && <span className="text-red-500">*</span>}</span>}
                                                    placeholder="Enter parcel weight"
                                                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_weight_value?.message}
                                                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_weight_value}
                                                    isReadOnly={isAutoFilled(parcelIndex)}
                                                    className={isAutoFilled(parcelIndex) ? 'bg-gray-50' : ''}
                                                    endContent={
                                                        isAutoFilled(parcelIndex) && (
                                                            <Icon icon="solar:lock-keyhole-minimalistic-bold"
                                                                className="text-gray-400" />
                                                        )
                                                    }
                                                    onChange={(e) => {
                                                        field.onChange(e)
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
                                shipFromCountry={shipFromCountry} shipToCountry={shipToCountry} />
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
                                        rules={{ required: isFieldRequired('description') ? 'Description is required' : false }}
                                        render={({ field }) => (
                                            <Textarea
                                                {...field}
                                                label={
                                                    <span>
                                                        Parcel Description {!manualDescriptionParcels.has(parcelIndex) && '(Auto-generated)'}
                                                        {isFieldRequired('description') && (
                                                            <span className="text-red-500">*</span>
                                                        )}
                                                    </span>}
                                                placeholder={manualDescriptionParcels.has(parcelIndex) ? "Enter parcel description manually" : "Auto-generated from item descriptions"}
                                                errorMessage={errors.parcels?.[parcelIndex]?.description?.message}
                                                isInvalid={!!errors.parcels?.[parcelIndex]?.description}
                                                isReadOnly={!manualDescriptionParcels.has(parcelIndex)}
                                                className={!manualDescriptionParcels.has(parcelIndex) ? "bg-gray-50" : ""}
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
                                        rules={{ required: isFieldRequired('net_weight_value') ? 'Net weight is required' : false, min: 0 }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="number"
                                                step="0.01"
                                                label={<span>Net Weight (kg) {isFieldRequired('net_weight_value') && <span className="text-red-500">*</span>}</span>}
                                                placeholder="Auto-calculated"
                                                errorMessage={errors.parcels?.[parcelIndex]?.net_weight_value?.message}
                                                isInvalid={!!errors.parcels?.[parcelIndex]?.net_weight_value}
                                                isReadOnly={true}
                                                className="bg-gray-50"
                                                endContent={
                                                    <>
                                                        <Icon icon="solar:calculator-bold" className="text-gray-400" />
                                                        <Icon icon="solar:lock-keyhole-minimalistic-bold" className="text-gray-400" />
                                                    </>
                                                }
                                            />
                                        )}
                                    />
                                </div>
                                <div className="relative">
                                    <Controller
                                        name={`parcels.${parcelIndex}.weight_value`}
                                        control={control}
                                        rules={{ required: isFieldRequired('weight_value') ? 'Weight is required' : false, min: 0 }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="number"
                                                step="0.01"
                                                label={<span>Gross Weight (kg) {isFieldRequired('weight_value') && <span className="text-red-500">*</span>}</span>}
                                                placeholder="Auto-calculated"
                                                errorMessage={errors.parcels?.[parcelIndex]?.weight_value?.message}
                                                isInvalid={!!errors.parcels?.[parcelIndex]?.weight_value}
                                                isReadOnly={true}
                                                className="bg-gray-50"
                                                endContent={
                                                    <>
                                                        <Icon icon="solar:calculator-bold" className="text-gray-400" />
                                                        <Icon icon="solar:lock-keyhole-minimalistic-bold" className="text-gray-400" />
                                                    </>
                                                }
                                            />
                                        )}
                                    />
                                </div>
                                <Controller
                                    name={`parcels.${parcelIndex}.weight_unit`}
                                    control={control}
                                    rules={{ required: isFieldRequired('weight_unit') ? 'Weight unit is required' : false }}
                                    defaultValue="kg"
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            label={<span>Weight Unit {isFieldRequired('weight_unit') && <span className="text-red-500">*</span>}</span>}
                                            defaultSelectedKeys={['kg']}
                                            errorMessage={errors.parcels?.[parcelIndex]?.weight_unit?.message}
                                            isInvalid={!!errors.parcels?.[parcelIndex]?.weight_unit}
                                            className="hidden"
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
        </Card>
    )
}

export default ParcelsSection