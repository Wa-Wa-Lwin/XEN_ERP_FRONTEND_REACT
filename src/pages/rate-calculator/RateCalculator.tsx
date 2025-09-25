import { useState } from 'react'
import { Card, CardBody, CardHeader, Button, Divider } from '@heroui/react'
import { useForm } from 'react-hook-form'
import { Icon } from '@iconify/react'
import { useRateCalculator } from './hooks/useRateCalculator'
import { AddressForm } from './components/AddressForm'
import { ParcelsForm } from './components/ParcelsForm'
import { RatesTable } from './components/RatesTable'
import { ErrorModal } from './components/ErrorModal'
import { AddressSelectModal } from './components/AddressSelectModal'
import { ParcelBoxTypeSelectModal } from './components/ParcelBoxTypeSelectModal'
import { ItemsSelectModal } from './components/ItemsSelectModal'
import type { RateCalculatorFormData } from './types/rate-calculator.types'
import type { AddressData } from '@pages/addresses/types'

const DEFAULT_FORM_VALUES: RateCalculatorFormData = {
  // Ship From Address
  ship_from_country: 'THA',
  ship_from_contact_name: 'Ms. Sasipimol',
  ship_from_phone: '+66896345885',
  ship_from_email: 'sasipimol@xenoptics.com',
  ship_from_company_name: 'XENOptics Limited',
  ship_from_street1: '195 Moo.3 Bypass Chiangmai-Hangdong Rd.',
  ship_from_street2: 'T. Namphrae, A. Hangdong',
  ship_from_city: 'Hang Dong',
  ship_from_state: 'Chiang Mai',
  ship_from_postal_code: '50230',

  // Ship To Address (empty by default)
  ship_to_country: '',
  ship_to_contact_name: '',
  ship_to_phone: '',
  ship_to_email: '',
  ship_to_company_name: '',
  ship_to_street1: '',
  ship_to_street2: '',
  ship_to_city: '',
  ship_to_state: '',
  ship_to_postal_code: '',

  // Parcels
  parcels: [{
    width: 0,
    height: 0,
    depth: 0,
    dimension_unit: 'cm',
    weight_value: 0,
    weight_unit: 'kg',
    description: '',
    parcel_items: [{
      description: '',
      quantity: 1,
      price_currency: 'THB',
      price_amount: 0,
      item_id: '',
      origin_country: '',
      weight_unit: 'kg',
      weight_value: 0,
      sku: '',
      hs_code: ''
    }]
  }]
}

const RateCalculator = () => {
  const [calculatedRates, setCalculatedRates] = useState<any[]>([])

  // Modal states
  const [addressModal, setAddressModal] = useState<{
    isOpen: boolean
    type: 'ship_from' | 'ship_to'
    title: string
  }>({ isOpen: false, type: 'ship_from', title: '' })

  const [boxTypeModal, setBoxTypeModal] = useState<{
    isOpen: boolean
    parcelIndex: number
  }>({ isOpen: false, parcelIndex: 0 })

  const [itemsModal, setItemsModal] = useState<{
    isOpen: boolean
    parcelIndex: number
    itemIndex: number
  }>({ isOpen: false, parcelIndex: 0, itemIndex: 0 })

  const { register, control, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<RateCalculatorFormData>({
    defaultValues: DEFAULT_FORM_VALUES
  })

  const { calculateRates, isCalculating, errorModal, setErrorModal } = useRateCalculator()

  const onCalculateRates = async (data: RateCalculatorFormData) => {
    try {
      const rates = await calculateRates(data)
      setCalculatedRates(rates)
    } catch (error) {
      console.error('Failed to calculate rates:', error)
    }
  }

  const handleClearRates = () => {
    setCalculatedRates([])
  }

  // Modal handlers
  const handleOpenAddressModal = (type: 'ship_from' | 'ship_to') => {
    setAddressModal({
      isOpen: true,
      type,
      title: type === 'ship_from' ? 'Select Ship From Address' : 'Select Ship To Address'
    })
  }

  const handleSelectAddress = (address: AddressData) => {
    const prefix = addressModal.type

    // Map address data to form fields
    setValue(`${prefix}_company_name`, address.CardName)
    setValue(`${prefix}_contact_name`, address.CntctPrsn || '')
    setValue(`${prefix}_phone`, address.Phone1 || '')
    setValue(`${prefix}_email`, address.E_Mail || '')
    setValue(`${prefix}_street1`, address.Address || address.MailAddres || '')
    setValue(`${prefix}_street2`, address.Building || address.MailBuildi || '')
    setValue(`${prefix}_city`, address.City || address.MailCity || '')
    setValue(`${prefix}_state`, address.County || address.MailCounty || '')
    setValue(`${prefix}_postal_code`, address.ZipCode || address.MailZipCod || '')
    setValue(`${prefix}_country`, address.Country || address.MailCountr || '')
  }

  const handleOpenBoxTypeModal = (parcelIndex: number) => {
    setBoxTypeModal({
      isOpen: true,
      parcelIndex
    })
  }

  const handleSelectBoxType = (boxType: any) => {
    const parcelIndex = boxTypeModal.parcelIndex

    // Update parcel dimensions based on box type (skip if custom box with 0 dimensions)
    if (!(boxType.depth === 0 && boxType.width === 0 && boxType.height === 0)) {
      setValue(`parcels.${parcelIndex}.width`, boxType.width)
      setValue(`parcels.${parcelIndex}.height`, boxType.height)
      setValue(`parcels.${parcelIndex}.depth`, boxType.depth)
      setValue(`parcels.${parcelIndex}.dimension_unit`, boxType.dimension_unit)
      setValue(`parcels.${parcelIndex}.description`, boxType.box_type_name)
    }
  }

  const handleOpenItemsModal = (parcelIndex: number, itemIndex: number) => {
    setItemsModal({
      isOpen: true,
      parcelIndex,
      itemIndex
    })
  }

  const handleSelectItem = (item: any) => {
    const { parcelIndex, itemIndex } = itemsModal

    // Update item data based on selected material
    setValue(`parcels.${parcelIndex}.parcel_items.${itemIndex}.description`, item.description)
    setValue(`parcels.${parcelIndex}.parcel_items.${itemIndex}.item_id`, item.material_code)
    setValue(`parcels.${parcelIndex}.parcel_items.${itemIndex}.sku`, item.sku || '')
    setValue(`parcels.${parcelIndex}.parcel_items.${itemIndex}.hs_code`, item.hscode || '')
  }

  return (
    <div className="max-w-full mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rate Calculator</h1>
          <p className="text-sm text-gray-600 mt-1">
            Calculate shipping rates by entering your shipment details
          </p>
        </div>
        <Icon icon="majesticons:calculator" width={32} className="text-primary" />
      </div>

      <form onSubmit={handleSubmit(onCalculateRates)} className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Icon icon="solar:location-linear" width={20} />
                Ship From Address
              </h3>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="flex justify-end mb-3">
                <Button
                  variant="bordered"
                  size="sm"
                  startContent={<Icon icon="solar:list-linear" width={16} />}
                  onPress={() => handleOpenAddressModal('ship_from')}
                >
                  Select from Address Book
                </Button>
              </div>
              <AddressForm
                control={control}
                errors={errors}
                prefix="ship_from"
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Icon icon="solar:location-linear" width={20} />
                Ship To Address
              </h3>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="flex justify-end mb-3">
                <Button
                  variant="bordered"
                  size="sm"
                  startContent={<Icon icon="solar:list-linear" width={16} />}
                  onPress={() => handleOpenAddressModal('ship_to')}
                >
                  Select from Address Book
                </Button>
              </div>
              <AddressForm
                control={control}
                errors={errors}
                prefix="ship_to"
              />
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon icon="solar:box-linear" width={20} />
              Parcels Information
            </h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <ParcelsForm
              register={register}
              control={control}
              errors={errors}
              watch={watch}
              setValue={setValue}
              getValues={getValues}
              onOpenBoxTypeModal={handleOpenBoxTypeModal}
              onOpenItemsModal={handleOpenItemsModal}
            />
          </CardBody>
        </Card>

        <div className="flex justify-center gap-4">
          <Button
            type="submit"
            color="primary"
            size="lg"
            isLoading={isCalculating}
            startContent={!isCalculating && <Icon icon="solar:calculator-linear" width={20} />}
            className="min-w-40"
          >
            {isCalculating ? 'Calculating...' : 'Calculate Rates'}
          </Button>

          {calculatedRates.length > 0 && (
            <Button
              type="button"
              variant="bordered"
              size="lg"
              onPress={handleClearRates}
              startContent={<Icon icon="solar:trash-bin-minimalistic-linear" width={20} />}
            >
              Clear Results
            </Button>
          )}
        </div>
      </form>

      {calculatedRates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon icon="solar:list-check-linear" width={20} />
              Available Shipping Rates ({calculatedRates.length})
            </h3>
          </CardHeader>
          <Divider />
          <CardBody className="p-0">
            <RatesTable rates={calculatedRates} />
          </CardBody>
        </Card>
      )}

      <ErrorModal
        isOpen={errorModal.isOpen}
        title={errorModal.title}
        message={errorModal.message}
        details={errorModal.details}
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '', details: [] })}
      />

      {/* Address Selection Modal */}
      <AddressSelectModal
        isOpen={addressModal.isOpen}
        onClose={() => setAddressModal({ ...addressModal, isOpen: false })}
        onSelect={handleSelectAddress}
        title={addressModal.title}
      />

      {/* Box Type Selection Modal */}
      <ParcelBoxTypeSelectModal
        isOpen={boxTypeModal.isOpen}
        onClose={() => setBoxTypeModal({ ...boxTypeModal, isOpen: false })}
        onSelect={handleSelectBoxType}
      />

      {/* Items Selection Modal */}
      <ItemsSelectModal
        isOpen={itemsModal.isOpen}
        onClose={() => setItemsModal({ ...itemsModal, isOpen: false })}
        onSelect={handleSelectItem}
      />
    </div>
  )
}

export default RateCalculator