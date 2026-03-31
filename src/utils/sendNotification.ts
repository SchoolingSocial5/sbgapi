import { Notification } from '../models/message/notificationModel'
import { NotificationTemplate } from '../models/message/notificationTemplateModel'
import { ITransaction } from '../models/transactionModel'
import { IUser } from '../models/users/userModel'
import { formatMoney } from './helper'

interface NotificationData {
  user: IUser
  transaction: ITransaction
}

export const sendNotification = async (
  templateName: string,
  data: NotificationData
) => {
  const notificationTemp = await NotificationTemplate.findOne({
    name: templateName,
  })

  if (!notificationTemp) {
    throw new Error(`Notification template '${templateName}' not found.`)
  }

  const content = notificationTemp.content
    .replace('{{username}}', data.user.username)
    .replace('{{full_name}}', data.user.fullName)
    .replace('{{part_payment}}', formatMoney(data.transaction.partPayment))
    .replace('{{total_payment}}', formatMoney(data.transaction.totalAmount))
    .replace('{{total_amount}}', formatMoney(data.transaction.totalAmount))
    .replace(
      '{{remaining_payment}}',
      formatMoney(data.transaction.totalAmount - data.transaction.partPayment)
    )

  const notification = await Notification.create({
    greetings: notificationTemp.greetings,
    name: notificationTemp.name,
    title: notificationTemp.title,
    username: data.user.username,
    fullName: data.user.fullName,
    picture: data.user.picture,
    content,
  })

  const unread = await Notification.countDocuments({
    unread: true,
  })

  return { notification, unread }
}
