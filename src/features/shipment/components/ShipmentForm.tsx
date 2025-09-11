import { useForm, useFieldArray } from 'react-hook-form'
import { useState } from 'react'
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Card,
  CardBody,
  CardHeader,
  Divider
} from '@heroui/react'
import { Icon } from '@iconify/react'
import axios from 'axios'
import { useAuth } from '@context/AuthContext'

interface ParcelItem {
  description: string
  quantity: number
  price_currency: string
  price_amount: number
  item_id: string
  origin_country: string
  weight_unit: string
  weight_value: number
  sku: string
  hs_code: string
  return_reason: string
}

interface Parcel {
  box_type: string
  box_type_name: string
  width: number
  height: number
  depth: number
  dimension_unit: string
  weight_value: number
  net_weight_value: number
  weight_unit: string
  description: string
  parcel_items: ParcelItem[]
}

interface Rate {
  shipper_account_id: string
  shipper_account_slug: string
  shipper_account_description: string
  service_type: string
  service_name: string
  pickup_deadline: string
  booking_cut_off: string
  delivery_date: string
  transit_time: string
  error_message: string
  info_message: string
  charge_weight_value: number
  charge_weight_unit: string
  total_charge_amount: number
  total_charge_currency: string
  chosen: boolean
  detailed_charges: string
}

interface ShipmentFormData {
  // Basic shipment info
  service_options: string
  urgent_reason: string
  request_status: string
  remark: string
  topic: string
  po_number: string
  other_topic: string
  due_date: string
  sales_person: string
  po_date: string
  
  // Ship to
  ship_to_country: string
  ship_to_contact_name: string
  ship_to_phone: string
  ship_to_fax: string
  ship_to_email: string
  ship_to_company_name: string
  ship_to_company_url: string
  ship_to_street1: string
  ship_to_street2: string
  ship_to_street3: string
  ship_to_city: string
  ship_to_state: string
  ship_to_postal_code: string
  ship_to_tax_id: string
  
  // Ship from
  ship_from_country: string
  ship_from_contact_name: string
  ship_from_phone: string
  ship_from_fax: string
  ship_from_email: string
  ship_from_company_name: string
  ship_from_company_url: string
  ship_from_street1: string
  ship_from_street2: string
  ship_from_street3: string
  ship_from_city: string
  ship_from_state: string
  ship_from_postal_code: string
  ship_from_tax_id: string
  
  // Dynamic arrays
  parcels: Parcel[]
  rates: Rate[]
  
  // Pickup info
  pick_up_status: boolean
  pick_up_date: string
  pick_up_start_time: string
  pick_up_end_time: string
  pick_up_instructions: string
  
  // Insurance
  insurance_enabled: boolean
  insurance_insured_value_amount: number
  insurance_insured_value_currency: string
  
  // Customs
  customs_purpose: string
  customs_terms_of_trade: string
}

const ShipmentForm = () => {
  const { user, approver } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<ShipmentFormData>({
    defaultValues: {
      request_status: 'draft',
      service_options: '',
      urgent_reason: '',
      remark: '',
      topic: '',
      po_number: '',
      other_topic: '',
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // tomorrow
      sales_person: '',
      po_date: new Date().toISOString().split('T')[0], // today
      
      // Ship from defaults
      ship_from_country: '',
      ship_from_contact_name: '',
      ship_from_phone: '',
      ship_from_fax: '',
      ship_from_email: '',
      ship_from_company_name: '',
      ship_from_company_url: '',
      ship_from_street1: '',
      ship_from_street2: '',
      ship_from_street3: '',
      ship_from_city: '',
      ship_from_state: '',
      ship_from_postal_code: '',
      ship_from_tax_id: '',
      
      // Ship to defaults
      ship_to_country: '',
      ship_to_contact_name: '',
      ship_to_phone: '',
      ship_to_fax: '',
      ship_to_email: '',
      ship_to_company_name: '',
      ship_to_company_url: '',
      ship_to_street1: '',
      ship_to_street2: '',
      ship_to_street3: '',
      ship_to_city: '',
      ship_to_state: '',
      ship_to_postal_code: '',
      ship_to_tax_id: '',
      
      // Customs
      customs_purpose: '',
      customs_terms_of_trade: '',
      
      parcels: [{
        box_type: '',
        box_type_name: '',
        width: 0,
        height: 0,
        depth: 0,
        dimension_unit: 'cm',
        weight_value: 0,
        net_weight_value: 0,
        weight_unit: 'kg',
        description: '',
        parcel_items: [{
          description: '',
          quantity: 1,
          price_currency: 'USD',
          price_amount: 0,
          item_id: '',
          origin_country: '',
          weight_unit: 'kg',
          weight_value: 0,
          sku: '',
          hs_code: '',
          return_reason: ''
        }]
      }],
      rates: [{
        shipper_account_id: '',
        shipper_account_slug: '',
        shipper_account_description: '',
        service_type: '',
        service_name: '',
        pickup_deadline: new Date().toISOString().split('T')[0],
        booking_cut_off: new Date().toISOString().split('T')[0],
        delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // week from now
        transit_time: '',
        error_message: '',
        info_message: '',
        charge_weight_value: 0,
        charge_weight_unit: 'kg',
        total_charge_amount: 0,
        total_charge_currency: 'USD',
        chosen: false,
        detailed_charges: ''
      }],
      pick_up_status: false,
      pick_up_date: new Date().toISOString().split('T')[0],
      pick_up_start_time: '09:00',
      pick_up_end_time: '17:00',
      pick_up_instructions: '',
      insurance_enabled: false,
      insurance_insured_value_amount: 0,
      insurance_insured_value_currency: 'USD'
    }
  })
  
  const { fields: parcelFields, append: appendParcel, remove: removeParcel } = useFieldArray({
    control,
    name: 'parcels'
  })

  const watchPickupStatus = watch('pick_up_status')
  const watchInsuranceEnabled = watch('insurance_enabled')

  const onSubmit = async (data: ShipmentFormData) => {
    if (!user || !approver) {
      alert('User authentication required')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = {
        ...data,
        // Auto-bind from auth context
        created_user_id: user.userID,
        created_user_name: user.firstName + ' ' + user.lastName,
        created_user_mail: user.email,
        approver_user_id: approver.userID,
        approver_user_name: approver.firstName + ' ' + approver.lastName,
        approver_user_mail: approver.email
      }

      const response = await axios.post(
        import.meta.env.VITE_APP_ADD_NEW_SHIPMENT_REQUEST,
        formData
      )

      if (response.status === 200) {
        alert('Shipment request created successfully!')
        // Reset form or redirect
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Error submitting shipment request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="mx-auto w-full">
      <Card className="w-full">
        {/* <CardHeader>
          <h1 className="text-2xl font-bold">New Shipment Request</h1>
        </CardHeader> */}
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Basic Shipment Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Basic Information</h2>
              </CardHeader>
              <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  {...register('service_options', { required: 'Service options is required' })}
                  label="Service Options"
                  placeholder="Enter service options"
                  errorMessage={errors.service_options?.message}
                  isInvalid={!!errors.service_options}
                />
                
                <Input
                  {...register('urgent_reason', { required: 'Urgent reason is required' })}
                  label="Urgent Reason"
                  placeholder="Enter urgent reason"
                  errorMessage={errors.urgent_reason?.message}
                  isInvalid={!!errors.urgent_reason}
                />
                
                <Textarea
                  {...register('remark', { required: 'Remark is required' })}
                  label="Remark"
                  placeholder="Enter remark"
                  errorMessage={errors.remark?.message}
                  isInvalid={!!errors.remark}
                />
                
                <Input
                  {...register('topic', { required: 'Topic is required' })}
                  label="Topic"
                  placeholder="Enter topic"
                  errorMessage={errors.topic?.message}
                  isInvalid={!!errors.topic}
                />
                
                <Input
                  {...register('po_number', { required: 'PO Number is required' })}
                  label="PO Number"
                  placeholder="Enter PO number"
                  errorMessage={errors.po_number?.message}
                  isInvalid={!!errors.po_number}
                />
                
                <Input
                  {...register('other_topic', { required: 'Other topic is required' })}
                  label="Other Topic"
                  placeholder="Enter other topic"
                  errorMessage={errors.other_topic?.message}
                  isInvalid={!!errors.other_topic}
                />
                
                <Input
                  {...register('due_date', { 
                    required: 'Due date is required',
                    validate: (value) => {
                      return value >= today || 'Due date cannot be earlier than today'
                    }
                  })}
                  type="date"
                  label="Due Date"
                  min={today}
                  errorMessage={errors.due_date?.message}
                  isInvalid={!!errors.due_date}
                />
                
                <Select
                  {...register('sales_person', { required: 'Sales person is required' })}
                  label="Sales Person"
                  placeholder="Select sales person"
                  errorMessage={errors.sales_person?.message}
                  isInvalid={!!errors.sales_person}
                >
                  <SelectItem key="personA" value="Person A">Person A</SelectItem>
                  <SelectItem key="personB" value="Person B">Person B</SelectItem>
                  <SelectItem key="personC" value="Person C">Person C</SelectItem>
                </Select>
                
                <Input
                  {...register('po_date', { required: 'PO Date is required' })}
                  type="date"
                  label="PO Date"
                  errorMessage={errors.po_date?.message}
                  isInvalid={!!errors.po_date}
                />
              </CardBody>
            </Card>

            <Divider />

            {/* Ship From Address */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Ship From Address</h2>
              </CardHeader>
              <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  {...register('ship_from_country', { required: 'Ship from country is required' })}
                  label="Country"
                  placeholder="Enter country"
                  errorMessage={errors.ship_from_country?.message}
                  isInvalid={!!errors.ship_from_country}
                />
                <Input
                  {...register('ship_from_contact_name', { required: 'Contact name is required' })}
                  label="Contact Name"
                  placeholder="Enter contact name"
                  errorMessage={errors.ship_from_contact_name?.message}
                  isInvalid={!!errors.ship_from_contact_name}
                />
                <Input
                  {...register('ship_from_phone', { required: 'Phone is required' })}
                  label="Phone"
                  placeholder="Enter phone"
                  errorMessage={errors.ship_from_phone?.message}
                  isInvalid={!!errors.ship_from_phone}
                />
                <Input
                  {...register('ship_from_fax', { required: 'Fax is required' })}
                  label="Fax"
                  placeholder="Enter fax"
                  errorMessage={errors.ship_from_fax?.message}
                  isInvalid={!!errors.ship_from_fax}
                />
                <Input
                  {...register('ship_from_email', { required: 'Email is required' })}
                  type="email"
                  label="Email"
                  placeholder="Enter email"
                  errorMessage={errors.ship_from_email?.message}
                  isInvalid={!!errors.ship_from_email}
                />
                <Input
                  {...register('ship_from_company_name', { required: 'Company name is required' })}
                  label="Company Name"
                  placeholder="Enter company name"
                  errorMessage={errors.ship_from_company_name?.message}
                  isInvalid={!!errors.ship_from_company_name}
                />
                <Input
                  {...register('ship_from_company_url', { required: 'Company URL is required' })}
                  label="Company URL"
                  placeholder="Enter company URL"
                  errorMessage={errors.ship_from_company_url?.message}
                  isInvalid={!!errors.ship_from_company_url}
                />
                <Input
                  {...register('ship_from_street1', { required: 'Street 1 is required' })}
                  label="Street 1"
                  placeholder="Enter street address"
                  errorMessage={errors.ship_from_street1?.message}
                  isInvalid={!!errors.ship_from_street1}
                />
                <Input
                  {...register('ship_from_street2', { required: 'Street 2 is required' })}
                  label="Street 2"
                  placeholder="Enter street address"
                  errorMessage={errors.ship_from_street2?.message}
                  isInvalid={!!errors.ship_from_street2}
                />
                <Input
                  {...register('ship_from_street3', { required: 'Street 3 is required' })}
                  label="Street 3"
                  placeholder="Enter street address"
                  errorMessage={errors.ship_from_street3?.message}
                  isInvalid={!!errors.ship_from_street3}
                />
                <Input
                  {...register('ship_from_city', { required: 'City is required' })}
                  label="City"
                  placeholder="Enter city"
                  errorMessage={errors.ship_from_city?.message}
                  isInvalid={!!errors.ship_from_city}
                />
                <Input
                  {...register('ship_from_state', { required: 'State is required' })}
                  label="State"
                  placeholder="Enter state"
                  errorMessage={errors.ship_from_state?.message}
                  isInvalid={!!errors.ship_from_state}
                />
                <Input
                  {...register('ship_from_postal_code', { required: 'Postal code is required' })}
                  label="Postal Code"
                  placeholder="Enter postal code"
                  errorMessage={errors.ship_from_postal_code?.message}
                  isInvalid={!!errors.ship_from_postal_code}
                />
                <Input
                  {...register('ship_from_tax_id', { required: 'Tax ID is required' })}
                  label="Tax ID"
                  placeholder="Enter tax ID"
                  errorMessage={errors.ship_from_tax_id?.message}
                  isInvalid={!!errors.ship_from_tax_id}
                />
              </CardBody>
            </Card>

            {/* Ship To Address */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Ship To Address</h2>
              </CardHeader>
              <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  {...register('ship_to_country', { required: 'Ship to country is required' })}
                  label="Country"
                  placeholder="Enter country"
                  errorMessage={errors.ship_to_country?.message}
                  isInvalid={!!errors.ship_to_country}
                />
                <Input
                  {...register('ship_to_contact_name', { required: 'Contact name is required' })}
                  label="Contact Name"
                  placeholder="Enter contact name"
                  errorMessage={errors.ship_to_contact_name?.message}
                  isInvalid={!!errors.ship_to_contact_name}
                />
                <Input
                  {...register('ship_to_phone', { required: 'Phone is required' })}
                  label="Phone"
                  placeholder="Enter phone"
                  errorMessage={errors.ship_to_phone?.message}
                  isInvalid={!!errors.ship_to_phone}
                />
                <Input
                  {...register('ship_to_fax', { required: 'Fax is required' })}
                  label="Fax"
                  placeholder="Enter fax"
                  errorMessage={errors.ship_to_fax?.message}
                  isInvalid={!!errors.ship_to_fax}
                />
                <Input
                  {...register('ship_to_email', { required: 'Email is required' })}
                  type="email"
                  label="Email"
                  placeholder="Enter email"
                  errorMessage={errors.ship_to_email?.message}
                  isInvalid={!!errors.ship_to_email}
                />
                <Input
                  {...register('ship_to_company_name', { required: 'Company name is required' })}
                  label="Company Name"
                  placeholder="Enter company name"
                  errorMessage={errors.ship_to_company_name?.message}
                  isInvalid={!!errors.ship_to_company_name}
                />
                <Input
                  {...register('ship_to_company_url', { required: 'Company URL is required' })}
                  label="Company URL"
                  placeholder="Enter company URL"
                  errorMessage={errors.ship_to_company_url?.message}
                  isInvalid={!!errors.ship_to_company_url}
                />
                <Input
                  {...register('ship_to_street1', { required: 'Street 1 is required' })}
                  label="Street 1"
                  placeholder="Enter street address"
                  errorMessage={errors.ship_to_street1?.message}
                  isInvalid={!!errors.ship_to_street1}
                />
                <Input
                  {...register('ship_to_street2', { required: 'Street 2 is required' })}
                  label="Street 2"
                  placeholder="Enter street address"
                  errorMessage={errors.ship_to_street2?.message}
                  isInvalid={!!errors.ship_to_street2}
                />
                <Input
                  {...register('ship_to_street3', { required: 'Street 3 is required' })}
                  label="Street 3"
                  placeholder="Enter street address"
                  errorMessage={errors.ship_to_street3?.message}
                  isInvalid={!!errors.ship_to_street3}
                />
                <Input
                  {...register('ship_to_city', { required: 'City is required' })}
                  label="City"
                  placeholder="Enter city"
                  errorMessage={errors.ship_to_city?.message}
                  isInvalid={!!errors.ship_to_city}
                />
                <Input
                  {...register('ship_to_state', { required: 'State is required' })}
                  label="State"
                  placeholder="Enter state"
                  errorMessage={errors.ship_to_state?.message}
                  isInvalid={!!errors.ship_to_state}
                />
                <Input
                  {...register('ship_to_postal_code', { required: 'Postal code is required' })}
                  label="Postal Code"
                  placeholder="Enter postal code"
                  errorMessage={errors.ship_to_postal_code?.message}
                  isInvalid={!!errors.ship_to_postal_code}
                />
                <Input
                  {...register('ship_to_tax_id', { required: 'Tax ID is required' })}
                  label="Tax ID"
                  placeholder="Enter tax ID"
                  errorMessage={errors.ship_to_tax_id?.message}
                  isInvalid={!!errors.ship_to_tax_id}
                />
              </CardBody>
            </Card>

            {/* Customs Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Customs Information</h2>
              </CardHeader>
              <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  {...register('customs_purpose', { required: 'Customs purpose is required' })}
                  label="Customs Purpose"
                  placeholder="Enter customs purpose"
                  errorMessage={errors.customs_purpose?.message}
                  isInvalid={!!errors.customs_purpose}
                />
                <Input
                  {...register('customs_terms_of_trade', { required: 'Terms of trade is required' })}
                  label="Terms of Trade"
                  placeholder="Enter terms of trade"
                  errorMessage={errors.customs_terms_of_trade?.message}
                  isInvalid={!!errors.customs_terms_of_trade}
                />
              </CardBody>
            </Card>

            {/* Pickup Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Pickup Information</h2>
              </CardHeader>
              <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      {...register('pick_up_status')}
                      type="checkbox"
                      className="rounded"
                    />
                    <span>Pickup Required</span>
                  </label>
                </div>
                
                {watchPickupStatus && (
                  <>
                    <Input
                      {...register('pick_up_date', { required: watchPickupStatus ? 'Pickup date is required' : false })}
                      type="date"
                      label="Pickup Date"
                      errorMessage={errors.pick_up_date?.message}
                      isInvalid={!!errors.pick_up_date}
                    />
                    <Input
                      {...register('pick_up_start_time', { required: watchPickupStatus ? 'Start time is required' : false })}
                      type="time"
                      label="Start Time"
                      errorMessage={errors.pick_up_start_time?.message}
                      isInvalid={!!errors.pick_up_start_time}
                    />
                    <Input
                      {...register('pick_up_end_time', { required: watchPickupStatus ? 'End time is required' : false })}
                      type="time"
                      label="End Time"
                      errorMessage={errors.pick_up_end_time?.message}
                      isInvalid={!!errors.pick_up_end_time}
                    />
                    <Textarea
                      {...register('pick_up_instructions', { required: watchPickupStatus ? 'Instructions are required' : false })}
                      label="Pickup Instructions"
                      placeholder="Enter pickup instructions"
                      errorMessage={errors.pick_up_instructions?.message}
                      isInvalid={!!errors.pick_up_instructions}
                    />
                  </>
                )}
              </CardBody>
            </Card>

            {/* Insurance Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Insurance Information</h2>
              </CardHeader>
              <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      {...register('insurance_enabled')}
                      type="checkbox"
                      className="rounded"
                    />
                    <span>Insurance Required</span>
                  </label>
                </div>
                
                {watchInsuranceEnabled && (
                  <>
                    <Input
                      {...register('insurance_insured_value_amount', { 
                        required: watchInsuranceEnabled ? 'Insurance amount is required' : false,
                        min: 0
                      })}
                      type="number"
                      step="0.01"
                      label="Insured Value Amount"
                      placeholder="Enter amount"
                      errorMessage={errors.insurance_insured_value_amount?.message}
                      isInvalid={!!errors.insurance_insured_value_amount}
                    />
                    <Input
                      {...register('insurance_insured_value_currency', { required: watchInsuranceEnabled ? 'Currency is required' : false })}
                      label="Currency"
                      placeholder="USD"
                      defaultValue="USD"
                      errorMessage={errors.insurance_insured_value_currency?.message}
                      isInvalid={!!errors.insurance_insured_value_currency}
                    />
                  </>
                )}
              </CardBody>
            </Card>

            {/* Parcels and Items */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center w-full">
                  <h2 className="text-xl font-semibold">Parcels and Items</h2>
                  <Button
                    type="button"
                    color="primary"
                    size="sm"
                    startContent={<Icon icon="solar:add-circle-bold" />}
                    onPress={() => appendParcel({
                      box_type: '',
                      box_type_name: '',
                      width: 0,
                      height: 0,
                      depth: 0,
                      dimension_unit: 'cm',
                      weight_value: 0,
                      net_weight_value: 0,
                      weight_unit: 'kg',
                      description: '',
                      parcel_items: [{
                        description: '',
                        quantity: 1,
                        price_currency: 'USD',
                        price_amount: 0,
                        item_id: '',
                        origin_country: '',
                        weight_unit: 'kg',
                        weight_value: 0,
                        sku: '',
                        hs_code: '',
                        return_reason: ''
                      }]
                    })}
                  >
                    Add Parcel
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                {parcelFields.map((parcel, parcelIndex) => (
                  <Card key={parcel.id} className="border">
                    <CardHeader>
                      <div className="flex justify-between items-center w-full">
                        <h3 className="text-lg font-medium">Parcel {parcelIndex + 1}</h3>
                        {parcelFields.length > 1 && (
                          <Button
                            type="button"
                            color="danger"
                            size="sm"
                            variant="light"
                            startContent={<Icon icon="solar:trash-bin-minimalistic-bold" />}
                            onPress={() => removeParcel(parcelIndex)}
                          >
                            Remove Parcel
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardBody>
                      {/* Parcel Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Input
                          {...register(`parcels.${parcelIndex}.box_type`, { required: 'Box type is required' })}
                          label="Box Type"
                          placeholder="Enter box type"
                          errorMessage={errors.parcels?.[parcelIndex]?.box_type?.message}
                          isInvalid={!!errors.parcels?.[parcelIndex]?.box_type}
                        />
                        <Input
                          {...register(`parcels.${parcelIndex}.box_type_name`, { required: 'Box type name is required' })}
                          label="Box Type Name"
                          placeholder="Enter box type name"
                          errorMessage={errors.parcels?.[parcelIndex]?.box_type_name?.message}
                          isInvalid={!!errors.parcels?.[parcelIndex]?.box_type_name}
                        />
                        <Input
                          {...register(`parcels.${parcelIndex}.width`, { required: 'Width is required', min: 0 })}
                          type="number"
                          step="0.01"
                          label="Width"
                          placeholder="Enter width"
                          errorMessage={errors.parcels?.[parcelIndex]?.width?.message}
                          isInvalid={!!errors.parcels?.[parcelIndex]?.width}
                        />
                        <Input
                          {...register(`parcels.${parcelIndex}.height`, { required: 'Height is required', min: 0 })}
                          type="number"
                          step="0.01"
                          label="Height"
                          placeholder="Enter height"
                          errorMessage={errors.parcels?.[parcelIndex]?.height?.message}
                          isInvalid={!!errors.parcels?.[parcelIndex]?.height}
                        />
                        <Input
                          {...register(`parcels.${parcelIndex}.depth`, { required: 'Depth is required', min: 0 })}
                          type="number"
                          step="0.01"
                          label="Depth"
                          placeholder="Enter depth"
                          errorMessage={errors.parcels?.[parcelIndex]?.depth?.message}
                          isInvalid={!!errors.parcels?.[parcelIndex]?.depth}
                        />
                        <Select
                          {...register(`parcels.${parcelIndex}.dimension_unit`, { required: 'Dimension unit is required' })}
                          label="Dimension Unit"
                          defaultSelectedKeys={['cm']}
                          errorMessage={errors.parcels?.[parcelIndex]?.dimension_unit?.message}
                          isInvalid={!!errors.parcels?.[parcelIndex]?.dimension_unit}
                        >
                          <SelectItem key="cm" value="cm">cm</SelectItem>
                          <SelectItem key="in" value="in">in</SelectItem>
                          <SelectItem key="mm" value="mm">mm</SelectItem>
                        </Select>
                        <Input
                          {...register(`parcels.${parcelIndex}.weight_value`, { required: 'Weight is required', min: 0 })}
                          type="number"
                          step="0.01"
                          label="Weight Value"
                          placeholder="Enter weight"
                          errorMessage={errors.parcels?.[parcelIndex]?.weight_value?.message}
                          isInvalid={!!errors.parcels?.[parcelIndex]?.weight_value}
                        />
                        <Input
                          {...register(`parcels.${parcelIndex}.net_weight_value`, { required: 'Net weight is required', min: 0 })}
                          type="number"
                          step="0.01"
                          label="Net Weight Value"
                          placeholder="Enter net weight"
                          errorMessage={errors.parcels?.[parcelIndex]?.net_weight_value?.message}
                          isInvalid={!!errors.parcels?.[parcelIndex]?.net_weight_value}
                        />
                        <Select
                          {...register(`parcels.${parcelIndex}.weight_unit`, { required: 'Weight unit is required' })}
                          label="Weight Unit"
                          defaultSelectedKeys={['kg']}
                          errorMessage={errors.parcels?.[parcelIndex]?.weight_unit?.message}
                          isInvalid={!!errors.parcels?.[parcelIndex]?.weight_unit}
                        >
                          <SelectItem key="kg" value="kg">kg</SelectItem>
                          <SelectItem key="lb" value="lb">lb</SelectItem>
                          <SelectItem key="g" value="g">g</SelectItem>
                        </Select>
                        <div className="md:col-span-2">
                          <Textarea
                            {...register(`parcels.${parcelIndex}.description`, { required: 'Description is required' })}
                            label="Parcel Description"
                            placeholder="Enter parcel description"
                            errorMessage={errors.parcels?.[parcelIndex]?.description?.message}
                            isInvalid={!!errors.parcels?.[parcelIndex]?.description}
                          />
                        </div>
                      </div>

                      {/* Parcel Items */}
                      <ParcelItems parcelIndex={parcelIndex} control={control} register={register} errors={errors} />
                    </CardBody>
                  </Card>
                ))}
              </CardBody>
            </Card>

            <div className="flex justify-end gap-4">
              <Button variant="bordered" type="button">
                Cancel
              </Button>
              <Button 
                color="primary" 
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Shipment Request'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

// ParcelItems Component for nested arrays
interface ParcelItemsProps {
  parcelIndex: number
  control: any
  register: any
  errors: any
}

const ParcelItems = ({ parcelIndex, control, register, errors }: ParcelItemsProps) => {
  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control,
    name: `parcels.${parcelIndex}.parcel_items`
  })

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
          onPress={() => appendItem({
            description: '',
            quantity: 1,
            price_currency: 'USD',
            price_amount: 0,
            item_id: '',
            origin_country: '',
            weight_unit: 'kg',
            weight_value: 0,
            sku: '',
            hs_code: '',
            return_reason: ''
          })}
        >
          Add Item
        </Button>
      </div>

      <div className="space-y-4">
        {itemFields.map((item, itemIndex) => (
          <Card key={item.id} className="border-dashed">
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <h5 className="text-sm font-medium">Item {itemIndex + 1}</h5>
                {itemFields.length > 1 && (
                  <Button
                    type="button"
                    color="danger"
                    size="sm"
                    variant="light"
                    isIconOnly
                    onPress={() => removeItem(itemIndex)}
                  >
                    <Icon icon="solar:trash-bin-minimalistic-bold" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Textarea
                  {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.description`, { required: 'Item description is required' })}
                  label="Item Description"
                  placeholder="Enter item description"
                  rows={2}
                  errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.description?.message}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.description}
                />
                
                <Input
                  {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.quantity`, { required: 'Quantity is required', min: 1 })}
                  type="number"
                  label="Quantity"
                  placeholder="Enter quantity"
                  errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.quantity?.message}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.quantity}
                />
                
                <div className="flex gap-2">
                  <Input
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.price_amount`, { required: 'Price is required', min: 0 })}
                    type="number"
                    step="0.01"
                    label="Price Amount"
                    placeholder="0.00"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.price_amount?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.price_amount}
                  />
                  <Select
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.price_currency`, { required: 'Currency is required' })}
                    label="Currency"
                    defaultSelectedKeys={['USD']}
                    className="w-24"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.price_currency?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.price_currency}
                  >
                    <SelectItem key="USD" value="USD">USD</SelectItem>
                    <SelectItem key="EUR" value="EUR">EUR</SelectItem>
                    <SelectItem key="THB" value="THB">THB</SelectItem>
                  </Select>
                </div>
                
                <Input
                  {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.item_id`, { required: 'Item ID is required' })}
                  label="Item ID"
                  placeholder="Enter item ID"
                  errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.item_id?.message}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.item_id}
                />
                
                <Input
                  {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.origin_country`, { required: 'Origin country is required' })}
                  label="Origin Country"
                  placeholder="Enter origin country"
                  errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.origin_country?.message}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.origin_country}
                />
                
                <div className="flex gap-2">
                  <Input
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.weight_value`, { required: 'Weight is required', min: 0 })}
                    type="number"
                    step="0.01"
                    label="Weight Value"
                    placeholder="0.00"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.weight_value?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.weight_value}
                  />
                  <Select
                    {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.weight_unit`, { required: 'Weight unit is required' })}
                    label="Unit"
                    defaultSelectedKeys={['kg']}
                    className="w-20"
                    errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.weight_unit?.message}
                    isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.weight_unit}
                  >
                    <SelectItem key="kg" value="kg">kg</SelectItem>
                    <SelectItem key="g" value="g">g</SelectItem>
                    <SelectItem key="lb" value="lb">lb</SelectItem>
                  </Select>
                </div>
                
                <Input
                  {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.sku`, { required: 'SKU is required' })}
                  label="SKU"
                  placeholder="Enter SKU"
                  errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.sku?.message}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.sku}
                />
                
                <Input
                  {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.hs_code`, { required: 'HS Code is required' })}
                  label="HS Code"
                  placeholder="Enter HS code"
                  errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.hs_code?.message}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.hs_code}
                />
                
                <Input
                  {...register(`parcels.${parcelIndex}.parcel_items.${itemIndex}.return_reason`, { required: 'Return reason is required' })}
                  label="Return Reason"
                  placeholder="Enter return reason"
                  errorMessage={errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.return_reason?.message}
                  isInvalid={!!errors.parcels?.[parcelIndex]?.parcel_items?.[itemIndex]?.return_reason}
                />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ShipmentForm