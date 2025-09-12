import { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useAuth } from '@context/AuthContext'
import { DEFAULT_FORM_VALUES } from '../constants/form-defaults'
import type { ShipmentFormData } from '../types/shipment-form.types'

export const useShipmentForm = () => {
  const { user, approver } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const formMethods = useForm<ShipmentFormData>({
    defaultValues: DEFAULT_FORM_VALUES
  })

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = formMethods

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

  return {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    errors,
    onSubmit,
    isSubmitting,
    today
  }
}