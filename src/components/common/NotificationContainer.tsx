import React from 'react'
import { Card, CardBody, Button } from '@heroui/react'
import { Icon } from '@iconify/react'
import { useNotification } from '@context/NotificationContext'
import type { NotificationType } from '@context/NotificationContext'

const NotificationContainer: React.FC = () => {
  const { notifications, hideNotification } = useNotification()

  const getNotificationConfig = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          icon: 'solar:check-circle-bold',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500',
          iconColor: 'text-green-500',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700'
        }
      case 'error':
        return {
          icon: 'solar:close-circle-bold',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          iconColor: 'text-red-500',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700'
        }
      case 'warning':
        return {
          icon: 'solar:danger-triangle-bold',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-500',
          iconColor: 'text-yellow-500',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700'
        }
      case 'info':
        return {
          icon: 'solar:info-circle-bold',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-500',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700'
        }
      default:
        return {
          icon: 'solar:info-circle-bold',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-500',
          iconColor: 'text-gray-500',
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-700'
        }
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl space-y-4">
        {notifications.map((notification) => {
          const config = getNotificationConfig(notification.type)

          return (
            <Card
              key={notification.id}
              className={`${config.bgColor} ${config.borderColor} border-4 shadow-xl w-full h-64 animate-in fade-in duration-300`}
              shadow="none"
            >
              <CardBody className="p-8 flex flex-col justify-center">
                <div className="flex items-start space-x-6">
                  {/* Icon */}
                  <div className={`${config.iconColor} flex-shrink-0`}>
                    <Icon icon={config.icon} className="w-10 h-10" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {notification.title && (
                      <h4 className={`text-2xl font-bold ${config.titleColor} mb-3`}>
                        {notification.title}
                      </h4>
                    )}
                    <p
                      className={`text-lg ${config.messageColor} whitespace-pre-line break-words leading-relaxed`}
                    >
                      {notification.message}
                    </p>

                    {notification.action && (
                      <div className="mt-6">
                        <Button
                          size="lg"
                          variant="solid"
                          color={notification.type === 'error' ? 'danger' : 'primary'}
                          onPress={notification.action.onClick}
                        >
                          {notification.action.label}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => hideNotification(notification.id)}
                    className={`${config.iconColor} hover:opacity-70 flex-shrink-0 transition-opacity`}
                  >
                    <Icon icon="solar:close-square-bold" className="w-8 h-8" />
                  </button>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default NotificationContainer