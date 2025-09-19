import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '@context/AuthContext'
import { useNotification } from '@context/NotificationContext'
import { DEFAULT_FORM_VALUES } from '../constants/form-defaults'
import type { ShipmentFormData } from '../types/shipment-form.types'

export const useShipmentForm = () => {
  const { user, approver, msLoginUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { success, error: showError } = useNotification()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formMethods = useForm<ShipmentFormData>({
    defaultValues: DEFAULT_FORM_VALUES
  })

  const { register, control, handleSubmit, watch, setValue, getValues, trigger, reset, formState: { errors } } = formMethods

  // Load duplicate data if URL contains duplicate parameter
  useEffect(() => {
    const isDuplicate = searchParams.get('duplicate') === 'true'
    if (isDuplicate) {
      const duplicateDataString = sessionStorage.getItem('duplicateShipmentData')
      if (duplicateDataString) {
        try {
          const duplicateData = JSON.parse(duplicateDataString)
          console.log('Loading duplicate shipment data:', duplicateData)

          // Reset form with the duplicate data
          reset({
            ...DEFAULT_FORM_VALUES,
            ...duplicateData
          })

          // Clear the session storage after loading
          sessionStorage.removeItem('duplicateShipmentData')

          // Show success message
          success('Shipment data loaded for duplication. Please review and modify as needed before submitting.', 'Duplicate Data Loaded')
        } catch (error) {
          console.error('Error loading duplicate data:', error)
          showError('Failed to load duplicate shipment data', 'Loading Error')
        }
      }
    }
  }, [searchParams, reset, success, showError])

  const onSubmit = async (data: ShipmentFormData) => {
    if (!msLoginUser) {
      showError('User authentication required', 'Authentication Error')
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

      if (response.status === 200 || response.status === 201) {
        success('Shipment request created successfully!', 'Success')
        // Reset form and redirect to shipment list
        // Use setTimeout to ensure the state updates complete before navigation
        setTimeout(() => {
          reset()
          navigate('/shipment')
        }, 100)
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

          showError(`Submission failed with validation errors:\n\n${errorMessages}`, 'Validation Error')
        } else if (errorData.meta?.message) {
          showError(`Submission failed: ${errorData.meta.message}`, 'Submission Failed')
        } else {
          showError('Error submitting shipment request. Please check your form data and try again.', 'Submission Error')
        }
      } else {
        showError('Error submitting shipment request. Please check your internet connection and try again.', 'Connection Error')
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
    trigger,
    reset,
    errors,
    onSubmit,
    isSubmitting,
    today
  }
}