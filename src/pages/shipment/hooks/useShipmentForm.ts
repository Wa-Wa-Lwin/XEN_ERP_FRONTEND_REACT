import { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useAuth } from '@context/AuthContext'
import { DEFAULT_FORM_VALUES } from '../constants/form-defaults'
import type { ShipmentFormData } from '../types/shipment-form.types'

export const useShipmentForm = () => {
  const { user, approver, msLoginUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const formMethods = useForm<ShipmentFormData>({
    defaultValues: DEFAULT_FORM_VALUES
  })

  const { register, control, handleSubmit, watch, setValue, getValues, formState: { errors } } = formMethods

  const onSubmit = async (data: ShipmentFormData) => {
    if (!msLoginUser) {
      alert('User authentication required')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = {
        ...data,
        // Auto-bind from auth context - use msLoginUser if no DB data
        created_user_id: user?.userID || 0,
        created_user_name: user ? (user.firstName + ' ' + user.lastName) : msLoginUser.name,
        created_user_mail: user?.email || msLoginUser.email,
        approver_user_id: approver?.userID || 0,
        approver_user_name: approver ? (approver.firstName + ' ' + approver.lastName) : msLoginUser.name,
        approver_user_mail: approver?.email || msLoginUser.email
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

      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data

        // Handle API validation errors
        if (errorData.meta?.details && Array.isArray(errorData.meta.details)) {
          const errorMessages = errorData.meta.details.map((detail: any) =>
            `${detail.path}: ${detail.info}`
          ).join('\n')

          alert(`Submission failed with validation errors:\n\n${errorMessages}`)
        } else if (errorData.meta?.message) {
          alert(`Submission failed: ${errorData.meta.message}`)
        } else {
          alert('Error submitting shipment request. Please check your form data and try again.')
        }
      } else {
        alert('Error submitting shipment request. Please check your internet connection and try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    errors,
    onSubmit,
    isSubmitting,
    today
  }
}