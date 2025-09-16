import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Select,
  SelectItem,
  Textarea,
  Button,
  Switch,
  Divider,
  Tab,
  Tabs
} from '@heroui/react'
import { Icon } from '@iconify/react'
import { useForm } from 'react-hook-form'
import type { RateCalculatorFormData } from '../types'
import { COUNTRIES } from '@pages/shipment/constants/countries'
import { PARCEL_BOX_TYPES } from '@pages/shipment/constants/parcel_box_types'

interface RateCalculatorFormProps {
  onSubmit: (data: RateCalculatorFormData) => void
  isLoading: boolean
}

const RateCalculatorForm = ({ onSubmit, isLoading }: RateCalculatorFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RateCalculatorFormData>({
    defaultValues: {
      dimension_unit: 'cm',
      parcel_weight_unit: 'kg',
      item_weight_unit: 'kg',
      item_price_currency: 'USD',
      include_return_address: false,
      box_type: 'custom'
    }
  })

  const includeReturnAddress = watch('include_return_address')

  const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY']

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Address Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="solar:map-point-bold" className="text-primary" width={24} />
            <h2 className="text-xl font-semibold">Address Information</h2>
          </div>
        </CardHeader>
        <CardBody>
          <Tabs aria-label="Address tabs" color="primary" variant="underlined">
            <Tab key="ship_from" title="Ship From">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                <Input
                  {...register('ship_from_contact_name', { required: 'Contact name is required' })}
                  label="Contact Name"
                  placeholder="Enter contact name"
                  errorMessage={errors.ship_from_contact_name?.message}
                  isInvalid={!!errors.ship_from_contact_name}
                />
                <Input
                  {...register('ship_from_company_name', { required: 'Company name is required' })}
                  label="Company Name"
                  placeholder="Enter company name"
                  errorMessage={errors.ship_from_company_name?.message}
                  isInvalid={!!errors.ship_from_company_name}
                />
                <Input
                  {...register('ship_from_phone', { required: 'Phone is required' })}
                  label="Phone"
                  placeholder="Enter phone number"
                  errorMessage={errors.ship_from_phone?.message}
                  isInvalid={!!errors.ship_from_phone}
                />
                <Input
                  {...register('ship_from_email', { required: 'Email is required' })}
                  type="email"
                  label="Email"
                  placeholder="Enter email address"
                  errorMessage={errors.ship_from_email?.message}
                  isInvalid={!!errors.ship_from_email}
                />
                <Select
                  {...register('ship_from_country', { required: 'Country is required' })}
                  label="Country"
                  placeholder="Select country"
                  errorMessage={errors.ship_from_country?.message}
                  isInvalid={!!errors.ship_from_country}
                >
                  {COUNTRIES.map((option) => (
                    <SelectItem key={option.key} value={option.value}>
                      {option.value}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  {...register('ship_from_state', { required: 'State is required' })}
                  label="State/Province"
                  placeholder="Enter state or province"
                  errorMessage={errors.ship_from_state?.message}
                  isInvalid={!!errors.ship_from_state}
                />
                <Input
                  {...register('ship_from_city', { required: 'City is required' })}
                  label="City"
                  placeholder="Enter city"
                  errorMessage={errors.ship_from_city?.message}
                  isInvalid={!!errors.ship_from_city}
                />
                <Input
                  {...register('ship_from_postal_code', { required: 'Postal code is required' })}
                  label="Postal Code"
                  placeholder="Enter postal code"
                  errorMessage={errors.ship_from_postal_code?.message}
                  isInvalid={!!errors.ship_from_postal_code}
                />
                <Textarea
                  {...register('ship_from_street1', { required: 'Street address is required' })}
                  label="Street Address 1"
                  placeholder="Enter street address"
                  errorMessage={errors.ship_from_street1?.message}
                  isInvalid={!!errors.ship_from_street1}
                  className="md:col-span-2"
                />
                <Textarea
                  {...register('ship_from_street2')}
                  label="Street Address 2 (Optional)"
                  placeholder="Enter additional address info"
                />
              </div>
            </Tab>
            <Tab key="ship_to" title="Ship To">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                <Input
                  {...register('ship_to_contact_name', { required: 'Contact name is required' })}
                  label="Contact Name"
                  placeholder="Enter contact name"
                  errorMessage={errors.ship_to_contact_name?.message}
                  isInvalid={!!errors.ship_to_contact_name}
                />
                <Input
                  {...register('ship_to_company_name', { required: 'Company name is required' })}
                  label="Company Name"
                  placeholder="Enter company name"
                  errorMessage={errors.ship_to_company_name?.message}
                  isInvalid={!!errors.ship_to_company_name}
                />
                <Input
                  {...register('ship_to_phone', { required: 'Phone is required' })}
                  label="Phone"
                  placeholder="Enter phone number"
                  errorMessage={errors.ship_to_phone?.message}
                  isInvalid={!!errors.ship_to_phone}
                />
                <Input
                  {...register('ship_to_email', { required: 'Email is required' })}
                  type="email"
                  label="Email"
                  placeholder="Enter email address"
                  errorMessage={errors.ship_to_email?.message}
                  isInvalid={!!errors.ship_to_email}
                />
                <Select
                  {...register('ship_to_country', { required: 'Country is required' })}
                  label="Country"
                  placeholder="Select country"
                  errorMessage={errors.ship_to_country?.message}
                  isInvalid={!!errors.ship_to_country}
                >
                  {COUNTRIES.map((option) => (
                    <SelectItem key={option.key} value={option.value}>
                      {option.value}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  {...register('ship_to_state', { required: 'State is required' })}
                  label="State/Province"
                  placeholder="Enter state or province"
                  errorMessage={errors.ship_to_state?.message}
                  isInvalid={!!errors.ship_to_state}
                />
                <Input
                  {...register('ship_to_city', { required: 'City is required' })}
                  label="City"
                  placeholder="Enter city"
                  errorMessage={errors.ship_to_city?.message}
                  isInvalid={!!errors.ship_to_city}
                />
                <Input
                  {...register('ship_to_postal_code', { required: 'Postal code is required' })}
                  label="Postal Code"
                  placeholder="Enter postal code"
                  errorMessage={errors.ship_to_postal_code?.message}
                  isInvalid={!!errors.ship_to_postal_code}
                />
                <Textarea
                  {...register('ship_to_street1', { required: 'Street address is required' })}
                  label="Street Address 1"
                  placeholder="Enter street address"
                  errorMessage={errors.ship_to_street1?.message}
                  isInvalid={!!errors.ship_to_street1}
                  className="md:col-span-2"
                />
                <Textarea
                  {...register('ship_to_street2')}
                  label="Street Address 2 (Optional)"
                  placeholder="Enter additional address info"
                />
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

      {/* Package Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="solar:box-bold" className="text-secondary" width={24} />
            <h2 className="text-xl font-semibold">Package Information</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* Package Details */}
          <div>
            <h3 className="text-lg font-medium mb-4">Package Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                {...register('box_type', { required: 'Box type is required' })}
                label="Box Type"
                placeholder="Select box type"
                errorMessage={errors.box_type?.message}
                isInvalid={!!errors.box_type}
              >
                {PARCEL_BOX_TYPES.map((boxType) => (
                  <SelectItem key={boxType.id} value={boxType.id.toString()}>
                    {boxType.box_type_name}
                  </SelectItem>
                ))}
              </Select>
              <Textarea
                {...register('parcel_description', { required: 'Description is required' })}
                label="Package Description"
                placeholder="Describe the package"
                errorMessage={errors.parcel_description?.message}
                isInvalid={!!errors.parcel_description}
                className="md:col-span-3"
                minRows={1}
              />
            </div>
          </div>

          <Divider />

          {/* Dimensions */}
          <div>
            <h3 className="text-lg font-medium mb-4">Dimensions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                {...register('dimension_width', {
                  required: 'Width is required',
                  min: { value: 0.1, message: 'Width must be greater than 0' }
                })}
                type="number"
                step="0.1"
                label="Width"
                placeholder="0.0"
                errorMessage={errors.dimension_width?.message}
                isInvalid={!!errors.dimension_width}
              />
              <Input
                {...register('dimension_height', {
                  required: 'Height is required',
                  min: { value: 0.1, message: 'Height must be greater than 0' }
                })}
                type="number"
                step="0.1"
                label="Height"
                placeholder="0.0"
                errorMessage={errors.dimension_height?.message}
                isInvalid={!!errors.dimension_height}
              />
              <Input
                {...register('dimension_depth', {
                  required: 'Depth is required',
                  min: { value: 0.1, message: 'Depth must be greater than 0' }
                })}
                type="number"
                step="0.1"
                label="Depth"
                placeholder="0.0"
                errorMessage={errors.dimension_depth?.message}
                isInvalid={!!errors.dimension_depth}
              />
              <Select
                {...register('dimension_unit')}
                label="Unit"
                defaultSelectedKeys={['cm']}
              >
                <SelectItem key="cm" value="cm">cm</SelectItem>
                <SelectItem key="in" value="in">in</SelectItem>
              </Select>
            </div>
          </div>

          <Divider />

          {/* Weight */}
          <div>
            <h3 className="text-lg font-medium mb-4">Package Weight</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('parcel_weight_value', {
                  required: 'Weight is required',
                  min: { value: 0.01, message: 'Weight must be greater than 0' }
                })}
                type="number"
                step="0.01"
                label="Total Package Weight"
                placeholder="0.00"
                errorMessage={errors.parcel_weight_value?.message}
                isInvalid={!!errors.parcel_weight_value}
              />
              <Select
                {...register('parcel_weight_unit')}
                label="Weight Unit"
                defaultSelectedKeys={['kg']}
              >
                <SelectItem key="kg" value="kg">kg</SelectItem>
                <SelectItem key="lb" value="lb">lb</SelectItem>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Item Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="solar:tag-bold" className="text-warning" width={24} />
            <h2 className="text-xl font-semibold">Item Information</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              {...register('item_description', { required: 'Item description is required' })}
              label="Item Description"
              placeholder="Enter item description"
              errorMessage={errors.item_description?.message}
              isInvalid={!!errors.item_description}
            />
            <Input
              {...register('item_id', { required: 'Item ID is required' })}
              label="Item ID"
              placeholder="Enter item ID"
              errorMessage={errors.item_id?.message}
              isInvalid={!!errors.item_id}
            />
            <Input
              {...register('item_quantity', {
                required: 'Quantity is required',
                min: { value: 1, message: 'Quantity must be at least 1' }
              })}
              type="number"
              label="Quantity"
              placeholder="1"
              errorMessage={errors.item_quantity?.message}
              isInvalid={!!errors.item_quantity}
            />
            <Input
              {...register('item_price_amount', {
                required: 'Price is required',
                min: { value: 0.01, message: 'Price must be greater than 0' }
              })}
              type="number"
              step="0.01"
              label="Unit Price"
              placeholder="0.00"
              errorMessage={errors.item_price_amount?.message}
              isInvalid={!!errors.item_price_amount}
            />
            <Select
              {...register('item_price_currency')}
              label="Currency"
              defaultSelectedKeys={['USD']}
            >
              {CURRENCY_OPTIONS.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </Select>
            <Select
              {...register('item_origin_country', { required: 'Origin country is required' })}
              label="Origin Country"
              placeholder="Select origin country"
              errorMessage={errors.item_origin_country?.message}
              isInvalid={!!errors.item_origin_country}
            >
              {COUNTRIES.map((option) => (
                <SelectItem key={option.key} value={option.value}>
                  {option.value}
                </SelectItem>
              ))}
            </Select>
            <Input
              {...register('item_weight_value', {
                required: 'Item weight is required',
                min: { value: 0.01, message: 'Weight must be greater than 0' }
              })}
              type="number"
              step="0.01"
              label="Item Weight"
              placeholder="0.00"
              errorMessage={errors.item_weight_value?.message}
              isInvalid={!!errors.item_weight_value}
            />
            <Select
              {...register('item_weight_unit')}
              label="Weight Unit"
              defaultSelectedKeys={['kg']}
            >
              <SelectItem key="kg" value="kg">kg</SelectItem>
              <SelectItem key="lb" value="lb">lb</SelectItem>
            </Select>
            <Input
              {...register('item_sku')}
              label="SKU (Optional)"
              placeholder="Enter SKU"
            />
            <Input
              {...register('item_hs_code')}
              label="HS Code (Optional)"
              placeholder="Enter HS code"
            />
          </div>
        </CardBody>
      </Card>


      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          color="primary"
          size="lg"
          isLoading={isLoading}
          startContent={!isLoading && <Icon icon="solar:calculator-bold" />}
          className="min-w-[200px]"
        >
          {isLoading ? 'Calculating Rates...' : 'Calculate Shipping Rates'}
        </Button>
      </div>
    </form>
  )
}

export default RateCalculatorForm

{/* {...register('delivery_instructions')} */}